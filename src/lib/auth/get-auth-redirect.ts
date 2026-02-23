import { db } from "@/db";
import { appUsers, onboardingProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAuthRedirect(user: any, isVerified: boolean = false): Promise<string> {
    const AGENT_ROLES = [
        'agent', 'controleur', 'superviseur',
        'directeur', 'sous_directeur', 'dg', 'admin' // Note: adding admin here strictly for simplicity if they use appUsers, though they might use adminUsers in your original DB setup.
    ];

    // ════════════════════════════════════════
    // BRANCHE ADMIN (If using adminUsers, we treat similarly to AGENTS with mandatory 2FA)
    // ════════════════════════════════════════
    // If the user object passed has a 'superAdmin' field or their userType='admin', handle them:
    if ("superAdmin" in user || (user as any).userType === "admin") {
        if (user.twoFactorEnabled && !isVerified) {
            return '/panel/verify-2fa';
        }
        if (!user.twoFactorEnabled) {
            return '/panel/setup-2fa';
        }
        return '/admin/dashboard'; // Assuming admin dashboard path
    }


    // ════════════════════════════════════════
    // BRANCHE AGENT — Pas d'identification, 2FA obligatoire
    // ════════════════════════════════════════
    // We assume the user has a "role" field through a join, or we fetch it.
    // In your schema, appUsers doesn't have a direct "role" column, it's linked via user_roles.
    // Let's assume the user object passed here ALREADY CONTAINS the resolved `role` as a property.
    const userRole = (user as any).role || 'assujetti'; // fallback to assujetti if not found

    if (AGENT_ROLES.includes(userRole)) {
        // Si déjà vérifié (après TOTP ou recovery) → Dashboard
        if (isVerified) {
            return '/dashboard/agent/dashboard';
        }

        // 2FA déjà configuré → demander le code TOTP
        if (user.twoFactorEnabled) {
            return '/panel/verify-2fa';
        }

        // 2FA pas encore configuré → setup obligatoire
        if (user.mustSetup2Fa) {
            return '/panel/first-login-2fa';
        }

        // Agent sans 2FA → forcage setup
        return '/panel/setup-2fa';
    }

    // ════════════════════════════════════════
    // BRANCHE ASSUJETTI — Identification requise, 2FA optionnel
    // ════════════════════════════════════════
    const ASSUJETTI_ROLES = ['assujetti', 'entreprise', 'particulier', 'particular'];

    if (ASSUJETTI_ROLES.includes(userRole)) {
        // Vérifier si le compte est activé (= identification complète)
        if (!user.isActive && !user.identificationCompleted) {
            // L'assujetti n'a pas encore complété l'identification
            const progress = await db.query.onboardingProgress.findFirst({
                where: eq(onboardingProgress.userId, user.id)
            });
            const step = progress?.lastStep ?? 1;
            return `/assujetti/identification?step=${step}`;
        }

        // Compte actif → vérifier si 2FA est activé
        if (user.twoFactorEnabled && !isVerified) {
            return '/panel/verify-2fa';
        }

        // Tout est ok → dashboard
        return '/assujetti/dashboard';
    }

    return '/panel/signin';
}
