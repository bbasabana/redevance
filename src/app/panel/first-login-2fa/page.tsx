import { redirect } from "next/navigation";
import { getPendingAuthCookie, getSession, getUser2FaStatus } from "@/lib/auth/session";
import FirstLogin2FAClient from "./first-login-client";

export default async function FirstLogin2FAPage() {
    // 1. Session Guard
    const pending = await getPendingAuthCookie();
    const session = await getSession();

    if (!pending && !session) {
        redirect("/panel/signin");
    }

    // 2. Security Check: If 2FA is already enabled, skip setup splash and go to verify
    const userId = pending?.userId || session?.user.userId;
    if (userId) {
        const is2faEnabled = await getUser2FaStatus(userId);
        if (is2faEnabled) {
            console.log(`[2FA SPLASH GUARD] User ${userId} already has 2FA configured. Redirecting to verify.`);
            redirect("/panel/verify-2fa");
        }
    }

    return <FirstLogin2FAClient />;
}
