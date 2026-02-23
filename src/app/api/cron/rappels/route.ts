import { NextResponse } from "next/server";
import { db } from "@/db";
import { notesTaxation, appUsers, assujettis, rappels } from "@/db/schema";
import { eq, and, sql, lt, inArray } from "drizzle-orm";
import { sendEmail, generateGenericReminderHtml } from "@/lib/notifications/mailer";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    if (process.env.NODE_ENV === "production" && searchParams.get("secret") !== process.env.CRON_SECRET) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];

        // Fetch notes that are not paid and have been remitted (date_remise exists)
        const activeNotes = await db.select({
            note: notesTaxation,
            assujetti: assujettis,
            user: appUsers
        })
            .from(notesTaxation)
            .innerJoin(assujettis, eq(notesTaxation.assujettiId, assujettis.id))
            .innerJoin(appUsers, eq(assujettis.userId, appUsers.id))
            .where(
                and(
                    inArray(notesTaxation.statut, ["emise", "partiellement_payee", "en_retard"]),
                    sql`${notesTaxation.dateRemise} IS NOT NULL`
                )
            );

        const results = [];

        for (const record of activeNotes) {
            const dateRemise = new Date(record.note.dateRemise!);
            const daysSinceRemise = Math.floor((now.getTime() - dateRemise.getTime()) / (1000 * 60 * 60 * 24));

            let stage: "j15" | "j30" | "relance" | "mise_en_demeure" | null = null;
            let stageKey: "j15" | "j30" | "relance" | "mise_en_demeure" | null = null;
            let mailStage: string | null = null;
            let noteStatutUpdate: typeof notesTaxation.$inferSelect.statut | null = null;

            if (daysSinceRemise === 15) {
                stage = "j15";
                mailStage = "j15";
            } else if (daysSinceRemise === 25) {
                stage = "j30";
                mailStage = "warning";
            } else if (daysSinceRemise === 30) {
                stage = "relance";
                mailStage = "relance";
                noteStatutUpdate = "en_retard";
            } else if (daysSinceRemise === 38) {
                stage = "mise_en_demeure";
                mailStage = "mise_en_demeure";
                noteStatutUpdate = "contentieux";
            }

            if (stage && mailStage) {
                // Check if reminder for this stage already sent
                const [existing] = await db.select()
                    .from(rappels)
                    .where(
                        and(
                            eq(rappels.noteTaxationId, record.note.id),
                            eq(rappels.typeRappel, stage)
                        )
                    )
                    .limit(1);

                if (!existing) {
                    // 1. Send Notification
                    await sendEmail({
                        to: record.user.email,
                        subject: mailStage === "j15" ? "Rappel amical" :
                            mailStage === "warning" ? "URGENT: Échéance Proche" :
                                mailStage === "relance" ? "LETTRE DE RELANCE" : "MISE EN DEMEURE",
                        html: generateGenericReminderHtml(
                            record.user.nomPrenom,
                            record.note.numeroNote || "",
                            record.note.montantTotalDu,
                            record.note.dateEcheance || "",
                            mailStage
                        )
                    });

                    // 2. Log Rappel
                    await db.insert(rappels).values({
                        assujettiId: record.assujetti.id,
                        noteTaxationId: record.note.id,
                        typeRappel: stage as any, // Cast to any to bypass strict enum check if needed, though it should match
                        canal: "email",
                        statut: "envoye",
                        datePlanifiee: now,
                        dateEnvoi: now,
                    });

                    // 3. Update Note Status if needed
                    if (noteStatutUpdate) {
                        await db.update(notesTaxation)
                            .set({ statut: noteStatutUpdate })
                            .where(eq(notesTaxation.id, record.note.id));
                    }

                    results.push({ note: record.note.numeroNote, stage, user: record.user.email });
                }
            }
        }

        return NextResponse.json({ success: true, count: results.length, details: results });
    } catch (error) {
        console.error("Cron error:", error);
        return NextResponse.json({ success: false, error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }
}
