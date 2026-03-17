"use server";

import { db } from "@/db";
import { appUsers, controlesTerrain, notesRectificativesTerrain, assujettis, userRoles, roles, geographies } from "@/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export type AgentPerformanceRow = {
    id: string;
    identifiantAgent: string | null;
    nomPrenom: string;
    commune: string | null;
    nbControles: number;
    montantRecouvre: number;
    dernierControle: Date | null;
};

export async function getAgentPerformanceListAction(): Promise<{ success: true; data: AgentPerformanceRow[] } | { success: false; error: string }> {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
        return { success: false, error: "Non autorisé" };
    }

    try {
        // Query to get agent performance
        // Filter by role 'agent'
        const rows = await db.select({
            id: appUsers.id,
            identifiantAgent: appUsers.identifiantAgent,
            nomPrenom: appUsers.nomPrenom,
            commune: geographies.nom,
            nbControles: sql<string>`COUNT(${controlesTerrain.id})`,
            montantRecouvre: sql<string>`COALESCE(SUM(CAST(${notesRectificativesTerrain.montantTotal} AS DECIMAL)), 0)`,
            dernierControle: sql<Date>`MAX(${controlesTerrain.dateControle})`,
        })
        .from(appUsers)
        .innerJoin(userRoles, eq(appUsers.id, userRoles.userId))
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .leftJoin(geographies, eq(appUsers.assignedCommuneId, geographies.id))
        .leftJoin(controlesTerrain, eq(appUsers.id, controlesTerrain.agentId))
        .leftJoin(notesRectificativesTerrain, eq(controlesTerrain.id, notesRectificativesTerrain.controleId))
        .where(eq(roles.name, 'agent'))
        .groupBy(appUsers.id, appUsers.identifiantAgent, appUsers.nomPrenom, geographies.nom)
        .orderBy(desc(sql`montant_recouvre`));

        return {
            success: true,
            data: rows.map(r => ({
                ...r,
                nbControles: Number(r.nbControles),
                montantRecouvre: Number(r.montantRecouvre),
            }))
        };
    } catch (error: any) {
        console.error("Error fetching agent performance list:", error);
        return { success: false, error: error.message || "Erreur serveur" };
    }
}

export async function getAgentActivityDetailAction(agentId: string) {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
        return { success: false, error: "Non autorisé" };
    }

    try {
        const activities = await db.select({
            id: controlesTerrain.id,
            date: controlesTerrain.dateControle,
            assujetti: assujettis.nomRaisonSociale,
            exercice: controlesTerrain.exercice,
            montant: notesRectificativesTerrain.montantTotal,
            statutPaiement: notesRectificativesTerrain.statutPaiement,
        })
        .from(controlesTerrain)
        .innerJoin(assujettis, eq(controlesTerrain.assujettiId, assujettis.id))
        .leftJoin(notesRectificativesTerrain, eq(controlesTerrain.id, notesRectificativesTerrain.controleId))
        .where(eq(controlesTerrain.agentId, agentId))
        .orderBy(desc(controlesTerrain.dateControle));

        return {
            success: true,
            data: activities
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
