import { redirect } from "next/navigation";
import { getPendingAuthCookie, getSession, getUser2FaStatus } from "@/lib/auth/session";
import { generateSecret, generateURI } from "otplib";
import Setup2FAClient from "./setup-2fa-client";

export default async function Setup2FAPage() {
    // 1. Session Guard: Check for either a pending auth or a full session
    const pending = await getPendingAuthCookie();
    const session = await getSession();

    if (!pending && !session) {
        // Professional dynamic redirect to sign-in if no session is active
        redirect("/panel/signin");
    }

    // 2. Security Optimization: check if 2FA is already enabled via database source of truth
    const userId = pending?.userId || session?.user.userId;
    if (userId) {
        const is2faEnabled = await getUser2FaStatus(userId);
        if (is2faEnabled) {
            console.log(`[2FA GUARD] User ${userId} already has 2FA configured. Redirecting to verification.`);
            redirect("/panel/verify-2fa");
        }
    }

    // 2. Generate initial 2FA secret and QR URL on the server
    const secret = generateSecret();
    const appName = "RTNC Redevance";
    const qrUrl = generateURI({
        issuer: appName,
        label: "Moi", // In a real app, you could use the user's email here
        secret: secret,
    });

    return <Setup2FAClient initialSecret={secret} initialQrUrl={qrUrl} />;
}
