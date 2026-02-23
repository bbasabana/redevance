"use server";

import { db } from "@/db";
import { geographies, taxationRules, notesTaxation, assujettis, appUsers, onboardingProgress, declarations, lignesDeclaration, settings } from "@/db/schema";
import { eq, and, not, desc } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { createFullSession } from "@/lib/auth/session";
import { createHmac } from "crypto";

const QR_SECRET = process.env.QR_SECRET || "rtnc-secure-secret-2026-redevance";

export async function generateNoteQRData(note: { id: string | number; montantTotalDu: string | number; numeroNote: string | null }) {
    const safeNumeroNote = note.numeroNote || "PENDING";
    const token = createHmac("sha256", QR_SECRET)
        .update(`${note.id}:${note.montantTotalDu}:${safeNumeroNote}`)
        .digest("hex")
        .substring(0, 16);

    return `RTNCV1:${safeNumeroNote}:${note.montantTotalDu}:${token}`;
}

export async function getPaymentDetails() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Non authentifié" };

        const [assujetti] = await db
            .select()
            .from(assujettis)
            .where(eq(assujettis.userId, session.user.id))
            .limit(1);

        if (!assujetti) return { success: false, error: "Assujetti non trouvé" };

        const [note] = await db
            .select()
            .from(notesTaxation)
            .where(
                and(
                    eq(notesTaxation.assujettiId, assujetti.id),
                    eq(notesTaxation.exercice, new Date().getFullYear())
                )
            )
            .limit(1);

        if (!note) return { success: false, error: "Aucune note en attente pour cet exercice" };

        const qrData = await generateNoteQRData(note);

        return {
            success: true,
            data: {
                note,
                assujetti,
                qrData
            }
        };
    } catch (error) {
        console.error("Error fetching payment details:", error);
        return { success: false, error: "Erreur lors de la récupération des détails de paiement" };
    }
}

export async function getTaxationNotes(filters?: { year?: number; statut?: string }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Non authentifié" };

        const [assujetti] = await db
            .select()
            .from(assujettis)
            .where(eq(assujettis.userId, session.user.id))
            .limit(1);

        if (!assujetti) return { success: false, error: "Assujetti non trouvé" };

        const queryFilters = [eq(notesTaxation.assujettiId, assujetti.id)];

        if (filters?.year) {
            queryFilters.push(eq(notesTaxation.exercice, filters.year));
        }

        if (filters?.statut && filters.statut !== "all") {
            queryFilters.push(eq(notesTaxation.statut, filters.statut as any));
        }

        const notes = await db
            .select()
            .from(notesTaxation)
            .where(and(...queryFilters))
            .orderBy(desc(notesTaxation.exercice), desc(notesTaxation.createdAt));

        return {
            success: true,
            data: notes
        };
    } catch (error) {
        console.error("Error fetching taxation notes:", error);
        return { success: false, error: "Erreur lors de la récupération des notes" };
    }
}

export async function getProvinces() {
    try {
        const result = await db
            .select({ id: geographies.id, nom: geographies.nom })
            .from(geographies)
            .where(eq(geographies.type, "PROVINCE"));
        console.log("Fetched provinces:", result.length);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching provinces:", error);
        return { success: false, error: "Failed to fetch provinces" };
    }
}

export async function getChildrenGeographies(parentId: string) {
    try {
        const result = await db
            .select({
                id: geographies.id,
                nom: geographies.nom,
                type: geographies.type,
                category: geographies.category
            })
            .from(geographies)
            .where(eq(geographies.parentId, parentId));
        console.log(`Fetched children for ${parentId}:`, result.length);
        return { success: true, data: result };
    } catch (error) {
        console.error(`Error fetching children for ${parentId}:`, error);
        return { success: false, error: "Failed to fetch location data" };
    }
}

const CalculateTaxSchema = z.object({
    geographyId: z.string().uuid(),
    entityType: z.enum(["pmta", "ppta", "pm"]),
});

export async function calculateTax(data: z.infer<typeof CalculateTaxSchema>) {
    try {
        const validated = CalculateTaxSchema.parse(data);

        // 1. Find the geography and its category (look up hierarchy if needed)
        let currentGeoId = validated.geographyId;
        let category: string | null = null;

        while (currentGeoId) {
            const [geo] = await db
                .select({
                    category: geographies.category,
                    parentId: geographies.parentId
                })
                .from(geographies)
                .where(eq(geographies.id, currentGeoId))
                .limit(1);

            if (!geo) break;
            if (geo.category) {
                category = geo.category;
                break;
            }
            currentGeoId = geo.parentId as string;
        }

        if (!category) {
            console.error(`[TAX_CALC] No category found for geo ${validated.geographyId} (searched hierarchy)`);
            return { success: false, error: "Catégorie de localisation introuvable pour cet emplacement" };
        }

        console.log(`[TAX_CALC] Found category: ${category} for geo ${validated.geographyId}`);
        console.log(`[TAX_CALC] Searching rule for category: ${category}, entityType: ${validated.entityType}`);

        // 2. Lookup the price in taxation_rules
        const [rule] = await db
            .select({ price: taxationRules.price, currency: taxationRules.currency })
            .from(taxationRules)
            .where(and(
                eq(taxationRules.category, category as any),
                eq(taxationRules.entityType, validated.entityType)
            ))
            .limit(1);

        if (!rule) {
            console.error(`[TAX_CALC] No rule found in database for category=${category}, entityType=${validated.entityType}`);
            return { success: false, error: "Pricing rule not found for this combination" };
        }

        console.log(`[TAX_CALC] Success! Found price: ${rule.price} ${rule.currency}`);
        return { success: true, data: { price: Number(rule.price), currency: rule.currency } };

    } catch (error) {
        console.error("Error calculating tax:", error);
        return { success: false, error: "Failed to calculate tax" };
    }
}

const SaveNoteSchema = z.object({
    montantNet: z.number().positive(),
    devise: z.string().default("USD"),
});

export async function saveNoteTaxation(data: z.infer<typeof SaveNoteSchema>) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Non autorisé" };
        }

        const validated = SaveNoteSchema.parse(data);

        // Generate a random Note Number for now (e.g., NT-2025-001)
        const currentYear = new Date().getFullYear();
        const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const numeroNote = `NT-${currentYear}-${sequence}`;

        // Insert into database (assuming assujetti ID is linked to User ID right now)
        // Note: For a real flow, you'd accurately link assujetti_id and declaration_id

        // This is a simplified insertion for the context of this Note de taxation creation
        await db.insert(notesTaxation).values({
            numeroNote,
            exercice: currentYear,
            montantBrut: validated.montantNet.toString() as any, // Temporary type cast for decimal
            montantNet: validated.montantNet.toString() as any,
            montantTotalDu: validated.montantNet.toString() as any,
            devise: validated.devise,
            statut: "brouillon",
            genereParId: session.user.id
        });

        return { success: true, data: { numeroNote } };

    } catch (error) {
        console.error("Error saving note:", error);
        return { success: false, error: "Erreur lors de la sauvegarde" };
    }
}

const CompleteIdentificationSchema = z.object({
    geographyId: z.string().uuid(),
    structure: z.enum(["societe", "etablissement", "asbl", "autre"]),
    activities: z.array(z.string()),
    autreActivite: z.string().optional(),
    representant: z.string().min(2, "Nom du représentant requis"),
    nbTv: z.number().min(0),
    nbRadio: z.number().min(0),
    numeroImpot: z.string().optional().or(z.literal("")),
    rccm: z.string().optional().or(z.literal("")),
    idNat: z.string().optional().or(z.literal("")),
    adressePhysique: z.string().optional(),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    telephone: z.string().min(8, "Numéro de téléphone trop court").optional().or(z.literal("")),
});

export async function completeIdentification(data: z.infer<typeof CompleteIdentificationSchema>) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Non autorisé" };
        const userId = session.user.id;

        const validated = CompleteIdentificationSchema.parse(data);

        // 0. Prevent Double Submission & Check User Status
        const [appUser] = await db
            .select()
            .from(appUsers)
            .where(eq(appUsers.id, userId))
            .limit(1);

        if (!appUser) return { success: false, error: "Utilisateur introuvable" };
        if (appUser.isActive || appUser.identificationCompleted) {
            return { success: false, error: "Identification déjà complétée pour ce compte.", alreadyCompleted: true };
        }

        // 0.1 Check Uniqueness for Email and Phone
        if (validated.email || validated.telephone) {
            const [assujetti] = await db
                .select()
                .from(assujettis)
                .where(eq(assujettis.userId, userId))
                .limit(1);

            if (!assujetti) return { success: false, error: "Profil assujetti introuvable" };

            if (validated.email) {
                const [existingEmail] = await db
                    .select()
                    .from(assujettis)
                    .where(and(
                        eq(assujettis.email, validated.email),
                        not(eq(assujettis.id, assujetti.id))
                    ))
                    .limit(1);
                if (existingEmail) return { success: false, error: "Cet email est déjà utilisé par une autre entreprise." };
            }

            if (validated.telephone) {
                const [existingPhone] = await db
                    .select()
                    .from(assujettis)
                    .where(and(
                        eq(assujettis.telephonePrincipal, validated.telephone),
                        not(eq(assujettis.id, assujetti.id))
                    ))
                    .limit(1);
                if (existingPhone) return { success: false, error: "Ce numéro de téléphone est déjà utilisé par une autre entreprise." };
            }
        }

        // 1. Determine Classification (PM vs PMTA vs PPTA)
        let sousType: "pm" | "pmta" | "ppta" = "pm";
        const isPMTA = validated.activities.some(a => a !== "autre");
        if (isPMTA) {
            sousType = "pmta";
        }

        // 2. Generate Unique Fiscal ID
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nums = "0123456789";
        const randomStr = (c: string, l: number) => Array.from({ length: l }, () => c[0.1 > 0 ? Math.floor(Math.random() * c.length) : 0]).join(''); // Corrected randomStr logic
        const identifiantFiscal = `${randomStr(chars, 3)}${randomStr(nums, 4)}${randomStr(chars, 1)}`;

        // 3. Find assujetti record for this user (fetch again to be sure or use previous)
        const [assujetti] = await db
            .select()
            .from(assujettis)
            .where(eq(assujettis.userId, userId))
            .limit(1);

        if (!assujetti) return { success: false, error: "Profil assujetti introuvable" };

        // 4. Resolve Address Details for Preview
        let category: string | null = null;
        let addressParts = {
            quartier: "",
            commune: "",
            ville: "",
            province: ""
        };

        let tempGeoId = validated.geographyId;
        while (tempGeoId) {
            const [geo] = await db.select().from(geographies).where(eq(geographies.id, tempGeoId)).limit(1);
            if (!geo) break;
            if (geo.type === "QUARTIER") addressParts.quartier = geo.nom;
            if (geo.type === "COMMUNE") addressParts.commune = geo.nom;
            if (geo.type === "VILLE" || geo.type === "CITE" || geo.type === "TERRITOIRE") addressParts.ville = geo.nom;
            if (geo.type === "PROVINCE") addressParts.province = geo.nom;

            if (geo.category && !category) category = geo.category;
            tempGeoId = geo.parentId as string;
        }

        if (!category) return { success: false, error: "Catégorie géographique introuvable" };

        const [rule] = await db
            .select()
            .from(taxationRules)
            .where(and(
                eq(taxationRules.category, category as any),
                eq(taxationRules.entityType, sousType)
            ))
            .limit(1);

        if (!rule) return { success: false, error: "Règle de taxation introuvable" };

        const pu = Number(rule.price);
        const items = [];
        if (validated.nbTv > 0) {
            items.push({ label: "Téléviseurs", qty: validated.nbTv, pu });
        } else if (validated.nbRadio > 0) {
            items.push({ label: "Radios", qty: validated.nbRadio, pu });
        }

        const calculatedTvQty = validated.nbTv > 0 ? validated.nbTv : 0;
        const calculatedRadioQty = validated.nbTv > 0 ? 0 : (validated.nbRadio > 0 ? validated.nbRadio : 0);

        const totalUSD = (calculatedTvQty + calculatedRadioQty) * pu;
        // 4.1 Fetch Dynamic Exchange Rate
        const [rateSetting] = await db
            .select({ value: settings.value })
            .from(settings)
            .where(eq(settings.key, "exchange_rate_usd_fc"))
            .limit(1);

        const rate = rateSetting ? Number(rateSetting.value) : 2850;
        const totalFC = totalUSD * rate;

        // 5. Persist the data in DB (Transaction)
        const currentYear = new Date().getFullYear();
        let numeroNote = "";
        let qrData = "";

        await db.transaction(async (tx) => {
            // 5.1 Create Declaration
            const [newDecl] = await tx.insert(declarations).values({
                assujettiId: assujetti.id,
                exercice: currentYear,
                dateDeclaration: new Date().toISOString().split('T')[0],
                statut: "validee", // Initial identification is auto-validated
                totalAppareils: validated.nbTv + validated.nbRadio,
            }).returning();

            // 5.2 Create Lignes de Déclaration
            if (validated.nbTv > 0) {
                await tx.insert(lignesDeclaration).values({
                    declarationId: newDecl.id,
                    categorieAppareil: "Téléviseurs",
                    nombre: validated.nbTv,
                    tarifUnitaire: pu.toString(),
                    montantLigne: (validated.nbTv * pu).toString(),
                });
            }
            if (validated.nbRadio > 0) {
                await tx.insert(lignesDeclaration).values({
                    declarationId: newDecl.id,
                    categorieAppareil: "Radios",
                    nombre: validated.nbRadio,
                    tarifUnitaire: pu.toString(),
                    montantLigne: (validated.nbRadio * pu).toString(),
                    remarque: validated.nbTv > 0 ? "Non facturé (TV prioritaire)" : undefined
                });
            }

            // 5.3 Create Note de Taxation
            numeroNote = `NT-${identifiantFiscal}`;
            const [newNote] = await tx.insert(notesTaxation).values({
                assujettiId: assujetti.id,
                declarationId: newDecl.id,
                exercice: currentYear,
                numeroNote,
                montantBrut: totalUSD.toString(),
                montantNet: totalUSD.toString(),
                montantTotalDu: totalUSD.toString(),
                statut: "emise",
                dateEmission: new Date().toISOString().split('T')[0],
                dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days later
            }).returning();

            // Generate QR Data for preview
            qrData = await generateNoteQRData(newNote);

            // 5.4 Update Assujetti backlink
            await tx.update(assujettis)
                .set({
                    identifiantFiscal,
                    typeStructure: validated.structure as any,
                    typeActivite: validated.activities[0] as any,
                    sousTypePm: sousType,
                    nif: validated.numeroImpot,
                    rccm: validated.rccm,
                    idNat: validated.idNat,
                    representantLegal: validated.representant,
                    communeId: validated.geographyId,
                    adresseSiege: validated.adressePhysique,
                    email: validated.email,
                    telephonePrincipal: validated.telephone,
                    profilComplet: true,
                    derniereDeclarationId: newDecl.id,
                    updatedAt: new Date()
                })
                .where(eq(assujettis.id, assujetti.id));

            // 5.5 Update user persistence flags
            await tx.update(appUsers)
                .set({
                    identificationCompleted: true,
                    isActive: true
                })
                .where(eq(appUsers.id, userId));

            await tx.update(onboardingProgress)
                .set({
                    status: "completed",
                    completedAt: new Date(),
                    lastStep: 4,
                })
                .where(eq(onboardingProgress.userId, userId));
        });

        // 6. Instantly update the session cookie
        await createFullSession(session.user.id, "assujetti", true);

        return {
            success: true,
            data: {
                identifiantFiscal,
                sousType,
                pu,
                totalUSD,
                totalFC,
                rate,
                representant: validated.representant,
                adresse: validated.adressePhysique,
                rccm: validated.rccm,
                nif: validated.numeroImpot,
                idNat: validated.idNat,
                location: addressParts,
                items,
                qrData,
                numeroNote
            }
        };

    } catch (error) {
        console.error("Error completing identification:", error);
        return { success: false, error: "Erreur lors de la finalisation" };
    }
}
