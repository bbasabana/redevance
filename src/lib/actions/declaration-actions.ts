"use server";

import { db } from "@/db";
import { declarations, lignesDeclaration, assujettis } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function submitDeclaration(formData: any) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Non authentifié" };

    try {
        // 1. Get Assujetti ID
        const [profile] = await db
            .select({ id: assujettis.id })
            .from(assujettis)
            .where(eq(assujettis.userId, session.user.id))
            .limit(1);

        if (!profile) return { success: false, error: "Profil non trouvé" };

        // 2. Insert Declaration
        const [newDeclaration] = await db
            .insert(declarations)
            .values({
                assujettiId: profile.id,
                exercice: Number(formData.exercice),
                dateDeclaration: new Date().toISOString().split('T')[0],
                statut: "soumise",
                totalAppareils: formData.totalAppareils,
                signatureAssujettiUrl: formData.signature, // Storing dataURL for now (mocked storage)
                signatureDate: new Date(),
                remarques: formData.remarques,
            })
            .returning({ id: declarations.id });

        // 3. Insert Lines
        const lines = [];

        if (formData.nbTV > 0) {
            lines.push({
                declarationId: newDeclaration.id,
                categorieAppareil: "Téléviseur",
                nombre: Number(formData.nbTV),
                tarifUnitaire: "10",
                montantLigne: (Number(formData.nbTV) * 10).toString(),
            });
        }

        if (formData.nbRadio > 0) {
            lines.push({
                declarationId: newDeclaration.id,
                categorieAppareil: "Poste Radio",
                nombre: Number(formData.nbRadio),
                tarifUnitaire: "5",
                montantLigne: (Number(formData.nbRadio) * 5).toString(),
            });
        }

        Object.entries(formData.decoders).forEach(([id, qty]: [string, any]) => {
            if (Number(qty) > 0) {
                // Find operator price in a real app this would come from the database
                const operators: any = {
                    canal_tout: 45, canal_evasion: 20, canal_essentiel: 10, canal_access: 27,
                    easy_tv: 6.5, startimes_unique: 25, startimes_classique: 20, startimes_base: 12,
                    startimes_nova: 5, dstv_access: 12, dstv_family: 26, dstv_compact_plus: 68,
                    dstv_premium: 105, bluesat_week: 1.75, bluesat_month: 4.56, bluesat_3months: 10.5
                };
                const price = operators[id] || 0;
                lines.push({
                    declarationId: newDeclaration.id,
                    categorieAppareil: "Décodeur",
                    operateur: id,
                    nombre: Number(qty),
                    tarifUnitaire: price.toString(),
                    montantLigne: (Number(qty) * price).toString(),
                });
            }
        });

        if (lines.length > 0) {
            await db.insert(lignesDeclaration).values(lines);
        }

        revalidatePath("/assujetti/dashboard");
        revalidatePath("/assujetti/demandes");

        return {
            success: true,
            id: newDeclaration.id,
            reference: `DEM-${formData.exercice}-${newDeclaration.id.split('-')[0].toUpperCase()}`
        };
    } catch (error) {
        console.error("Error submitting declaration:", error);
        return { success: false, error: "Erreur lors de la soumission" };
    }
}
