"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { paiements, notesTaxation, assujettis } from "@/db/schema";
import { eq, sum, and } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const paymentSchema = z.object({
    noteTaxationId: z.string().uuid(),
    montant: z.number().positive(),
    canal: z.enum(["banque", "mtn_money", "airtel_money", "orange_money", "autre"]),
    referenceTransaction: z.string().min(1),
    banqueNom: z.string().optional(),
    numeroCompteDebiteur: z.string().optional(),
    datePaiement: z.string(), // ISO date
    preuveUrl: z.string().optional(),
});

/**
 * Register a payment (typically called by an Agent or when an Assujetti uploads proof)
 */
export async function registerPayment(data: z.infer<typeof paymentSchema>) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "UNAUTHORIZED" };

        const userId = session.user.id;
        const validatedData = paymentSchema.parse(data);

        // Fetch Note to get AssujettiId
        const [note] = await db.select().from(notesTaxation).where(eq(notesTaxation.id, validatedData.noteTaxationId)).limit(1);
        if (!note) return { success: false, error: "NOTE_NOT_FOUND" };

        const [payment] = await db.insert(paiements).values({
            noteTaxationId: validatedData.noteTaxationId,
            assujettiId: note.assujettiId,
            montant: validatedData.montant.toString(),
            canal: validatedData.canal,
            referenceTransaction: validatedData.referenceTransaction,
            banqueNom: validatedData.banqueNom,
            numeroCompteDebiteur: validatedData.numeroCompteDebiteur,
            datePaiement: validatedData.datePaiement,
            preuveUrl: validatedData.preuveUrl,
            statut: "en_attente",
        }).returning();

        revalidatePath("/agent/paiements");
        revalidatePath(`/assujetti/mes-notes/${validatedData.noteTaxationId}`);

        return { success: true, paymentId: payment.id };
    } catch (error) {
        console.error("Register payment error:", error);
        return { success: false, error: "INTERNAL_SERVER_ERROR" };
    }
}

/**
 * Validate a payment (Typically Agent/Superviseur action)
 */
export async function validatePayment(paymentId: string, status: "confirme" | "rejete", motifRejet?: string) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "UNAUTHORIZED" };

        const validatorId = session.user.id;

        const result = await db.transaction(async (tx) => {
            const [payment] = await tx.select().from(paiements).where(eq(paiements.id, paymentId)).limit(1);
            if (!payment) throw new Error("PAYMENT_NOT_FOUND");
            if (payment.statut !== "en_attente") throw new Error("PAYMENT_ALREADY_PROCESSED");

            // 1. Update Payment Statut
            await tx.update(paiements).set({
                statut: status,
                confirmeParId: validatorId,
                confirmeAt: new Date(),
                motifRejet: status === "rejete" ? motifRejet : null,
            }).where(eq(paiements.id, paymentId));

            if (status === "confirme") {
                // 2. Fetch all confirmed payments for this note to check balance
                const [agg] = await tx.select({
                    totalPaid: sum(paiements.montant)
                })
                    .from(paiements)
                    .where(and(
                        eq(paiements.noteTaxationId, payment.noteTaxationId!),
                        eq(paiements.statut, "confirme")
                    ));

                const totalPaid = parseFloat(agg.totalPaid || "0");

                const [note] = await tx.select().from(notesTaxation).where(eq(notesTaxation.id, payment.noteTaxationId!)).limit(1);
                const totalDue = parseFloat(note.montantTotalDu);

                // 3. Update Note Statut
                let noteStatut: "payee" | "partiellement_payee" = "partiellement_payee";
                if (totalPaid >= totalDue) {
                    noteStatut = "payee";
                }

                await tx.update(notesTaxation).set({
                    statut: noteStatut
                }).where(eq(notesTaxation.id, payment.noteTaxationId!));

                // 4. Update Assujetti Statut if necessary
                // Check if ALL notes for this assujetti are paid
                const activeNotes = await tx.select().from(notesTaxation).where(and(
                    eq(notesTaxation.assujettiId, payment.assujettiId!),
                    eq(notesTaxation.exercice, note.exercice)
                ));

                const allPaid = activeNotes.every(n => n.statut === "payee" || (n.id === note.id && noteStatut === "payee"));

                if (allPaid) {
                    await tx.update(assujettis).set({
                        statut: "en_regle"
                    }).where(eq(assujettis.id, payment.assujettiId!));
                } else {
                    await tx.update(assujettis).set({
                        statut: "redevable"
                    }).where(eq(assujettis.id, payment.assujettiId!));
                }
            }

            return { success: true };
        });

        revalidatePath("/agent/paiements");
        revalidatePath("/agent/taxation");

        return result;
    } catch (error: any) {
        console.error("Validate payment error:", error);
        return { success: false, error: error.message || "INTERNAL_SERVER_ERROR" };
    }
}
export const recordPayment = registerPayment;
