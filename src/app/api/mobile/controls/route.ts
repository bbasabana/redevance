import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  assujettis,
  controlesTerrain,
  notesRectificativesTerrain,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getBearerTokenFromRequest, verifyMobileToken } from "@/lib/auth/jwt-mobile";
import { sendControlNotificationSms } from "@/lib/sms/messagebird";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET: liste des contrôles (factures) de l'agent connecté uniquement. */
export async function GET(req: NextRequest) {
  const token = getBearerTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ success: false, error: "Non autorisé." }, { status: 401 });
  }

  const payload = await verifyMobileToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Session expirée ou invalide." }, { status: 401 });
  }

  const agentId = payload.userId;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase();

  try {
    let rows = await db
      .select({
        id: controlesTerrain.id,
        dateControle: controlesTerrain.dateControle,
        exercice: controlesTerrain.exercice,
        assujettiId: controlesTerrain.assujettiId,
        nomRaisonSociale: assujettis.nomRaisonSociale,
        nif: assujettis.nif,
        identifiantFiscal: assujettis.identifiantFiscal,
        montantTotal: notesRectificativesTerrain.montantTotal,
        statutPaiement: notesRectificativesTerrain.statutPaiement,
      })
      .from(controlesTerrain)
      .innerJoin(assujettis, eq(controlesTerrain.assujettiId, assujettis.id))
      .leftJoin(notesRectificativesTerrain, eq(notesRectificativesTerrain.controleId, controlesTerrain.id))
      .where(eq(controlesTerrain.agentId, agentId))
      .orderBy(desc(controlesTerrain.dateControle));

    if (q && q.length > 0) {
      rows = rows.filter(
        (r) =>
          (r.nif?.toLowerCase().includes(q)) ||
          (r.identifiantFiscal?.toLowerCase().includes(q)) ||
          (r.nomRaisonSociale?.toLowerCase().includes(q))
      );
    }

    const list = rows.map((r) => ({
      id: r.id,
      ticketId: r.id,
      dateOperation: r.dateControle,
      exercice: r.exercice,
      assujettiName: r.nomRaisonSociale ?? "—",
      nif: r.nif ?? null,
      identifiantFiscal: r.identifiantFiscal ?? null,
      montantTotal: r.montantTotal ? Number(r.montantTotal) : 0,
      statutPaiement: r.statutPaiement ?? "non_paye",
    }));

    return NextResponse.json({ success: true, data: list });
  } catch (e) {
    console.error("Mobile list controls error:", e);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = getBearerTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ success: false, error: "Non autorisé." }, { status: 401 });
  }

  const payload = await verifyMobileToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Session expirée ou invalide." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      assujettiId,
      nbTvConstate,
      nbRadioConstate,
      nbTvDeclare,
      nbRadioDeclare,
      exercice,
      montantPrincipal,
      montantPenalite,
      montantTotal,
      observations,
      geolocalisation,
      activitesConstatees,
      precisionAutre,
      adresseConstatee,
    } = body as {
      assujettiId: string;
      nbTvConstate: number;
      nbRadioConstate: number;
      nbTvDeclare: number;
      nbRadioDeclare: number;
      exercice: number;
      montantPrincipal: number;
      montantPenalite: number;
      montantTotal: number;
      observations?: string;
      geolocalisation?: { lat: number; lng: number } | null;
      activitesConstatees?: string[];
      precisionAutre?: string;
      adresseConstatee?: string;
    };

    if (!assujettiId || nbTvConstate == null || nbRadioConstate == null) {
      return NextResponse.json(
        { success: false, error: "Données de contrôle incomplètes." },
        { status: 400 }
      );
    }

    const exerciceYear = exercice ?? new Date().getFullYear();
    const [existing] = await db
      .select({ id: controlesTerrain.id })
      .from(controlesTerrain)
      .where(and(eq(controlesTerrain.assujettiId, assujettiId), eq(controlesTerrain.exercice, exerciceYear)))
      .limit(1);
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Un contrôle existe déjà pour cet assujetti pour l'exercice ${exerciceYear}. Un seul contrôle par période.` },
        { status: 409 }
      );
    }

    const result = await db.transaction(async (tx) => {
      const [control] = await tx
        .insert(controlesTerrain)
        .values({
          assujettiId,
          agentId: payload!.userId,
          exercice: exerciceYear,
          nbTvDeclare: nbTvDeclare ?? 0,
          nbRadioDeclare: nbRadioDeclare ?? 0,
          nbTvConstate: nbTvConstate ?? 0,
          nbRadioConstate: nbRadioConstate ?? 0,
          ecartTv: (nbTvConstate ?? 0) - (nbTvDeclare ?? 0),
          ecartRadio: (nbRadioConstate ?? 0) - (nbRadioDeclare ?? 0),
          activitesConstatees: activitesConstatees || [],
          precisionAutre: precisionAutre ?? null,
          adresseConstatee: adresseConstatee ?? null,
          observations: observations ?? null,
          geolocalisation: geolocalisation ?? null,
          statut: "finalise",
          dateControle: new Date(),
        })
        .returning();

      if ((montantTotal ?? 0) > 0) {
        await tx.insert(notesRectificativesTerrain).values({
          controleId: control.id,
          assujettiId,
          montantEcart: String(montantPrincipal ?? 0),
          montantPenalite: String(montantPenalite ?? 0),
          montantTotal: String(montantTotal ?? 0),
          statutPaiement: "paye",
          datePaiement: new Date(),
          referencePaiement: `MOMO-${Math.random().toString(36).substring(7).toUpperCase()}`,
        });
      }

      return control;
    });

    // SMS à l'assujetti après contrôle terrain (sender: rtnc rdv)
    try {
      const [a] = await db
        .select({
          nomRaisonSociale: assujettis.nomRaisonSociale,
          telephonePrincipal: assujettis.telephonePrincipal,
        })
        .from(assujettis)
        .where(eq(assujettis.id, assujettiId))
        .limit(1);
      if (a?.telephonePrincipal) {
        const ref = `MOMO-${Date.now().toString(36).toUpperCase()}`;
        await sendControlNotificationSms({
          phone: a.telephonePrincipal,
          nom: a.nomRaisonSociale ?? "Assujetti",
          montant: `${Number(montantTotal ?? 0).toFixed(0)} $`,
          periode: String(exercice ?? new Date().getFullYear()),
          reference: ref,
        });
      }
    } catch (smsErr) {
      console.error("SMS notification contrôle:", smsErr);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    console.error("Mobile save control error:", e);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
