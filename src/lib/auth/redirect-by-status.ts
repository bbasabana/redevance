"use server";

import { db } from "@/db";
import { appUsers, onboardingProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Determines the correct page to redirect a user after a successful login,
 * based on their 2FA status and Onboarding progress.
 * 
 * @param userId - The UUID of the appUser
 * @returns The destination URL path
 */
export async function getPostLoginRedirect(userId: string): Promise<string> {
    const user = await db.query.appUsers.findFirst({
        where: eq(appUsers.id, userId),
    });

    if (!user) return "/panel/signin";

    // Admins logic skipped here since they don't do onboarding, but let's assume this is for appUsers.
    // If it's an admin, we shouldn't even call this function or just return their dashboard.

    // Cas 1 — 2FA pas encore configuré (et obligatoire, ou juste pas set up)
    if (!user.twoFactorEnabled) {
        return "/setup-2fa";
    }

    // Cas 2 — Identification jamais commencée
    const progress = await db.query.onboardingProgress.findFirst({
        where: eq(onboardingProgress.userId, userId),
    });

    if (!user.identificationCompleted && (!progress || progress.lastStep === 0)) {
        return "/assujetti/identification?step=1";
    }

    // Cas 3 — Identification en cours (pas terminée)
    if (!user.identificationCompleted && progress && progress.lastStep > 0) {
        // L'utilisateur reprend exactement là où il s'est arrêté
        return `/assujetti/identification?step=${progress.lastStep}`;
    }

    // Cas 4 — Identification complète → dashboard
    // We assume agent vs assujetti was handled before or we check roles here,
    // but typically agents don't have identification completed either.
    // Let's assume this is used generic and we need to return the role-specific dashboard if completed.

    // For now we return assujetti explicitly or just /assujetti/dashboard
    return "/assujetti/dashboard";
}
