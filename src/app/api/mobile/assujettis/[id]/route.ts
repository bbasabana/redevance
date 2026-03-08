import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assujettis, declarations, lignesDeclaration, controlesTerrain } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
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

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: "ID assujetti requis." }, { status: 400 });
  }

  try {
    const [assujetti] = await db.select().from(assujettis).where(eq(assujettis.id, id)).limit(1);
    if (!assujetti) {
      return NextResponse.json({ success: false, error: "Assujetti non trouvé." }, { status: 404 });
    }

    const exerciceCourant = new Date().getFullYear();
    const [existingControl] = await db
      .select({ id: controlesTerrain.id, dateControle: controlesTerrain.dateControle })
      .from(controlesTerrain)
      .where(and(eq(controlesTerrain.assujettiId, id), eq(controlesTerrain.exercice, exerciceCourant)))
      .limit(1);

    const [lastDecl] = await db
      .select()
      .from(declarations)
      .where(eq(declarations.assujettiId, id))
      .orderBy(desc(declarations.exercice))
      .limit(1);

    let nbTvDeclare = 0;
    let nbRadioDeclare = 0;
    if (lastDecl) {
      const lines = await db
        .select()
        .from(lignesDeclaration)
        .where(eq(lignesDeclaration.declarationId, lastDecl.id));
      nbTvDeclare = lines
        .filter((l) => l.categorieAppareil === "Téléviseurs" || l.categorieAppareil === "Televiseur")
        .reduce((s, l) => s + (l.nombre || 0), 0);
      nbRadioDeclare = lines
        .filter((l) => l.categorieAppareil === "Radios" || l.categorieAppareil === "Radio")
        .reduce((s, l) => s + (l.nombre || 0), 0);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...assujetti,
        nbTvDeclare,
        nbRadioDeclare,
        controlStatus: existingControl
          ? { alreadyControlled: true, exercice: exerciceCourant, dateControle: existingControl.dateControle }
          : { alreadyControlled: false, exercice: exerciceCourant },
      },
    });
  } catch (e) {
    console.error("Mobile assujetti by id error:", e);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
