"use server";

import { db } from "@/db";
import { appUsers, adminUsers, roles, userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { setPendingAuthCookie, createFullSession } from "@/lib/auth/session";
import { getAuthRedirect } from "@/lib/auth/get-auth-redirect";

export async function signInAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log("=== [LOGIN WORKFLOW START] ===");
    console.log(`Tentative de connexion pour: ${email}`);

    if (!email || !password) {
        return { error: 'Veuillez fournir un email et un mot de passe.' };
    }

    const emailLower = email.toLowerCase();

    // ── ÉTAPE 1 : Trouver l'utilisateur (AppUsers ou AdminUsers) ─────────────────────────────
    let user: any = null;
    let userRole = "assujetti";
    let isAppUser = true;

    // First try appUsers
    const [foundAppUser] = await db
        .select({
            user: appUsers,
            roleName: roles.name,
        })
        .from(appUsers)
        .leftJoin(userRoles, eq(appUsers.id, userRoles.userId))
        .leftJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(appUsers.email, emailLower))
        .limit(1);

    if (foundAppUser) {
        user = foundAppUser.user;
        userRole = foundAppUser.roleName || "assujetti";
        user.role = userRole; // attach for getAuthRedirect
    } else {
        // Try adminUsers
        const [foundAdmin] = await db.select().from(adminUsers).where(eq(adminUsers.email, emailLower)).limit(1);
        if (foundAdmin) {
            user = foundAdmin;
            userRole = "admin";
            user.role = "admin"; // attach for getAuthRedirect
            isAppUser = false;
        }
    }

    if (!user) {
        return { error: "Aucun compte associé à cet email. Vérifiez l'adresse saisie." };
    }

    // ── ÉTAPE 2 : Compte actif ───────────────────────────────────────
    // For Assujettis, is_active represents if they have finished identification.
    // Wait, the specification explicitly said:
    // "L'activation du compte assujetti se fait uniquement quand il complète l'identification"
    // AND "Vérifier si le compte est activé (= identification complète) ... Si non, envoyer vers /assujetti/identification"
    // So we DON'T block login if !user.is_active for Assujettis. We route them to identification!
    // But if an AGENT is !is_active, we should block.
    if (!user.isActive && userRole !== 'assujetti') {
        return { error: "Compte désactivé. Contactez l'administrateur." };
    }


    // ── ÉTAPE 3 : Vérifier le verrouillage ──────────────────────────
    if (user.lockedUntil && user.lockedUntil > new Date()) {
        const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        return { error: `Compte verrouillé. Réessayez dans ${minutes} minutes.` };
    }

    // ── ÉTAPE 4 : Vérifier le mot de passe ──────────────────────────
    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
        const attempts = (user.failedLoginAttempts || 0) + 1;

        if (attempts >= 5) {
            // Verrouiller 30 minutes
            const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
            if (isAppUser) {
                await db.update(appUsers).set({
                    failedLoginAttempts: attempts,
                    lockedUntil: lockedUntil,
                }).where(eq(appUsers.id, user.id));
            } else {
                await db.update(adminUsers).set({
                    failedLoginAttempts: attempts,
                    lockedUntil: lockedUntil,
                }).where(eq(adminUsers.id, user.id));
            }

            return { error: 'Trop de tentatives. Compte verrouillé 30 minutes.' };
        }

        if (isAppUser) {
            await db.update(appUsers).set({ failedLoginAttempts: attempts }).where(eq(appUsers.id, user.id));
        } else {
            await db.update(adminUsers).set({ failedLoginAttempts: attempts }).where(eq(adminUsers.id, user.id));
        }

        return { error: `Mot de passe incorrect. ${5 - attempts} tentative(s) restante(s) avant verrouillage.` };
    }

    // Mot de passe correct → reset compteur échecs
    const updateData = {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
    };

    if (isAppUser) {
        await db.update(appUsers).set(updateData).where(eq(appUsers.id, user.id));
    } else {
        await db.update(adminUsers).set(updateData).where(eq(adminUsers.id, user.id));
    }

    // ── ÉTAPE 5 : Stocker l'userId dans un cookie temporaire ────────
    // PAS encore de session complète — juste un pending token signé
    // pour identifier l'utilisateur sur les étapes suivantes (2FA)
    await setPendingAuthCookie(user.id, userRole);

    // ── ÉTAPE 6 : Router selon le rôle et l'état 2FA ────────────────
    const redirectUrl = await getAuthRedirect(user);

    console.log("=== [LOGIN WORKFLOW TRACE] ===");
    console.log(`- Utilisateur: ${user.email}`);
    console.log(`- Rôle: ${userRole}`);
    console.log(`- Compte Activé (Identification complète) ?: ${user.isActive ? "Oui" : "Non"}`);
    console.log(`- 2FA Activé ?: ${user.twoFactorEnabled ? "Oui" : "Non"}`);
    console.log(`- Redirection vers: ${redirectUrl}`);
    console.log("=================================");

    // FIX: Si l'utilisateur est redirigé directement vers le dashboard ou l'identification (pas de 2FA), 
    // on doit créer la VRAIE session JWT, sinon le middleware le bloquera.
    if (!redirectUrl.includes('/panel/verify-2fa') && !redirectUrl.includes('/panel/setup-2fa') && !redirectUrl.includes('/panel/first-login-2fa')) {
        console.log("-> 2FA Bypassé: Création immédiate de la session complète (auth_session).");
        await createFullSession(user.id, userRole, user.isActive);
    }

    return { redirectUrl };
}
