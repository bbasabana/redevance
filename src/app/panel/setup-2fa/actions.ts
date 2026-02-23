"use server";

import { db } from "@/db";
import { appUsers, adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verify } from "otplib";
import { getPendingAuthCookie, createFullSession, clearPendingAuthCookie, getSession } from "@/lib/auth/session";
import { getAuthRedirect } from "@/lib/auth/get-auth-redirect";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function setupTotpAction(code: string, secret: string) {
    // Determine the user's ID and role from either pending cookie (first login/login without 2fa)
    // OR from a full session (if they are a logged in Assujetti voluntarily setting it up)
    let pending = await getPendingAuthCookie();
    let session = await getSession();

    let userId = pending?.userId || session?.user.userId;
    let userRole = pending?.role || session?.user.role;

    if (!userId || !userRole) {
        return { error: 'Aucune session active trouvée.' };
    }

    let user: any = null;
    let isAppUser = true;

    if (userRole === 'admin') {
        const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, userId)).limit(1);
        user = admin;
        isAppUser = false;
    } else {
        const [appUser] = await db.select().from(appUsers).where(eq(appUsers.id, userId)).limit(1);
        user = appUser;
    }

    if (!user) {
        return { error: 'Utilisateur introuvable.' };
    }

    const isValid = await verify({
        token: code,
        secret: secret,
    });

    if (!isValid) {
        return { error: 'Code incorrect.' };
    }

    // Generate recovery codes
    const rawRecoveryCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
    );
    const hashedRecoveryCodes = await Promise.all(
        rawRecoveryCodes.map(code => bcrypt.hash(code, 10))
    );

    // Save the secret and mark 2FA as enabled
    const updateData = {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        recoveryCodes: hashedRecoveryCodes,
        mustSetup2Fa: false,
    };

    if (isAppUser) {
        await db.update(appUsers).set(updateData).where(eq(appUsers.id, userId));
    } else {
        await db.update(adminUsers).set(updateData as any).where(eq(adminUsers.id, userId));
    }

    // Replace pending cookie with full session
    await createFullSession(userId, userRole, user.isActive);
    if (pending) {
        await clearPendingAuthCookie();
    }

    user.twoFactorEnabled = true;
    user.mustSetup2Fa = false;
    user.role = userRole;

    const redirectUrl = await getAuthRedirect(user, true);
    return {
        redirectUrl,
        recoveryCodes: rawRecoveryCodes
    };
}
