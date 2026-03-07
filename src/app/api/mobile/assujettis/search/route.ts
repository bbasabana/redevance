import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assujettis, appUsers } from "@/db/schema";
import { eq, or, ilike } from "drizzle-orm";
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

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json(
      { success: false, error: "Recherche: au moins 2 caractères (CIGTI, NIF ou nom)." },
      { status: 400 }
    );
  }

  try {
    const [agent] = await db
      .select({ id: appUsers.id, assignedCommuneId: appUsers.assignedCommuneId })
      .from(appUsers)
      .where(eq(appUsers.id, payload.userId))
      .limit(1);

    if (!agent) {
      return NextResponse.json({ success: false, error: "Agent non trouvé." }, { status: 403 });
    }

    const results = await db
      .select({
        id: assujettis.id,
        identifiantFiscal: assujettis.identifiantFiscal,
        nomRaisonSociale: assujettis.nomRaisonSociale,
        statut: assujettis.statut,
        adresseSiege: assujettis.adresseSiege,
        typePersonne: assujettis.typePersonne,
        nif: assujettis.nif,
        rccm: assujettis.rccm,
        representantLegal: assujettis.representantLegal,
      })
      .from(assujettis)
      .where(
        or(
          ilike(assujettis.identifiantFiscal, `%${q}%`),
          ilike(assujettis.nomRaisonSociale, `%${q}%`),
          ilike(assujettis.nif, `%${q}%`)
        )
      )
      .limit(15);

    return NextResponse.json({ success: true, data: results });
  } catch (e) {
    console.error("Mobile search assujettis error:", e);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
