import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  assujettis,
  controlesTerrain,
  notesRectificativesTerrain,
} from "@/db/schema";
import { eq, and, gte, desc, sql, count } from "drizzle-orm";
import { getBearerTokenFromRequest, verifyMobileToken } from "@/lib/auth/jwt-mobile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = getBearerTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ success: false, error: "Non autorisé." }, { status: 401 });
  }

  const payload = await verifyMobileToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Session expirée ou invalide." }, { status: 401 });
  }

  const agentId = payload.userId;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    const [dailyControls] = await db
      .select({ count: count() })
      .from(controlesTerrain)
      .where(
        and(
          eq(controlesTerrain.agentId, agentId),
          gte(controlesTerrain.dateControle, startOfToday)
        )
      );

    const [monthlyColl] = await db
      .select({ total: sql<string>`coalesce(sum(${notesRectificativesTerrain.montantTotal}), 0)` })
      .from(notesRectificativesTerrain)
      .innerJoin(controlesTerrain, eq(notesRectificativesTerrain.controleId, controlesTerrain.id))
      .where(
        and(
          eq(controlesTerrain.agentId, agentId),
          gte(notesRectificativesTerrain.datePaiement, startOfMonth)
        )
      );

    const recent = await db
      .select({
        id: controlesTerrain.id,
        date: controlesTerrain.dateControle,
        assujettiId: assujettis.id,
        nomAssujetti: assujettis.nomRaisonSociale,
        identifiantFiscal: assujettis.identifiantFiscal,
        montantTotal: notesRectificativesTerrain.montantTotal,
        statutPaiement: notesRectificativesTerrain.statutPaiement,
      })
      .from(controlesTerrain)
      .innerJoin(assujettis, eq(controlesTerrain.assujettiId, assujettis.id))
      .leftJoin(notesRectificativesTerrain, eq(notesRectificativesTerrain.controleId, controlesTerrain.id))
      .where(eq(controlesTerrain.agentId, agentId))
      .orderBy(desc(controlesTerrain.dateControle))
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        dailyCount: dailyControls?.count ?? 0,
        monthlyTotal: Number(monthlyColl?.total) ?? 0,
        recentActivities: recent.map((r) => ({
          id: r.id,
          assujettiName: r.nomAssujetti,
          assujettiId: r.identifiantFiscal,
          date: r.date,
          amount: Number(r.montantTotal) ?? 0,
          status: r.statutPaiement === "paye" ? "PAYÉ" : (r.montantTotal ? "NON PAYÉ" : "CONFORME"),
        })),
      },
    });
  } catch (e) {
    console.error("Mobile dashboard stats error:", e);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
