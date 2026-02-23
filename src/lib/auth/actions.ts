"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { adminUsers, appUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateTwoFactorSecret, getTwoFactorURI, verifyTwoFactorCode, generateRecoveryCodes } from "@/lib/auth/2fa";
import { encrypt } from "@/lib/auth/encryption";
import { revalidatePath } from "next/cache";

export async function getSetup2FAData() {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
        throw new Error("UNAUTHORIZED");
    }

    const { id, email, userType } = session.user as any;

    // Check if already enabled
    const table = userType === "admin" ? adminUsers : appUsers;
    const [user] = await db.select().from(table).where(eq(table.id, id)).limit(1);

    if (user.twoFactorEnabled) {
        return { alreadyEnabled: true };
    }

    const secret = generateTwoFactorSecret();
    const uri = getTwoFactorURI(email, secret);

    return { secret, uri };
}

export async function verifyAndEnable2FA(secret: string, code: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    const { id, userType } = session.user as any;
    const isValid = verifyTwoFactorCode(code, secret);

    if (!isValid) {
        return { success: false, error: "CODE_INVALID" };
    }

    const { plainCodes, hashedCodes } = generateRecoveryCodes();
    const table = userType === "admin" ? adminUsers : appUsers;

    await db.update(table).set({
        twoFactorSecret: encrypt(secret),
        twoFactorEnabled: true,
        twoFactorSetupAt: new Date(),
        recoveryCodes: hashedCodes,
    }).where(eq(table.id, id));

    revalidatePath("/assujetti/securite");
    revalidatePath("/(dashboard)/securite", "layout");

    return { success: true, recoveryCodes: plainCodes };
}

export async function disable2FA() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    const { id, userType } = session.user as any;
    const table = userType === "admin" ? adminUsers : appUsers;

    await db.update(table).set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        recoveryCodes: null,
        twoFactorSetupAt: null,
    }).where(eq(table.id, id));

    revalidatePath("/assujetti/securite");
    revalidatePath("/(dashboard)/securite", "layout");

    return { success: true };
}
