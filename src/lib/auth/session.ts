"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db";
import { appUsers, adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

// Generate a secret key from an environment variable (you MUST set AUTH_SECRET in .env)
const secretKey = process.env.AUTH_SECRET || "default_super_secret_key_change_me_in_production";
const key = new TextEncoder().encode(secretKey);

export type SessionPayload = {
    userId: string;
    role: string;
    is_active: boolean;
    expiresAt: Date;
};

export type PendingPayload = {
    userId: string;
    role: string;
    expiresAt: Date;
};

// ── CREATE / UPDATE PENDING COOKIE (5 min) ─────────────────────────────
export async function setPendingAuthCookie(userId: string, role: string) {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const session = await new SignJWT({ userId, role, expiresAt })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("5m")
        .sign(key);

    const cookieStore = cookies();
    cookieStore.set("auth_pending", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
    });
}

export async function getPendingAuthCookie(): Promise<PendingPayload | null> {
    const cookieStore = cookies();
    const session = cookieStore.get("auth_pending")?.value;
    if (!session) return null;

    try {
        const { payload } = await jwtVerify(session, key, {
            algorithms: ["HS256"],
        });
        return payload as PendingPayload;
    } catch (error) {
        return null;
    }
}

export async function clearPendingAuthCookie() {
    cookies().delete("auth_pending");
}

// ── CREATE / UPDATE COMPLETE SESSION COOKIE ─────────────────────────────
export async function createFullSession(userId: string, role: string, is_active: boolean) {
    const isAgent = ['agent', 'controleur', 'superviseur', 'directeur', 'sous_directeur', 'dg'].includes(role);
    // 8h pour agents, 24h pour assujettis
    const durationHours = isAgent ? 8 : 24;
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    const session = await new SignJWT({ userId, role, is_active, expiresAt })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${durationHours}h`)
        .sign(key);

    const cookieStore = cookies();
    cookieStore.set("auth_session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
    });
}

export async function getSession(): Promise<{ user: SessionPayload } | null> {
    const cookieStore = cookies();
    const session = cookieStore.get("auth_session")?.value;
    if (!session) return null;

    try {
        const { payload } = await jwtVerify(session, key, {
            algorithms: ["HS256"],
        });
        return { user: payload as SessionPayload };
    } catch (error) {
        return null;
    }
}

export async function clearSession() {
    cookies().delete("auth_session");
}

/**
 * Fetches the 2FA enablement status for a user from the database.
 * Checks both appUsers and adminUsers.
 */
export async function getUser2FaStatus(userId: string): Promise<boolean> {
    try {
        // Try appUsers first
        const [appUser] = await db
            .select({ twoFactorEnabled: appUsers.twoFactorEnabled })
            .from(appUsers)
            .where(eq(appUsers.id, userId))
            .limit(1);

        if (appUser) return appUser.twoFactorEnabled;

        // Try adminUsers
        const [adminUser] = await db
            .select({ twoFactorEnabled: adminUsers.twoFactorEnabled })
            .from(adminUsers)
            .where(eq(adminUsers.id, userId))
            .limit(1);

        if (adminUser) return adminUser.twoFactorEnabled;

        return false;
    } catch (error) {
        console.error("Error fetching 2FA status:", error);
        return false;
    }
}
