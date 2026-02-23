"use server";

import { db } from "@/db";
import { appUsers, adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verify } from "otplib";
import { getPendingAuthCookie, createFullSession, clearPendingAuthCookie } from "@/lib/auth/session";
import { getAuthRedirect } from "@/lib/auth/get-auth-redirect";

export async function verifyTotpAction(code: string) {
    const pending = await getPendingAuthCookie();
    if (!pending) {
        return { error: 'Session de connexion expirée. Veuillez vous reconnecter.' };
    }

    let user: any = null;
    let isAppUser = true;

    if (pending.role === 'admin') {
        const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, pending.userId)).limit(1);
        user = admin;
        isAppUser = false;
    } else {
        const [appUser] = await db.select().from(appUsers).where(eq(appUsers.id, pending.userId)).limit(1);
        user = appUser;
    }

    if (!user) {
        return { error: 'Utilisateur introuvable.' };
    }

    // Verify TOTP
    // TODO: In a real app, twoFactorSecret should be decrypted here before verification if it's encrypted in DB.
    if (!user.twoFactorSecret) {
        return { error: 'La configuration 2FA est manquante.' };
    }

    const isValid = await verify({
        token: code,
        secret: user.twoFactorSecret, // decrypt(user.twoFactorSecret)
    });

    if (!isValid) {
        // TODO: Handle recovery codes if implemented
        return { error: 'Code incorrect.' };
    }

    // Code valide → créer la vraie session httpOnly
    await createFullSession(user.id, pending.role, user.isActive);
    await clearPendingAuthCookie();

    // Attach role to user object to feed into getAuthRedirect
    user.role = pending.role;

    // Rediriger selon rôle + état identification
    // We can reuse getAuthRedirect because getAuthRedirect returns dashboard/identification based on role and active status
    const redirectUrl = await getAuthRedirect(user, true);
    return { redirectUrl };
}
