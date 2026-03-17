"use server";

import { db } from "@/db";
import { assujettis, paiements, notesTaxation, appUsers, geographies, declarations, lignesDeclaration } from "@/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export type AssujettiFinancialRow = {
    id: string;
    identifiantFiscal: string | null;
    nomRaisonSociale: string;
    typePersonne: string;
    commune: string | null;
    totalDu: number;
    totalPaye: number;
    statut: string | null;
    dernierPaiement: Date | null;
};

export async function getAssujettisFinancialListAction(): Promise<{ success: true; data: AssujettiFinancialRow[] } | { success: false; error: string }> {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
        return { success: false, error: "Non autorisé" };
    }

    try {
        // Query to get all assujettis with their summed financial data
        // We use a subquery or custom SQL to sum payments and notes
        const rows = await db.select({
            id: assujettis.id,
            identifiantFiscal: assujettis.identifiantFiscal,
            nomRaisonSociale: assujettis.nomRaisonSociale,
            typePersonne: assujettis.typePersonne,
            commune: geographies.nom,
            statut: assujettis.statut,
            totalDu: sql<string>`COALESCE((SELECT SUM(montant_total_du) FROM ${notesTaxation} WHERE assujetti_id = ${assujettis.id}), 0)`,
            totalPaye: sql<string>`COALESCE((SELECT SUM(montant) FROM ${paiements} WHERE assujetti_id = ${assujettis.id} AND statut = 'confirme'), 0)`,
            dernierPaiement: sql<Date>`(SELECT MAX(date_paiement) FROM ${paiements} WHERE assujetti_id = ${assujettis.id} AND statut = 'confirme')`,
        })
        .from(assujettis)
        .leftJoin(geographies, eq(assujettis.communeId, geographies.id))
        .orderBy(desc(assujettis.createdAt));

        return {
            success: true,
            data: rows.map(r => ({
                ...r,
                totalDu: Number(r.totalDu),
                totalPaye: Number(r.totalPaye),
            }))
        };
    } catch (error: any) {
        console.error("Error fetching assujettis financial list:", error);
        return { success: false, error: error.message || "Erreur serveur" };
    }
}

export async function getAssujettiDetailsAction(id: string) {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
        return { success: false, error: "Non autorisé" };
    }

    try {
        const [assujetti] = await db.select()
            .from(assujettis)
            .where(eq(assujettis.id, id))
            .limit(1);

        if (!assujetti) return { success: false, error: "Assujetti non trouvé" };

        const history = await db.select()
            .from(paiements)
            .where(eq(paiements.assujettiId, id))
            .orderBy(desc(paiements.datePaiement));

        const notes = await db.select()
            .from(notesTaxation)
            .where(eq(notesTaxation.assujettiId, id))
            .orderBy(desc(notesTaxation.exercice));

        const decls = await db.select()
            .from(declarations)
            .where(eq(declarations.assujettiId, id))
            .orderBy(desc(declarations.exercice));
        
        // Fetch detailed lines for all declarations of this assujetti
        const declarationIds = decls.map(d => d.id);
        let lines: any[] = [];
        if (declarationIds.length > 0) {
            lines = await db.select()
                .from(lignesDeclaration)
                .where(sql`${lignesDeclaration.declarationId} IN ${declarationIds}`);
        }

        return {
            success: true,
            data: {
                assujetti,
                paiements: history,
                notes,
                declarations: decls.map(d => ({
                    ...d,
                    lignes: lines.filter(l => l.declarationId === d.id)
                }))
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
