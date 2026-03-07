import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  assujettis,
  controlesTerrain,
  notesRectificativesTerrain,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getBearerTokenFromRequest, verifyMobileToken } from "@/lib/auth/jwt-mobile";
import { sendControlNotificationSms } from "@/lib/sms/messagebird";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

    const result = await db.transaction(async (tx) => {
      const [control] = await tx
        .insert(controlesTerrain)
        .values({
          assujettiId,
          agentId: payload!.userId,
          exercice: exercice || new Date().getFullYear(),
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
