import { auth } from "@/auth";
import { db } from "@/db";
import { adminUsers, appUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyTwoFactorCode } from "@/lib/auth/2fa";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
        }

        const { code } = await req.json();
        const { id, userType } = session.user as any;

        const table = userType === "admin" ? adminUsers : appUsers;
        const [user] = await db.select().from(table).where(eq(table.id, id)).limit(1);

        if (!user || !user.twoFactorSecret) {
            return NextResponse.json({ success: false, error: "TWO_FACTOR_NOT_SETUP" }, { status: 400 });
        }

        const isValid = verifyTwoFactorCode(code, user.twoFactorSecret);

        if (isValid) {
            // In a real app, you might want to log this successful verification
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: "INVALID_CODE" }, { status: 400 });
        }
    } catch (error) {
        console.error("2FA Verification Error:", error);
        return NextResponse.json({ success: false, error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }
}
