"use server";

import { db } from "@/db";
import { notesTaxation, paiements, appUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { getSession } from "@/lib/auth/session";
import { logAdminAction } from "@/lib/admin/audit";

const SubmitPaymentSchema = z.object({
    noteTaxationId: z.string().uuid(),
    montant: z.number().positive(),
    canal: z.enum(["banque", "mtn_money", "airtel_money", "orange_money", "autre"]),
    referenceTransaction: z.string().optional(),
    preuveUrl: z.string().optional(),
});

export async function submitPartialPayment(data: z.infer<typeof SubmitPaymentSchema>) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Non authentifié" };

        const validated = SubmitPaymentSchema.parse(data);

        // Verify note exists
        const [note] = await db
            .select()
            .from(notesTaxation)
            .where(eq(notesTaxation.id, validated.noteTaxationId))
            .limit(1);

        if (!note) return { success: false, error: "Note de taxation introuvable" };

        // Create payment entry
        await db.insert(paiements).values({
            noteTaxationId: validated.noteTaxationId,
            assujettiId: note.assujettiId,
            montant: validated.montant.toString(),
            canal: validated.canal,
            referenceTransaction: validated.referenceTransaction,
            preuveUrl: validated.preuveUrl,
            statut: "en_attente",
            datePaiement: new Date().toISOString().split('T')[0],
        });

        return { success: true };
    } catch (error) {
        console.error("Error submitting payment:", error);
        return { success: false, error: "Erreur lors de la soumission du paiement" };
    }
}

export async function confirmPayment(paymentId: string) {
    try {
        const session = await auth();
        // Only admins/agents can confirm (role check would be here in a real app)
        if (!session?.user?.id) return { success: false, error: "Non autorisé" };

        const [snapshot] = await db
            .select({
                montant: paiements.montant,
                assujettiId: paiements.assujettiId,
                noteTaxationId: paiements.noteTaxationId,
            })
            .from(paiements)
            .where(eq(paiements.id, paymentId))
            .limit(1);

        await db.transaction(async (tx) => {
            const [payment] = await tx
                .select()
                .from(paiements)
                .where(eq(paiements.id, paymentId))
                .limit(1);

            if (!payment || !payment.noteTaxationId) throw new Error("Paiement introuvable");
            if (payment.statut === "confirme") throw new Error("Paiement déjà confirmé");

            // 1. Confirm the payment record
            await tx.update(paiements)
                .set({
                    statut: "confirme",
                    confirmeParId: session?.user?.id as string,
                    confirmeAt: new Date()
                })
                .where(eq(paiements.id, paymentId));

            // 2. Fetch the note and current totals
            const [note] = await tx
                .select()
                .from(notesTaxation)
                .where(eq(notesTaxation.id, payment.noteTaxationId))
                .limit(1);

            if (!note) throw new Error("Note introuvable");

            const currentPaid = Number(note.montantPaye || 0);
            const paymentAmount = Number(payment.montant);
            const totalDue = Number(note.montantTotalDu);
            
            const newPaid = currentPaid + paymentAmount;
            const newSolde = Math.max(0, totalDue - newPaid);

            // 3. Update the note balance and status
            let newStatus: any = "partiellement_payee";
            if (newSolde <= 0) {
                newStatus = "payee";
            }

            await tx.update(notesTaxation)
                .set({
                    montantPaye: newPaid.toString(),
                    solde: newSolde.toString(),
                    statut: newStatus,
                    updatedAt: new Date()
                })
                .where(eq(notesTaxation.id, note.id));
        });

        const jwt = await getSession();
        if (jwt?.user?.role === "admin" && snapshot) {
            await logAdminAction({
                userId: jwt.user.userId,
                action: "paiement.admin_confirm",
                targetType: "paiement",
                targetId: paymentId,
                summary: `Confirmer paiement ${paymentId.slice(0, 8)}… — ${snapshot.montant} USD — assujetti ${snapshot.assujettiId?.slice(0, 8) ?? "?"}…`,
                metadata: {
                    montant: snapshot.montant,
                    assujettiId: snapshot.assujettiId,
                    noteTaxationId: snapshot.noteTaxationId,
                },
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error confirming payment:", error);
        return { success: false, error: error.message || "Erreur lors de la confirmation" };
    }
}

export async function getPaymentHistory(noteId: string) {
    try {
        const history = await db
            .select()
            .from(paiements)
            .where(eq(paiements.noteTaxationId, noteId))
            .orderBy(paiements.createdAt);

        return { success: true, data: history };
    } catch (error) {
        console.error("Error fetching payment history:", error);
        return { success: false, error: "Impossible de récupérer l'historique" };
    }
}
