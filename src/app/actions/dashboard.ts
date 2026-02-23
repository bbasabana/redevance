"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { assujettis, notesTaxation, paiements, declarations, lignesDeclaration } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export type DashboardStatus =
    | "COMPLIANT"
    | "PAYMENT_PENDING"
    | "AWAITING_CONFIRMATION"
    | "OVERDUE"
    | "RENEWAL_REQUIRED"
    | "NEW_ASSUJETTI"
    | "INITIAL_DECLARATION_REQUIRED";

export interface DashboardRoutingResult {
    status: DashboardStatus;
    noteCourante?: any;
    paiementEnCours?: any;
    notePrecedente?: any;
    deviceSummary?: {
        tv: number;
        radio: number;
    };
    classification?: string | null;
}

export async function getDashboardRouting(): Promise<DashboardRoutingResult> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Non autorisé");
    }

    // 1. Fetch Assujetti Profile
    const [assujetti] = await db
        .select()
        .from(assujettis)
        .where(eq(assujettis.userId, session.user.id))
        .limit(1);

    if (!assujetti) {
        return { status: "NEW_ASSUJETTI" };
    }

    const currentYear = new Date().getFullYear();

    // 2. Chercher la note de l'année en cours
    const [noteCourante] = await db
        .select()
        .from(notesTaxation)
        .where(
            and(
                eq(notesTaxation.assujettiId, assujetti.id),
                eq(notesTaxation.exercice, currentYear)
            )
        )
        .orderBy(desc(notesTaxation.createdAt))
        .limit(1);

    if (noteCourante) {
        // L'assujetti a une note pour l'année en cours

        // Est-ce qu'elle est payée intégralement ?
        if (noteCourante.statut === "payee") {
            return { status: "COMPLIANT", noteCourante };
        }

        // Chercher s'il y a un paiement 'en_attente' pour cette note
        const [paiementAttente] = await db
            .select()
            .from(paiements)
            .where(
                and(
                    eq(paiements.noteTaxationId, noteCourante.id),
                    eq(paiements.statut, "en_attente")
                )
            )
            .limit(1);

        if (paiementAttente) {
            return { status: "AWAITING_CONFIRMATION", noteCourante, paiementEnCours: paiementAttente };
        }

        // Si la note est partielle ou non payée
        const isOverdue = noteCourante.dateEcheance ? new Date(noteCourante.dateEcheance) < new Date() : false;

        return {
            status: isOverdue ? "OVERDUE" : "PAYMENT_PENDING",
            noteCourante
        };
    }

    // 3. Pas de note pour l'année en cours
    // Peut-être qu'on est en période de renouvellement (e.g. fin d'année, et il a une note N-1)
    const [notePrecedente] = await db
        .select()
        .from(notesTaxation)
        .where(
            and(
                eq(notesTaxation.assujettiId, assujetti.id),
                eq(notesTaxation.exercice, currentYear - 1)
            )
        )
        .orderBy(desc(notesTaxation.createdAt))
        .limit(1);

    if (notePrecedente && notePrecedente.statut === "payee") {
        return { status: "RENEWAL_REQUIRED", notePrecedente };
    }

    // 4. Fetch Device Summary for the current exercise if profil is complete
    let deviceSummary = undefined;
    if (assujetti.profilComplet) {
        const [latestDecl] = await db
            .select()
            .from(declarations)
            .where(and(
                eq(declarations.assujettiId, assujetti.id),
                eq(declarations.exercice, currentYear)
            ))
            .orderBy(desc(declarations.createdAt))
            .limit(1);

        if (latestDecl) {
            const lignes = await db
                .select()
                .from(lignesDeclaration)
                .where(eq(lignesDeclaration.declarationId, latestDecl.id));

            deviceSummary = {
                tv: lignes.find(l => l.categorieAppareil === "Téléviseurs")?.nombre || 0,
                radio: lignes.find(l => l.categorieAppareil === "Radios")?.nombre || 0
            };
        }
    }

    // Determine status if no current note was found
    const status = assujetti.profilComplet
        ? "INITIAL_DECLARATION_REQUIRED"
        : "NEW_ASSUJETTI";

    return {
        status,
        notePrecedente,
        deviceSummary,
        classification: assujetti.sousTypePm
    };
}
