import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { declarations, lignesDeclaration } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getBearerTokenFromRequest, verifyMobileToken } from "@/lib/auth/jwt-mobile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getBearerTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ success: false, error: "Non autorisé." }, { status: 401 });
  }

  const payload = await verifyMobileToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Session expirée ou invalide." }, { status: 401 });
  }

  const { id: assujettiId } = await params;
  if (!assujettiId) {
    return NextResponse.json({ success: false, error: "ID assujetti requis." }, { status: 400 });
  }

  try {
    const [lastDecl] = await db
      .select()
      .from(declarations)
      .where(eq(declarations.assujettiId, assujettiId))
      .orderBy(desc(declarations.exercice))
      .limit(1);

    if (!lastDecl) {
      return NextResponse.json({
        success: true,
        data: {
          nbTvDeclare: 0,
          nbRadioDeclare: 0,
          exercice: new Date().getFullYear(),
          tarifUnitaire: 10,
        },
      });
    }

    const lines = await db
      .select()
      .from(lignesDeclaration)
      .where(eq(lignesDeclaration.declarationId, lastDecl.id));

    const nbTvDeclare = lines
      .filter((l) => l.categorieAppareil === "Téléviseurs" || l.categorieAppareil === "Televiseur")
      .reduce((s, l) => s + (l.nombre || 0), 0);
    const nbRadioDeclare = lines
      .filter((l) => l.categorieAppareil === "Radios" || l.categorieAppareil === "Radio")
      .reduce((s, l) => s + (l.nombre || 0), 0);
    const tarifUnitaire = lines.length > 0 ? Number(lines[0].tarifUnitaire) || 10 : 10;

    return NextResponse.json({
      success: true,
      data: {
        nbTvDeclare,
        nbRadioDeclare,
        exercice: lastDecl.exercice,
        tarifUnitaire,
      },
    });
  } catch (e) {
    console.error("Mobile control-data error:", e);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
