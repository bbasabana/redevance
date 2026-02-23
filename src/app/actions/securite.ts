"use server";

import { db } from "@/db";
import { appUsers, sessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

export async function changePassword(data: z.infer<typeof ChangePasswordSchema>) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Non autorisé" };

        const validated = ChangePasswordSchema.parse(data);

        // 1. Fetch User
        const [user] = await db
            .select()
            .from(appUsers)
            .where(eq(appUsers.id, session.user.id))
            .limit(1);

        if (!user) return { success: false, error: "Utilisateur non trouvé" };

        // 2. Verify current password
        const isValid = await bcrypt.compare(validated.currentPassword, user.passwordHash);
        if (!isValid) {
            return { success: false, error: "Mot de passe actuel incorrect" };
        }

        // 3. Hash and Update new password
        const newPasswordHash = await bcrypt.hash(validated.newPassword, 10);

        await db.update(appUsers)
            .set({
                passwordHash: newPasswordHash,
                updatedAt: new Date(),
            })
            .where(eq(appUsers.id, user.id));

        return { success: true };
    } catch (error: any) {
        console.error("Error changing password:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: "Erreur de validation", details: error.issues };
        }
        return { success: false, error: "Erreur lors de la mise à jour du mot de passe" };
    }
}

export async function toggle2FA(enabled: boolean) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Non autorisé" };

        await db.update(appUsers)
            .set({
                twoFactorEnabled: enabled,
                updatedAt: new Date(),
            })
            .where(eq(appUsers.id, session.user.id));

        return { success: true };
    } catch (error: any) {
        console.error("Error toggling 2FA:", error);
        return { success: false, error: "Erreur lors de la modification du 2FA" };
    }
}

export async function getRecentSessions() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Non autorisé" };

        const recentSessions = await db
            .select()
            .from(sessions)
            .where(eq(sessions.userId, session.user.id))
            .orderBy(desc(sessions.createdAt))
            .limit(5);

        return { success: true, data: recentSessions };
    } catch (error: any) {
        console.error("Error fetching recent sessions:", error);
        return { success: false, error: "Erreur lors de la récupération des sessions" };
    }
}
