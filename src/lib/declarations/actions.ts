"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { declarations, lignesDeclaration, notesTaxation, assujettis } from "@/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { calculateTaxationWithDB, DeviceSelection } from "./calcul";
import { generateNoteNumber, calculateDeadline } from "@/lib/utils/taxation-utils";
import { communes as communesTable } from "@/db/schema";
import { z } from "zod";

const declarationSchema = z.object({
    exercice: z.number().int(),
    devices: z.array(z.object({
        category: z.string(),
        subCategory: z.string().optional(),
        operator: z.string().optional(),
        count: z.number().int().positive(),
        unitPrice: z.number().positive(),
    })),
    remarques: z.string().optional(),
});

export async function createDeclaration(data: z.infer<typeof declarationSchema>) {
    try {
        const session = await auth();
        if (!session?.user?.id || (session.user as any).userType !== "app") {
            return { success: false, error: "UNAUTHORIZED" };
        }

        const userId = session.user.id;
        const validatedData = declarationSchema.parse(data);

        // 1. Get Assujetti ID
        const [assujetti] = await db.select().from(assujettis).where(eq(assujettis.userId, userId)).limit(1);
        if (!assujetti) {
            return { success: false, error: "ASSUJETTI_NOT_FOUND" };
        }

        // 2. Check for existing declaration this exercice
        const [existing] = await db.select()
            .from(declarations)
            .where(sql`${declarations.assujettiId} = ${assujetti.id} AND ${declarations.exercice} = ${validatedData.exercice}`)
            .limit(1);

        // 3. Perform Calculations
        const results = await calculateTaxationWithDB(
            validatedData.devices,
            assujetti.typePersonne,
            assujetti.zoneTarifaire
        );

        // 4. Save in Transaction
        const result = await db.transaction(async (tx) => {
            let declarationId = existing?.id;

            if (existing) {
                // Update existing declaration
                await tx.update(declarations)
                    .set({
                        totalAppareils: results.totalAppareils,
                        remarques: validatedData.remarques,
                        updatedAt: new Date(),
                    })
                    .where(eq(declarations.id, existing.id));

                // Delete old lines to replace them
                await tx.delete(lignesDeclaration)
                    .where(eq(lignesDeclaration.declarationId, existing.id));
            } else {
                // Create new declaration
                const [newDeclaration] = await tx.insert(declarations).values({
                    assujettiId: assujetti.id,
                    exercice: validatedData.exercice,
                    dateDeclaration: new Date().toISOString().split("T")[0],
                    totalAppareils: results.totalAppareils,
                    remarques: validatedData.remarques,
                    statut: "soumise",
                }).returning({ id: declarations.id });
                declarationId = newDeclaration.id;
            }

            // Create Lines
            for (const d of validatedData.devices) {
                await tx.insert(lignesDeclaration).values({
                    declarationId: declarationId,
                    categorieAppareil: d.category,
                    sousCategorie: d.subCategory,
                    operateur: d.operator,
                    nombre: d.count,
                    tarifUnitaire: d.unitPrice.toString(),
                    montantLigne: (d.count * d.unitPrice).toString(),
                });
            }

            // 5. Get Commune Prefix for numbering
            const [commune] = await tx.select()
                .from(communesTable)
                .where(eq(communesTable.id, assujetti.communeId!))
                .limit(1);

            const prefix = commune?.prefixeFiscal || "GEN";

            // 6. Generate Note Number
            const [lastNote] = await tx.select()
                .from(notesTaxation)
                .innerJoin(assujettis, eq(notesTaxation.assujettiId, assujettis.id))
                .where(eq(assujettis.communeId, assujetti.communeId!))
                .orderBy(desc(notesTaxation.createdAt))
                .limit(1);

            const sequence = lastNote?.notes_taxation ? (parseInt(lastNote.notes_taxation.numeroNote?.split("-")[3] || "0") + 1) : 1;
            const numeroNote = generateNoteNumber(validatedData.exercice, prefix, sequence);

            // 7. Create or Update Taxation Note (Draft)
            const [existingNote] = await tx.select().from(notesTaxation).where(eq(notesTaxation.declarationId, declarationId)).limit(1);

            if (existingNote) {
                await tx.update(notesTaxation).set({
                    montantBrut: results.montantBrut.toString(),
                    reductionPct: results.reductionPct.toString(),
                    montantReduction: results.montantReduction.toString(),
                    montantNet: results.montantNet.toString(),
                    montantTotalDu: results.montantTotalDu.toString(),
                }).where(eq(notesTaxation.id, existingNote.id));
            } else {
                await tx.insert(notesTaxation).values({
                    numeroNote,
                    assujettiId: assujetti.id,
                    declarationId: declarationId,
                    exercice: validatedData.exercice,
                    montantBrut: results.montantBrut.toString(),
                    reductionPct: results.reductionPct.toString(),
                    montantReduction: results.montantReduction.toString(),
                    montantNet: results.montantNet.toString(),
                    montantTotalDu: results.montantTotalDu.toString(),
                    statut: "brouillon",
                    genereParId: userId,
                });
            }

            return { success: true, declarationId: declarationId, numeroNote: existingNote?.numeroNote || numeroNote };
        });

        // 8. Send Confirmation Email (Async/Fire-and-forget)
        if (result.success && assujetti.email) {
            try {
                // Inline simple import to avoid top-level issues if nodemailer isn't used elsewhere
                const nodemailer = require("nodemailer");
                const transporter = nodemailer.createTransport({
                    // Typical dev setup, should use env vars in production
                    host: process.env.SMTP_HOST || "smtp.gmail.com",
                    port: parseInt(process.env.SMTP_PORT || "587"),
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });

                transporter.sendMail({
                    from: '"RTNC Redevance" <noreply@rtnc.cd>',
                    to: assujetti.email,
                    subject: "Confirmation de votre déclaration",
                    text: `Bonjour ${assujetti.nomRaisonSociale || 'Assujetti'},\n\nVotre déclaration (Ref: ${result.numeroNote}) a été enregistrée avec succès. Notre équipe va l'examiner prochainement.\n\nMerci,\nL'équipe RTNC.`,
                    html: `<div>
                        <h2>Confirmation de Déclaration</h2>
                        <p>Bonjour ${assujetti.nomRaisonSociale || 'Assujetti'},</p>
                        <p>Votre déclaration (Ref: <strong>${result.numeroNote}</strong>) a bien été enregistrée et sera traitée par nos agents.</p>
                        <br/>
                        <p>Cordialement,<br/>L'équipe RTNC.</p>
                    </div>`
                }).catch(console.error); // We don't await this to not block the user response
            } catch (e) {
                console.error("Failed to initialize email transport:", e);
            }
        }

        // 9. Process in-app notification for agents (Placeholder for real notification system)
        try {
            // Ideally, we'd insert into a `notifications` table here
            console.log(`[NOTIFICATION] New declaration ${result.numeroNote} submitted by Assujetti ${assujetti.id}. Requires Agent review.`);
        } catch (e) {
            console.error("Failed to log notification", e);
        }

        return result;
    } catch (error) {
        console.error("Create declaration error:", error);
        return { success: false, error: "INTERNAL_SERVER_ERROR" };
    }
}

export async function submitNoteForSignature(noteId: string) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "UNAUTHORIZED" };

        await db.update(notesTaxation)
            .set({ statut: "en_attente_signature1" })
            .where(eq(notesTaxation.id, noteId));

        return { success: true };
    } catch (error) {
        return { success: false, error: "FAILED_TO_SUBMIT" };
    }
}

export async function signNote(noteId: string, role: "sous_directeur" | "directeur") {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "UNAUTHORIZED" };

        const userId = session.user.id;
        const now = new Date();

        const [note] = await db.select().from(notesTaxation).where(eq(notesTaxation.id, noteId)).limit(1);
        if (!note) return { success: false, error: "NOTE_NOT_FOUND" };

        if (role === "sous_directeur") {
            await db.update(notesTaxation).set({
                signeParSousDirId: userId,
                signeParSousDirAt: now,
                statut: "en_attente_signature2"
            }).where(eq(notesTaxation.id, noteId));
        } else if (role === "directeur") {
            const dateEmission = now.toISOString().split("T")[0];
            const dateEcheance = calculateDeadline(dateEmission).toISOString().split("T")[0];

            await db.update(notesTaxation).set({
                signeParDirecteurId: userId,
                signeParDirecteurAt: now,
                dateEmission,
                dateRemise: dateEmission, // Assuming delivery at emission for simplicity
                dateEcheance,
                statut: "emise"
            }).where(eq(notesTaxation.id, noteId));

            // TODO: Trigger PDF generation & Notifications
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: "SIGNATURE_FAILED" };
    }
}

export async function getDemandesStats() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "UNAUTHORIZED" };
        }

        const userId = session.user.id;

        // 1. Get Assujetti ID
        const [assujetti] = await db.select().from(assujettis).where(eq(assujettis.userId, userId)).limit(1);
        if (!assujetti) {
            return { success: false, error: "ASSUJETTI_NOT_FOUND" };
        }

        // 2. Fetch all declarations for the Assujetti
        const list = await db.select()
            .from(declarations)
            .where(eq(declarations.assujettiId, assujetti.id))
            .orderBy(desc(declarations.createdAt));

        // 3. Calculate Stats
        const totalDemandes = list.length;
        const pendingDemandes = list.filter(d => d.statut === "soumise").length;
        const validatedDemandes = list.filter(d => d.statut === "validee").length;
        const totalDevices = list.reduce((sum, d) => sum + (d.totalAppareils || 0), 0);

        return {
            success: true,
            data: {
                list,
                stats: {
                    total: totalDemandes,
                    pending: pendingDemandes,
                    validated: validatedDemandes,
                    devices: totalDevices
                }
            }
        };
    } catch (error) {
        console.error("Fetch demandes error:", error);
        return { success: false, error: "INTERNAL_SERVER_ERROR" };
    }
}
