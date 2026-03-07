import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appUsers, adminUsers, roles, userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getBearerTokenFromRequest, verifyMobileToken } from "@/lib/auth/jwt-mobile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = getBearerTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ success: false, error: "Non autorisé." }, { status: 401 });
  }

  const payload = await verifyMobileToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Session expirée ou invalide." }, { status: 401 });
  }

  try {
    const [appUser] = await db
      .select({
        id: appUsers.id,
        email: appUsers.email,
        nomPrenom: appUsers.nomPrenom,
        assignedCommuneId: appUsers.assignedCommuneId,
        identifiantAgent: appUsers.identifiantAgent,
      })
      .from(appUsers)
      .where(eq(appUsers.id, payload.userId))
      .limit(1);

    if (appUser) {
      const [roleRow] = await db
        .select({ roleName: roles.name })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, appUser.id))
        .limit(1);

      return NextResponse.json({
        success: true,
        user: {
          id: appUser.id,
          email: appUser.email,
          name: appUser.nomPrenom,
          role: roleRow?.roleName || payload.role,
          assignedCommuneId: appUser.assignedCommuneId,
          identifiantAgent: appUser.identifiantAgent,
        },
      });
    }

    const [adminUser] = await db
      .select({ id: adminUsers.id, email: adminUsers.email, nomPrenom: adminUsers.nomPrenom })
      .from(adminUsers)
      .where(eq(adminUsers.id, payload.userId))
      .limit(1);

    if (adminUser) {
      return NextResponse.json({
        success: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.nomPrenom,
          role: "admin",
        },
      });
    }

    return NextResponse.json({ success: false, error: "Utilisateur introuvable." }, { status: 404 });
  } catch (e) {
    console.error("Mobile me error:", e);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
