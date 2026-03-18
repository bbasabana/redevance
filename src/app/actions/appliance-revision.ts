"use server";

import { db } from "@/db";
import { notesTaxation, assujettis, declarations, lignesDeclaration, taxationRules, geographies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";

const UpdateAppliancesSchema = z.object({
    noteId: z.string().uuid(),
    nbTv: z.number().min(0),
    nbRadio: z.number().min(0),
});

export async function updateApplianceCount(data: z.infer<typeof UpdateAppliancesSchema>) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Non authentifié" };

        const validated = UpdateAppliancesSchema.parse(data);

        await db.transaction(async (tx) => {
            // 1. Fetch the note and its linked declaration
            const [note] = await tx
                .select()
                .from(notesTaxation)
                .where(eq(notesTaxation.id, validated.noteId))
                .limit(1);

            if (!note || !note.declarationId || !note.assujettiId) throw new Error("Note ou déclaration introuvable");

            const [assujetti] = await tx
                .select()
                .from(assujettis)
                .where(eq(assujettis.id, note.assujettiId))
                .limit(1);

            if (!assujetti || !assujetti.communeId) throw new Error("Assujetti ou localisation introuvable");

            // 2. Resolve pricing category (reuse logic from taxation.ts)
            let category: string | null = null;
            let currentGeoId = assujetti.communeId;
            while (currentGeoId) {
                const [geo] = await tx.select().from(geographies).where(eq(geographies.id, currentGeoId)).limit(1);
                if (!geo) break;
                if (geo.category) { category = geo.category; break; }
                currentGeoId = geo.parentId as string;
            }

            if (!category) throw new Error("Catégorie de taxation introuvable");

            // 3. Fetch pricing rules
            const rules = await tx.select().from(taxationRules).where(and(
                eq(taxationRules.category, category as any),
                eq(taxationRules.entityType, assujetti.sousTypePm || "pm")
            ));

            const tvRule = rules.find(r => r.categorieAppareil === "Téléviseurs");
            const radioRule = rules.find(r => r.categorieAppareil === "Radios") || tvRule;

            if (!tvRule) throw new Error("Règle de prix TV introuvable");
            
            const puTv = Number(tvRule.price);
            const puRadio = radioRule ? Number(radioRule.price) : puTv;
            const newTotalUSD = (validated.nbTv * puTv) + (validated.nbRadio * puRadio);

            // 4. Update the declaration record
            await tx.update(declarations)
                .set({
                    totalAppareils: validated.nbTv + validated.nbRadio,
                    remarques: (declarations.remarques || "") + `\nActualisation le ${new Date().toLocaleDateString()}: TV ${validated.nbTv}, Radio ${validated.nbRadio}`,
                    updatedAt: new Date()
                })
                .where(eq(declarations.id, note.declarationId));

            // 5. Update lignes declaration (simplified: delete and recreate)
            await tx.delete(lignesDeclaration).where(eq(lignesDeclaration.declarationId, note.declarationId));
            if (validated.nbTv > 0) {
                await tx.insert(lignesDeclaration).values({
                    declarationId: note.declarationId,
                    categorieAppareil: "Téléviseurs",
                    nombre: validated.nbTv,
                    tarifUnitaire: puTv.toString(),
                    montantLigne: (validated.nbTv * puTv).toString(),
                });
            }
            if (validated.nbRadio > 0) {
                await tx.insert(lignesDeclaration).values({
                    declarationId: note.declarationId,
                    categorieAppareil: "Radios",
                    nombre: validated.nbRadio,
                    tarifUnitaire: puRadio.toString(),
                    montantLigne: (validated.nbRadio * puRadio).toString(),
                });
            }

            // 6. Update Note with new total and recalculated balance
            const currentPaid = Number(note.montantPaye || 0);
            const newSolde = Math.max(0, newTotalUSD - currentPaid);

            await tx.update(notesTaxation)
                .set({
                    montantBrut: newTotalUSD.toString(),
                    montantNet: newTotalUSD.toString(),
                    montantTotalDu: newTotalUSD.toString(),
                    solde: newSolde.toString(),
                    statut: newSolde <= 0 ? "payee" : (currentPaid > 0 ? "partiellement_payee" : "emise"),
                    updatedAt: new Date()
                })
                .where(eq(notesTaxation.id, note.id));
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error updating appliances:", error);
        return { success: false, error: error.message || "Erreur lors de l'actualisation" };
    }
}
