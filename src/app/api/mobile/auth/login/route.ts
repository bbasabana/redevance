import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appUsers, adminUsers, roles, userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createMobileSessionToken } from "@/lib/auth/jwt-mobile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email as string)?.trim()?.toLowerCase();
    const password = body.password as string;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    let user: { id: string; email: string; nomPrenom: string; passwordHash: string; isActive: boolean | null; lockedUntil: Date | null; failedLoginAttempts: number | null } | null = null;
    let userRole = "assujetti";
    let isAppUser = true;

    const [foundAppUser] = await db
      .select({
        user: appUsers,
        roleName: roles.name,
      })
      .from(appUsers)
      .leftJoin(userRoles, eq(appUsers.id, userRoles.userId))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(appUsers.email, email))
      .limit(1);

    if (foundAppUser?.user) {
      user = foundAppUser.user;
      userRole = foundAppUser.roleName || "assujetti";
      isAppUser = true;
    } else {
      const [foundAdmin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
      if (foundAdmin) {
        user = foundAdmin;
        userRole = "admin";
        isAppUser = false;
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Aucun compte associé à cet email." },
        { status: 401 }
      );
    }

    if (!user.isActive && userRole !== "assujetti") {
      return NextResponse.json(
        { success: false, error: "Compte désactivé. Contactez l'administrateur." },
        { status: 403 }
      );
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const minutes = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { success: false, error: `Compte verrouillé. Réessayez dans ${minutes} minutes.` },
        { status: 403 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: "Mot de passe incorrect." },
        { status: 401 }
      );
    }

    const isAgent = ["agent", "controleur", "superviseur", "directeur", "sous_directeur", "dg", "admin"].includes(userRole);
    const durationHours = isAgent ? 8 : 24;
    const token = await createMobileSessionToken(user.id, userRole, true, durationHours);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.nomPrenom,
        role: userRole,
      },
    });
  } catch (e) {
    console.error("Mobile login error:", e);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
