"use server";

import { db } from "@/db";
import { notesTaxation, lignesDeclaration, declarations, assujettis, communes, provinces } from "@/db/schema";
import { sql, eq, and, desc, sum, count } from "drizzle-orm";

export async function getAdminKpis() {
    try {
        // Encaissé total (status logic: assume 'payee' for now, or sum of all if total view)
        const [revenueData] = await db
            .select({
                totalEncaisse: sum(notesTaxation.montantNet),
                totalEmis: sum(notesTaxation.montantBrut),
                countNotes: count(notesTaxation.id),
            })
            .from(notesTaxation);

        // Assujettis totaux
        const [assujettisCount] = await db
            .select({ count: count(assujettis.id) })
            .from(assujettis);

        // Equipment counts
        const [equipmentStats] = await db
            .select({
                tvCount: sql<number>`SUM(CASE WHEN ${lignesDeclaration.categorieAppareil} ILIKE '%TV%' OR ${lignesDeclaration.categorieAppareil} ILIKE '%Televiseur%' THEN ${lignesDeclaration.nombre} ELSE 0 END)`,
                radioCount: sql<number>`SUM(CASE WHEN ${lignesDeclaration.categorieAppareil} ILIKE '%Radio%' THEN ${lignesDeclaration.nombre} ELSE 0 END)`,
            })
            .from(lignesDeclaration);

        return {
            totalRevenue: Number(revenueData.totalEncaisse || 0),
            totalForecast: Number(revenueData.totalEmis || 0),
            totalAssujettis: Number(assujettisCount.count || 0),
            totalDevices: Number(equipmentStats.tvCount || 0) + Number(equipmentStats.radioCount || 0),
            tvCount: Number(equipmentStats.tvCount || 0),
            radioCount: Number(equipmentStats.radioCount || 0),
            efficiency: revenueData.totalEmis ? (Number(revenueData.totalEncaisse) / Number(revenueData.totalEmis)) * 100 : 0
        };
    } catch (error) {
        console.error("Error fetching admin KPIs:", error);
        return null;
    }
}

export async function getRevenueTimeline() {
    try {
        // Simple monthly aggregation
        // We use created_at from notesTaxation
        const stats = await db
            .select({
                month: sql<string>`TO_CHAR(${notesTaxation.createdAt}, 'Mon')`,
                monthNum: sql<number>`EXTRACT(MONTH FROM ${notesTaxation.createdAt})`,
                amount: sum(notesTaxation.montantNet),
            })
            .from(notesTaxation)
            .groupBy(sql`TO_CHAR(${notesTaxation.createdAt}, 'Mon')`, sql`EXTRACT(MONTH FROM ${notesTaxation.createdAt})`)
            .orderBy(sql`EXTRACT(MONTH FROM ${notesTaxation.createdAt})`);

        return stats.map(s => ({
            name: s.month,
            value: Number(s.amount || 0)
        }));
    } catch (error) {
        console.error("Error fetching revenue timeline:", error);
        return [];
    }
}

export async function getGeographicPerformance() {
    try {
        const stats = await db
            .select({
                commune: communes.nom,
                amount: sum(notesTaxation.montantNet),
                quota: sql<number>`COUNT(${assujettis.id}) * 150`, // Mock quota logic: 150$ per assujetti for visualization
            })
            .from(notesTaxation)
            .innerJoin(assujettis, eq(notesTaxation.assujettiId, assujettis.id))
            .innerJoin(communes, eq(assujettis.communeId, communes.id))
            .groupBy(communes.nom)
            .orderBy(desc(sum(notesTaxation.montantNet)))
            .limit(10);

        return stats.map(s => ({
            name: s.commune,
            revenue: Number(s.amount || 0),
            quota: Number(s.quota || 0)
        }));
    } catch (error) {
        console.error("Error fetching geographic performance:", error);
        return [];
    }
}

export async function getReportData() {
    try {
        const kpis = await getAdminKpis();
        const timeline = await getRevenueTimeline();
        const geoStats = await getGeographicPerformance();

        if (!kpis) throw new Error("KPIs not found");

        // Format for SummaryReportPDF
        return {
            stats: {
                totalTaxed: kpis.totalForecast,
                totalCollected: kpis.totalRevenue,
                collectionRate: kpis.efficiency,
                totalOverdue: Math.max(0, kpis.totalForecast - kpis.totalRevenue),
            },
            evolution: timeline.map(t => ({
                name: t.name,
                taxed: t.value * 1.2, // Projection or separate query if needed
                collected: t.value
            })),
            distribution: geoStats.map(g => ({
                name: g.name,
                value: g.revenue
            }))
        };
    } catch (error) {
        console.error("Error fetching report data:", error);
        return null;
    }
}
