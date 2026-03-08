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

const CoordonneesSchema = z.object({
    adresseSiege: z.string().optional().or(z.literal("")),
    telephonePrincipal: z.string().optional().or(z.literal("")),
    email: z.union([z.string().email("Email invalide"), z.literal("")]).optional(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
});

/** Sauvegarde automatique des seules coordonnées & siège (adresse, tél, email, position). */
export async function updateAssujettiCoordonnees(data: z.infer<typeof CoordonneesSchema>) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Non autorisé" };

        const validated = CoordonneesSchema.safeParse(data);
        if (!validated.success) return { success: false, error: "Données invalides" };

        const [profile] = await db
            .select({ id: assujettis.id })
            .from(assujettis)
            .where(eq(assujettis.userId, session.user.id))
            .limit(1);

        if (!profile) return { success: false, error: "Profil non trouvé" };

        const payload: Record<string, unknown> = {
            updatedAt: new Date(),
        };
        if (validated.data.adresseSiege !== undefined) payload.adresseSiege = validated.data.adresseSiege ?? "";
        if (validated.data.telephonePrincipal !== undefined) payload.telephonePrincipal = validated.data.telephonePrincipal || null;
        if (validated.data.email !== undefined) payload.email = validated.data.email || null;
        if (validated.data.latitude !== undefined) payload.latitude = validated.data.latitude != null ? String(validated.data.latitude) : null;
        if (validated.data.longitude !== undefined) payload.longitude = validated.data.longitude != null ? String(validated.data.longitude) : null;

        await db.update(assujettis).set(payload as any).where(eq(assujettis.id, profile.id));

        revalidatePath("/assujetti/profil/edit");
        revalidatePath("/assujetti/profil/infos");
        revalidatePath("/assujetti/dashboard");

        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating coordonnées:", error);
        return { success: false, error: error instanceof Error ? error.message : "Erreur lors de l'enregistrement" };
    }
}
