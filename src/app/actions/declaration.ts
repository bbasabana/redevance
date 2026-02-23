"use server";

import { db } from "@/db";
import { assujettis, declarations, lignesDeclaration, notesTaxation, taxationRules, geographies } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateDevicesSchema = z.object({
    nbTv: z.number().min(0).max(999),
    nbRadio: z.number().min(0).max(999),
});

export async function updateDeviceCounts(data: z.infer<typeof UpdateDevicesSchema>) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Non autorisé" };

        const validated = UpdateDevicesSchema.parse(data);

        // 1. Get Assujetti
        const [profile] = await db
            .select()
            .from(assujettis)
            .where(eq(assujettis.userId, session.user.id))
            .limit(1);

        if (!profile) return { success: false, error: "Profil assujetti non trouvé" };

        // 2. Get latest declaration for current exercise
        const currentYear = new Date().getFullYear();
        const [latestDecl] = await db
            .select()
            .from(declarations)
            .where(and(
                eq(declarations.assujettiId, profile.id),
                eq(declarations.exercice, currentYear)
            ))
            .orderBy(desc(declarations.createdAt))
            .limit(1);

        if (!latestDecl) return { success: false, error: "Aucune déclaration trouvée pour cet exercice" };

        // 3. Perform update in a transaction
        await db.transaction(async (tx) => {
            // Update declaration total count
            await tx.update(declarations)
                .set({
                    totalAppareils: validated.nbTv + validated.nbRadio,
                    updatedAt: new Date(),
                })
                .where(eq(declarations.id, latestDecl.id));

            // Get existing lines
            const lines = await tx
                .select()
                .from(lignesDeclaration)
                .where(eq(lignesDeclaration.declarationId, latestDecl.id));

            // Resolve Geography Category for pricing
            let category: string | null = null;
            let tempGeoId = profile.communeId;
            while (tempGeoId) {
                const [geo] = await tx.select().from(geographies).where(eq(geographies.id, tempGeoId)).limit(1);
                if (!geo) break;
                if (geo.category) {
                    category = geo.category;
                    break;
                }
                tempGeoId = geo.parentId as string;
            }

            if (!category) throw new Error("Catégorie géographique introuvable pour le calcul du tarif");

            // Fetch pricing rule
            const [rule] = await tx
                .select()
                .from(taxationRules)
                .where(and(
                    eq(taxationRules.category, category as any),
                    eq(taxationRules.entityType, profile.sousTypePm as any)
                ))
                .limit(1);

            if (!rule) throw new Error("Règle de taxation introuvable pour votre profil");
            const pu = Number(rule.price);

            // Update TV Line
            const tvLine = lines.find(l => l.categorieAppareil === "Téléviseurs");
            if (tvLine) {
                await tx.update(lignesDeclaration)
                    .set({
                        nombre: validated.nbTv,
                        montantLigne: (validated.nbTv * pu).toString(),
                    })
                    .where(eq(lignesDeclaration.id, tvLine.id));
            } else if (validated.nbTv > 0) {
                await tx.insert(lignesDeclaration).values({
                    declarationId: latestDecl.id,
                    categorieAppareil: "Téléviseurs",
                    nombre: validated.nbTv,
                    tarifUnitaire: pu.toString(),
                    montantLigne: (validated.nbTv * pu).toString(),
                });
            }

            // Update Radio Line
            const radioLine = lines.find(l => l.categorieAppareil === "Radios");
            const hasTv = validated.nbTv > 0;
            // Following business logic: if TV exists, Radio is recorded but not factured (pu=0 logic or priority)
            // In completeIdentification, totalUSD only counts one type if prioritizing.

            if (radioLine) {
                await tx.update(lignesDeclaration)
                    .set({
                        nombre: validated.nbRadio,
                        montantLigne: (hasTv ? 0 : (validated.nbRadio * pu)).toString(),
                        remarque: hasTv ? "Utilisé comme base mais non facturé (TV prioritaire)" : null
                    })
                    .where(eq(lignesDeclaration.id, radioLine.id));
            } else if (validated.nbRadio > 0) {
                await tx.insert(lignesDeclaration).values({
                    declarationId: latestDecl.id,
                    categorieAppareil: "Radios",
                    nombre: validated.nbRadio,
                    tarifUnitaire: pu.toString(),
                    montantLigne: (hasTv ? 0 : (validated.nbRadio * pu)).toString(),
                    remarque: hasTv ? "Utilisé comme base mais non facturé (TV prioritaire)" : undefined
                });
            }

            // Recalculate Total Note Amount (USD)
            const calculatedTvQty = validated.nbTv > 0 ? validated.nbTv : 0;
            const calculatedRadioQty = validated.nbTv > 0 ? 0 : (validated.nbRadio > 0 ? validated.nbRadio : 0);
            const totalUSD = (calculatedTvQty + calculatedRadioQty) * pu;

            // Update Note de Taxation associated with this declaration
            const [note] = await tx
                .select()
                .from(notesTaxation)
                .where(eq(notesTaxation.declarationId, latestDecl.id))
                .limit(1);

            if (note) {
                await tx.update(notesTaxation)
                    .set({
                        montantBrut: totalUSD.toString(),
                        montantNet: totalUSD.toString(),
                        montantTotalDu: totalUSD.toString(),
                        updatedAt: new Date(),
                    })
                    .where(eq(notesTaxation.id, note.id));
            }
        });

        revalidatePath("/assujetti/profil/appareils");
        revalidatePath("/assujetti/dashboard");
        revalidatePath("/assujetti/redevance/en-cours");

        return { success: true };
    } catch (error: any) {
        console.error("Error updating devices:", error);
        return { success: false, error: error.message || "Erreur lors de la mise à jour" };
    }
}
