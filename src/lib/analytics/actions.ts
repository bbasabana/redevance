"use server";

import { db } from "@/db";
import { notesTaxation, paiements, assujettis, communes, appUsers } from "@/db/schema";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";
import { auth } from "@/auth";

/**
 * Get Global KPIs for the Dashboard
 */
export async function getGlobalStats() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // 1. Total Taxed (Sum of montant_total_du of all emitted notes)
    const taxedRes = await db.select({
        total: sql<number>`sum(${notesTaxation.montantTotalDu})`
    }).from(notesTaxation).where(sql`${notesTaxation.statut} != 'brouillon'`);

    // 2. Total Collected (Sum of confirmed payments)
    const collectedRes = await db.select({
        total: sql<number>`sum(${paiements.montant})`
    }).from(paiements).where(eq(paiements.statut, "confirme"));

    // 3. Active Assujettis Count
    const assujettisRes = await db.select({
        count: sql<number>`count(*)`
    }).from(assujettis).where(sql`${assujettis.statut} != 'exonere'`);

    // 4. Overdue Amount (Estimated)
    const overdueRes = await db.select({
        total: sql<number>`sum(${notesTaxation.montantTotalDu})`
    }).from(notesTaxation).where(eq(notesTaxation.statut, "en_retard"));

    return {
        totalTaxed: Number(taxedRes[0]?.total || 0),
        totalCollected: Number(collectedRes[0]?.total || 0),
        activeAssujettis: Number(assujettisRes[0]?.count || 0),
        totalOverdue: Number(overdueRes[0]?.total || 0),
        collectionRate: taxedRes[0]?.total ? (Number(collectedRes[0]?.total || 0) / Number(taxedRes[0]?.total)) * 100 : 0
    };
}

/**
 * Get Monthly Evolution of Taxation vs Collection
 */
export async function getMonthlyEvolution(year: number = new Date().getFullYear()) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // Monthly taxation
    const monthlyTaxed = await db.execute(sql`
        SELECT 
            EXTRACT(MONTH FROM ${notesTaxation.dateEmission}) as month,
            SUM(${notesTaxation.montantTotalDu}) as total
        FROM notes_taxation
        WHERE EXTRACT(YEAR FROM ${notesTaxation.dateEmission}) = ${year}
        GROUP BY month
        ORDER BY month ASC
    `);

    // Monthly collection
    const monthlyCollected = await db.execute(sql`
        SELECT 
            EXTRACT(MONTH FROM ${paiements.datePaiement}) as month,
            SUM(${paiements.montant}) as total
        FROM paiements
        WHERE EXTRACT(YEAR FROM ${paiements.datePaiement}) = ${year} AND ${paiements.statut} = 'confirme'
        GROUP BY month
        ORDER BY month ASC
    `);

    // Merge results for Recharts
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = months.map((name, i) => {
        const monthNum = i + 1;
        const taxed = (monthlyTaxed.rows as any[]).find(r => Number(r.month) === monthNum)?.total || 0;
        const collected = (monthlyCollected.rows as any[]).find(r => Number(r.month) === monthNum)?.total || 0;
        return { name, taxed: Number(taxed), collected: Number(collected) };
    });

    return data;
}

/**
 * Get Distribution by Commune
 */
export async function getDistributionByCommune() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const results = await db.select({
        name: communes.nom,
        value: sql<number>`count(${assujettis.id})`
    })
        .from(communes)
        .leftJoin(assujettis, eq(assujettis.communeId, communes.id))
        .groupBy(communes.nom);

    return results.map(r => ({ name: r.name, value: Number(r.value) }));
}

/**
 * Get Agent Performance metrics
 */
export async function getAgentPerformance() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const results = await db.select({
        agentName: appUsers.nomPrenom,
        assujettisCount: sql<number>`count(distinct ${assujettis.id})`,
        notesCount: sql<number>`count(distinct ${notesTaxation.id})`,
        totalTaxed: sql<number>`sum(${notesTaxation.montantTotalDu})`
    })
        .from(appUsers)
        .leftJoin(assujettis, eq(assujettis.agentCreateurId, appUsers.id))
        .leftJoin(notesTaxation, eq(notesTaxation.genereParId, appUsers.id))
        .groupBy(appUsers.nomPrenom);

    return results;
}
