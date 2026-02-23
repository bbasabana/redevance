import { db } from "@/db";
import { tarifs as tarifsTable } from "@/db/schema";
import { and, eq, lte, or, isNull } from "drizzle-orm";

export type DeviceSelection = {
    category: string;
    subCategory?: string;
    operator?: string;
    count: number;
    unitPrice?: number; // Optional if fetching from DB
};


export async function calculateTaxationWithDB(
    devices: DeviceSelection[],
    typePersonne: "pp" | "pm" | "pp_advantage" | "pm_advantage",
    zoneTarifaire: "urbaine" | "rurale"
) {
    const totalAppareils = devices.reduce((sum, d) => sum + d.count, 0);
    let montantBrut = 0;

    // Fetch relevant tarifs for the categories
    const allTarifs = await db.select()
        .from(tarifsTable)
        .where(
            and(
                eq(tarifsTable.typePersonne, typePersonne),
                eq(tarifsTable.zoneTarifaire, zoneTarifaire),
                eq(tarifsTable.isActive, true)
            )
        );

    const itemsWithPrices = devices.map(device => {
        const tarif = allTarifs.find(t => t.categorieAppareil === device.category);
        const unitPrice = device.unitPrice ?? parseFloat(tarif?.tarifUnitaire || "0");
        const total = device.count * unitPrice;
        montantBrut += total;

        return {
            ...device,
            unitPrice,
            total
        };
    });

    // Rule: 25% reduction if >= 51 devices
    let reductionPct = 0;
    if (totalAppareils >= 51) {
        reductionPct = 25;
    }

    const montantReduction = (montantBrut * reductionPct) / 100;
    const montantNet = montantBrut - montantReduction;

    return {
        totalAppareils,
        montantBrut,
        reductionPct,
        montantReduction,
        montantNet,
        montantTotalDu: montantNet,
        items: itemsWithPrices
    };
}

export function calculateTaxation(
    devices: DeviceSelection[]
) {
    const totalAppareils = devices.reduce((sum, d) => sum + d.count, 0);
    let montantBrut = 0;

    const itemsWithPrices = devices.map(device => {
        const unitPrice = device.unitPrice || 0;
        const total = device.count * unitPrice;
        montantBrut += total;

        return {
            ...device,
            unitPrice,
            total
        };
    });

    let reductionPct = 0;
    if (totalAppareils >= 51) {
        reductionPct = 25;
    }

    const montantReduction = (montantBrut * reductionPct) / 100;
    const montantNet = montantBrut - montantReduction;

    return {
        totalAppareils,
        montantBrut,
        reductionPct,
        montantReduction,
        montantNet,
        montantTotalDu: montantNet,
        items: itemsWithPrices
    };
}
