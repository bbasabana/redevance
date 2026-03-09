"use server";

import { db } from "@/db";
import {
  assujettis,
  appUsers,
  controlesTerrain,
  notesRectificativesTerrain,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export type PendingControlRow = {
  id: string;
  assujettiId: string;
  agentId: string;
  exercice: number;
  dateControle: Date | null;
  nbTvDeclare: number;
  nbRadioDeclare: number;
  nbTvConstate: number;
  nbRadioConstate: number;
  nomAssujetti: string | null;
  identifiantFiscal: string | null;
  montantTotal: string | null;
};

export async function getPendingControlsAction(): Promise<
  { success: true; data: PendingControlRow[] } | { success: false; error: string }
> {
  const session = await getSession();
  if (!session?.user?.userId) return { success: false, error: "Non autorisé" };
  if (session.user.role !== "admin")
    return { success: false, error: "Réservé aux administrateurs" };

  try {
    const rows = await db
      .select({
        id: controlesTerrain.id,
        assujettiId: controlesTerrain.assujettiId,
        agentId: controlesTerrain.agentId,
        exercice: controlesTerrain.exercice,
        dateControle: controlesTerrain.dateControle,
        nbTvDeclare: controlesTerrain.nbTvDeclare,
        nbRadioDeclare: controlesTerrain.nbRadioDeclare,
        nbTvConstate: controlesTerrain.nbTvConstate,
        nbRadioConstate: controlesTerrain.nbRadioConstate,
        nomAssujetti: assujettis.nomRaisonSociale,
        identifiantFiscal: assujettis.identifiantFiscal,
        montantTotal: notesRectificativesTerrain.montantTotal,
      })
      .from(controlesTerrain)
      .innerJoin(assujettis, eq(controlesTerrain.assujettiId, assujettis.id))
      .leftJoin(
        notesRectificativesTerrain,
        eq(notesRectificativesTerrain.controleId, controlesTerrain.id)
      )
      .where(eq(controlesTerrain.statutValidationAdmin, "pending"))
      .orderBy(desc(controlesTerrain.dateControle));

    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        assujettiId: r.assujettiId,
        agentId: r.agentId,
        exercice: r.exercice,
        dateControle: r.dateControle,
        nbTvDeclare: r.nbTvDeclare,
        nbRadioDeclare: r.nbRadioDeclare,
        nbTvConstate: r.nbTvConstate,
        nbRadioConstate: r.nbRadioConstate,
        nomAssujetti: r.nomAssujetti,
        identifiantFiscal: r.identifiantFiscal,
        montantTotal: r.montantTotal,
      })),
    };
  } catch (e) {
    console.error("getPendingControls error:", e);
    return { success: false, error: "Erreur serveur" };
  }
}

export type ControlDetailForAdmin = {
  controleId: string;
  exercice: number;
  dateControle: Date | null;
  nbTvDeclare: number;
  nbRadioDeclare: number;
  nbTvConstate: number;
  nbRadioConstate: number;
  /** Données actuelles en base (assujetti) */
  ancien: Record<string, string | null>;
  /** Données constatées par l'agent (à valider) */
  nouveau: Record<string, string | null>;
  montantTotal: string | null;
};

const ID_FIELDS = [
  "nomRaisonSociale",
  "typePersonne",
  "nif",
  "rccm",
  "idNat",
  "representantLegal",
  "adresseSiege",
  "adresseConstatee",
  "typeStructure",
  "typeActivite",
  "sousTypePm",
] as const;

export async function getControlDetailAction(
  controleId: string
): Promise<
  { success: true; data: ControlDetailForAdmin } | { success: false; error: string }
> {
  const session = await getSession();
  if (!session?.user?.userId) return { success: false, error: "Non autorisé" };
  if (session.user.role !== "admin")
    return { success: false, error: "Réservé aux administrateurs" };

  try {
    const [row] = await db
      .select({
        id: controlesTerrain.id,
        assujettiId: controlesTerrain.assujettiId,
        exercice: controlesTerrain.exercice,
        dateControle: controlesTerrain.dateControle,
        nbTvDeclare: controlesTerrain.nbTvDeclare,
        nbRadioDeclare: controlesTerrain.nbRadioDeclare,
        nbTvConstate: controlesTerrain.nbTvConstate,
        nbRadioConstate: controlesTerrain.nbRadioConstate,
        dataConstateeIdentification: controlesTerrain.dataConstateeIdentification,
      })
      .from(controlesTerrain)
      .where(eq(controlesTerrain.id, controleId))
      .limit(1);

    if (!row) return { success: false, error: "Contrôle introuvable" };

    const [assujetti] = await db
      .select()
      .from(assujettis)
      .where(eq(assujettis.id, row.assujettiId))
      .limit(1);
    if (!assujetti) return { success: false, error: "Assujetti introuvable" };

    const constat = (row.dataConstateeIdentification as Record<string, string | null> | null) ?? {};
    const ancien: Record<string, string | null> = {};
    for (const k of ID_FIELDS) {
      const v = assujetti[k as keyof typeof assujetti];
      ancien[k] = v != null ? String(v) : null;
    }
    const nouveau: Record<string, string | null> = {};
    for (const k of ID_FIELDS) {
      nouveau[k] = constat[k] ?? null;
    }

    const [note] = await db
      .select({ montantTotal: notesRectificativesTerrain.montantTotal })
      .from(notesRectificativesTerrain)
      .where(eq(notesRectificativesTerrain.controleId, controleId))
      .limit(1);

    return {
      success: true,
      data: {
        controleId: row.id,
        exercice: row.exercice,
        dateControle: row.dateControle,
        nbTvDeclare: row.nbTvDeclare,
        nbRadioDeclare: row.nbRadioDeclare,
        nbTvConstate: row.nbTvConstate,
        nbRadioConstate: row.nbRadioConstate,
        ancien,
        nouveau,
        montantTotal: note?.montantTotal ?? null,
      },
    };
  } catch (e) {
    console.error("getControlDetail error:", e);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function approveControlAction(controleId: string): Promise<
  { success: true } | { success: false; error: string }
> {
  const session = await getSession();
  if (!session?.user?.userId) return { success: false, error: "Non autorisé" };
  if (session.user.role !== "admin")
    return { success: false, error: "Réservé aux administrateurs" };

  try {
    const [row] = await db
      .select({
        assujettiId: controlesTerrain.assujettiId,
        dataConstateeIdentification: controlesTerrain.dataConstateeIdentification,
      })
      .from(controlesTerrain)
      .where(and(eq(controlesTerrain.id, controleId), eq(controlesTerrain.statutValidationAdmin, "pending")))
      .limit(1);

    if (!row) return { success: false, error: "Contrôle introuvable ou déjà traité" };

    const constat = (row.dataConstateeIdentification as Record<string, string> | null) ?? {};
    const updateAssujetti: Record<string, unknown> = {
      validationStatus: "validated",
      dateValidation: new Date(),
      validateurId: session!.user!.userId,
      updatedAt: new Date(),
    };
    if (constat.nomRaisonSociale != null && constat.nomRaisonSociale !== "") updateAssujetti.nomRaisonSociale = constat.nomRaisonSociale;
    if (constat.typePersonne != null && constat.typePersonne !== "") updateAssujetti.typePersonne = constat.typePersonne;
    if (constat.nif != null) updateAssujetti.nif = constat.nif;
    if (constat.rccm != null) updateAssujetti.rccm = constat.rccm;
    if (constat.idNat != null) updateAssujetti.idNat = constat.idNat;
    if (constat.representantLegal != null) updateAssujetti.representantLegal = constat.representantLegal;
    const adresse = (constat.adresseConstatee ?? constat.adresseSiege)?.trim();
    if (adresse) updateAssujetti.adresseSiege = adresse;
    if (constat.typeStructure != null) updateAssujetti.typeStructure = constat.typeStructure;
    if (constat.typeActivite != null) updateAssujetti.typeActivite = constat.typeActivite;
    if (constat.sousTypePm != null) updateAssujetti.sousTypePm = constat.sousTypePm;

    await db.transaction(async (tx) => {
      await tx
        .update(assujettis)
        .set(updateAssujetti as any)
        .where(eq(assujettis.id, row.assujettiId));

      await tx
        .update(controlesTerrain)
        .set({ statutValidationAdmin: "approved", updatedAt: new Date() })
        .where(eq(controlesTerrain.id, controleId));
    });

    return { success: true };
  } catch (e) {
    console.error("approveControl error:", e);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function rejectControlAction(controleId: string): Promise<
  { success: true } | { success: false; error: string }
> {
  const session = await getSession();
  if (!session?.user?.userId) return { success: false, error: "Non autorisé" };
  if (session.user.role !== "admin")
    return { success: false, error: "Réservé aux administrateurs" };

  try {
    const [row] = await db
      .select({ assujettiId: controlesTerrain.assujettiId })
      .from(controlesTerrain)
      .where(and(eq(controlesTerrain.id, controleId), eq(controlesTerrain.statutValidationAdmin, "pending")))
      .limit(1);

    if (!row) return { success: false, error: "Contrôle introuvable ou déjà traité" };

    await db.transaction(async (tx) => {
      await tx
        .update(controlesTerrain)
        .set({ statutValidationAdmin: "rejected", updatedAt: new Date() })
        .where(eq(controlesTerrain.id, controleId));
      await tx
        .update(assujettis)
        .set({
          validationStatus: "rejected",
          dateValidation: new Date(),
          validateurId: session!.user!.userId,
          updatedAt: new Date(),
        })
        .where(eq(assujettis.id, row.assujettiId));
    });

    return { success: true };
  } catch (e) {
    console.error("rejectControl error:", e);
    return { success: false, error: "Erreur serveur" };
  }
}
