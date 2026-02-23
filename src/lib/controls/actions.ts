"use server";

import { db } from "@/db";
import { controles, procesVerbaux, notesRectificatives, assujettis, notesTaxation } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function planControl(data: {
    assujettiId: string;
    typeControle: "sur_pieces" | "sur_place" | "visite_domiciliaire" | "perquisition";
    agentId: string;
    datePlanifiee: string;
}) {
    const session = await auth();
    const user = session?.user;
    const userRole = (user as any)?.userType; // Using userType as per auth.ts

    if (!user || !["admin", "superviseur"].includes(userRole)) {
        throw new Error("Unauthorized");
    }

    const [newControl] = await db.insert(controles).values({
        assujettiId: data.assujettiId,
        typeControle: data.typeControle,
        agentId: data.agentId,
        datePlanifiee: data.datePlanifiee,
        statut: "planifie",
    }).returning();

    revalidatePath("/agent/controles");
    return { success: true, controlId: newControl.id };
}

export async function submitControlReport(controlId: string, data: {
    observations: string;
    hasInfraction: boolean;
    infractionsDetails?: string;
}) {
    const session = await auth();
    const user = session?.user;
    const userRole = (user as any)?.userType;

    if (!user || !user.id || !["agent", "superviseur"].includes(userRole)) {
        throw new Error("Unauthorized");
    }

    // Capture user.id in a local variable for the closure
    const userId = user.id;

    await db.transaction(async (tx) => {
        // 1. Update control report
        await tx.update(controles)
            .set({
                observations: data.observations,
                statut: "realise",
                dateRealisee: new Date().toISOString().split("T")[0],
            })
            .where(eq(controles.id, controlId));

        // 2. If infraction, create PV
        if (data.hasInfraction && data.infractionsDetails) {
            const [pv] = await tx.insert(procesVerbaux).values({
                controleId: controlId,
                agentOpjId: userId,
                infractionsConstatees: data.infractionsDetails,
            }).returning();

            // 3. Update assujetti status to 'redevable' or similar
            const [controlRecord] = await tx.select().from(controles).where(eq(controles.id, controlId)).limit(1);
            if (controlRecord) {
                await tx.update(assujettis)
                    .set({ statut: "redevable" })
                    .where(eq(assujettis.id, controlRecord.assujettiId!));
            }
        }
    });

    revalidatePath("/agent/controles");
    return { success: true };
}

export async function generateRectificationNote(pvId: string, data: {
    noteOriginalId: string;
    penalites: string;
    motif: string;
}) {
    const session = await auth();
    const user = session?.user;
    const userRole = (user as any)?.userType;

    if (!user || !["directeur", "superviseur"].includes(userRole)) {
        throw new Error("Unauthorized");
    }

    const [pv] = await db.select().from(procesVerbaux).where(eq(procesVerbaux.id, pvId)).limit(1);
    if (!pv) throw new Error("PV not found");

    const [originalNote] = await db.select().from(notesTaxation).where(eq(notesTaxation.id, data.noteOriginalId)).limit(1);

    const [rectification] = await db.insert(notesRectificatives).values({
        noteOriginalId: data.noteOriginalId,
        assujettiId: originalNote?.assujettiId,
        pvId: pvId,
        penalites: data.penalites,
        motif: data.motif,
        statut: "brouillon",
    }).returning();

    revalidatePath("/agent/taxation");
    return { success: true, rectificationId: rectification.id };
}
