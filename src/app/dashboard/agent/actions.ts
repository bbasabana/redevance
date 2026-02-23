"use server";

import { db } from "@/db";
import {
    assujettis,
    appUsers,
    geographies,
    declarations,
    lignesDeclaration,
    taxationRules,
    controlesTerrain,
    notesRectificativesTerrain
} from "@/db/schema";
import { eq, and, or, ilike, sql, count, desc, gte, lt } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function searchAssujettiAction(query: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.userId) return { success: false, error: "Non autorisé" };

        const [agent] = await db.select({
            id: appUsers.id,
            assignedCommuneId: appUsers.assignedCommuneId,
        })
            .from(appUsers)
            .where(eq(appUsers.id, session.user.userId))
            .limit(1);

        if (!agent || !agent.assignedCommuneId) return { success: false, error: "Agent non affecté" };

        const results = await db.select({
            id: assujettis.id,
            identifiantFiscal: assujettis.identifiantFiscal,
            nomRaisonSociale: assujettis.nomRaisonSociale,
            statut: assujettis.statut,
            adresseSiege: assujettis.adresseSiege,
            typePersonne: assujettis.typePersonne,
            nif: assujettis.nif,
            rccm: assujettis.rccm,
            representantLegal: assujettis.representantLegal,
        })
            .from(assujettis)
            .where(
                or(
                    ilike(assujettis.identifiantFiscal, `%${query}%`),
                    ilike(assujettis.nomRaisonSociale, `%${query}%`)
                )
            )
            .limit(10);

        return { success: true, data: results };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAssujettiDetailsAction(id: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.userId) return { success: false, error: "Non autorisé" };

        const [assujetti] = await db.select()
            .from(assujettis)
            .where(eq(assujettis.id, id))
            .limit(1);

        if (!assujetti) return { success: false, error: "Assujetti non trouvé" };

        return { success: true, data: assujetti };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


export async function calculateControlAction(assujettiId: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.userId) return { success: false, error: "Non autorisé" };

        // 1. Get latest declaration for this assujetti
        const [lastDecl] = await db.select()
            .from(declarations)
            .where(eq(declarations.assujettiId, assujettiId))
            .orderBy(desc(declarations.exercice))
            .limit(1);

        if (!lastDecl) {
            return {
                success: true,
                data: {
                    nbTvDeclare: 0,
                    nbRadioDeclare: 0,
                    exercice: new Date().getFullYear(),
                    tarifUnitaire: 10 // Default fallback
                }
            };
        }

        // 2. Get lines for this declaration to sum TVs and Radios
        const lines = await db.select()
            .from(lignesDeclaration)
            .where(eq(lignesDeclaration.declarationId, lastDecl.id));

        const nbTvDeclare = lines
            .filter(l => l.categorieAppareil === 'Téléviseurs' || l.categorieAppareil === 'Televiseur')
            .reduce((sum, l) => sum + (l.nombre || 0), 0);

        const nbRadioDeclare = lines
            .filter(l => l.categorieAppareil === 'Radios' || l.categorieAppareil === 'Radio')
            .reduce((sum, l) => sum + (l.nombre || 0), 0);

        // 3. Get applicable tariff (simplistic for now: take from first line or default)
        const tarifUnitaire = lines.length > 0 ? Number(lines[0].tarifUnitaire) : 10;

        return {
            success: true,
            data: {
                nbTvDeclare,
                nbRadioDeclare,
                exercice: lastDecl.exercice,
                tarifUnitaire
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function saveControlAction(data: {
    assujettiId: string;
    nbTvConstate: number;
    nbRadioConstate: number;
    nbTvDeclare: number;
    nbRadioDeclare: number;
    exercice: number;
    montantPrincipal: number;
    montantPenalite: number;
    montantTotal: number;
    observations?: string;
    geolocalisation?: { lat: number; lng: number } | null;
    activitesConstatees?: string[];
    precisionAutre?: string;
    adresseConstatee?: string;
}) {
    try {
        const session = await getSession();
        if (!session || !session.user.userId) return { success: false, error: "Non autorisé" };

        const result = await db.transaction(async (tx) => {
            // 1. Create Control record
            const [control] = await tx.insert(controlesTerrain).values({
                assujettiId: data.assujettiId,
                agentId: session.user.userId,
                exercice: data.exercice,
                nbTvDeclare: data.nbTvDeclare,
                nbRadioDeclare: data.nbRadioDeclare,
                nbTvConstate: data.nbTvConstate,
                nbRadioConstate: data.nbRadioConstate,
                ecartTv: data.nbTvConstate - data.nbTvDeclare,
                ecartRadio: data.nbRadioConstate - data.nbRadioDeclare,
                activitesConstatees: data.activitesConstatees || [],
                precisionAutre: data.precisionAutre,
                adresseConstatee: data.adresseConstatee,
                observations: data.observations,
                geolocalisation: data.geolocalisation,
                statut: "finalise",
                dateControle: new Date()
            }).returning();

            // 2. Create Rectification Note if there are discrepancies
            if (data.montantTotal > 0) {
                await tx.insert(notesRectificativesTerrain).values({
                    controleId: control.id,
                    assujettiId: data.assujettiId,
                    montantEcart: data.montantPrincipal.toString(),
                    montantPenalite: data.montantPenalite.toString(),
                    montantTotal: data.montantTotal.toString(),
                    statutPaiement: "paye", // In this mobile flow, we assume payment is confirmed before final success
                    datePaiement: new Date(),
                    referencePaiement: `MOMO-${Math.random().toString(36).substring(7).toUpperCase()}`
                });
            }

            return control;
        });

        return { success: true, data: result };
    } catch (error: any) {
        console.error("Save control error:", error);
        return { success: false, error: error.message };
    }
}

export async function getAgentDashboardStats() {
    try {
        const session = await getSession();
        if (!session || !session.user.userId) return { success: false, error: "Non autorisé" };

        const agentId = session.user.userId;

        // 1. Calculate Date Ranges
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 2. Count Daily Controls
        const [dailyControls] = await db
            .select({ count: count() })
            .from(controlesTerrain)
            .where(
                and(
                    eq(controlesTerrain.agentId, agentId),
                    gte(controlesTerrain.dateControle, startOfToday)
                )
            );

        // 3. Sum Monthly Collections
        const [monthlyColl] = await db
            .select({ total: sql<string>`sum(montant_total)` })
            .from(notesRectificativesTerrain)
            .innerJoin(controlesTerrain, eq(notesRectificativesTerrain.controleId, controlesTerrain.id))
            .where(
                and(
                    eq(controlesTerrain.agentId, agentId),
                    gte(notesRectificativesTerrain.datePaiement, startOfMonth)
                )
            );

        // 4. Fetch Recent Controls
        const recent = await db
            .select({
                id: controlesTerrain.id,
                date: controlesTerrain.dateControle,
                assujettiId: assujettis.id,
                nomAssujetti: assujettis.nomRaisonSociale,
                identifiantFiscal: assujettis.identifiantFiscal,
                montantTotal: notesRectificativesTerrain.montantTotal,
                statutPaiement: notesRectificativesTerrain.statutPaiement
            })
            .from(controlesTerrain)
            .innerJoin(assujettis, eq(controlesTerrain.assujettiId, assujettis.id))
            .leftJoin(notesRectificativesTerrain, eq(notesRectificativesTerrain.controleId, controlesTerrain.id))
            .where(eq(controlesTerrain.agentId, agentId))
            .orderBy(desc(controlesTerrain.dateControle))
            .limit(10);

        return {
            success: true,
            data: {
                dailyCount: dailyControls.count || 0,
                monthlyTotal: Number(monthlyColl.total) || 0,
                recentActivities: recent.map(r => ({
                    id: r.id,
                    assujettiName: r.nomAssujetti,
                    assujettiId: r.identifiantFiscal,
                    date: r.date,
                    amount: Number(r.montantTotal) || 0,
                    status: r.statutPaiement === 'paye' ? 'PAYÉ' : (r.montantTotal ? 'NON PAYÉ' : 'CONFORME')
                }))
            }
        };
    } catch (error: any) {
        console.error("Stats Error:", error);
        return { success: false, error: error.message };
    }
}

export async function checkAddressAction(address: string) {
    try {
        if (!address || address.length < 3) return { success: true, exists: false, matches: [] };

        const matches = await db
            .select({
                id: assujettis.id,
                nomRaisonSociale: assujettis.nomRaisonSociale,
                identifiantFiscal: assujettis.identifiantFiscal,
                adresseSiege: assujettis.adresseSiege
            })
            .from(assujettis)
            .where(ilike(assujettis.adresseSiege, `%${address}%`))
            .limit(5);

        return {
            success: true,
            exists: matches.length > 0,
            matches: matches
        };
    } catch (error: any) {
        console.error("Check Address Error:", error);
        return { success: false, error: error.message };
    }
}
