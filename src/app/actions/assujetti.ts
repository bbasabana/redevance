"use server";

import { db } from "@/db";
import { assujettis } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const UpdateProfileSchema = z.object({
    nomRaisonSociale: z.string().min(2, "Le nom est requis"),
    nif: z.string().optional().or(z.literal("")),
    rccm: z.string().optional().or(z.literal("")),
    idNat: z.string().optional().or(z.literal("")),
    representantLegal: z.string().min(2, "Le représentant est requis"),
    adresseSiege: z.string().min(5, "L'adresse est requise"),
    typeActivite: z.string().optional(),
    telephonePrincipal: z.string().optional().or(z.literal("")),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    nifUrl: z.string().optional().or(z.literal("")),
    rccmUrl: z.string().optional().or(z.literal("")),
    idNatUrl: z.string().optional().or(z.literal("")),
    activities: z.array(z.string()).optional(),
    autreActivite: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

export async function updateAssujettiProfile(data: z.infer<typeof UpdateProfileSchema>) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Non autorisé" };

        const validated = UpdateProfileSchema.parse(data);

        const [profile] = await db
            .select()
            .from(assujettis)
            .where(eq(assujettis.userId, session.user.id))
            .limit(1);

        if (!profile) return { success: false, error: "Profil non trouvé" };

        const hasDocuments = validated.nifUrl || validated.rccmUrl || validated.idNatUrl;

        await db.update(assujettis)
            .set({
                ...validated,
                typeActivite: validated.activities?.[0] as any || validated.typeActivite as any,
                activites: validated.activities || [],
                precisionAutre: validated.autreActivite,
                latitude: validated.latitude?.toString() as any,
                longitude: validated.longitude?.toString() as any,
                validationStatus: hasDocuments ? "pending" : profile.validationStatus,
                updatedAt: new Date(),
            })
            .where(eq(assujettis.id, profile.id));

        revalidatePath("/assujetti/profil/infos");
        revalidatePath("/assujetti/dashboard");

        return { success: true };
    } catch (error: any) {
        console.error("Error updating profile:", error);
        return { success: false, error: error.message || "Erreur lors de la mise à jour" };
    }
}
