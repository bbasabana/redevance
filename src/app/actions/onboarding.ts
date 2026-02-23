"use server";

import { db } from "@/db";
import { appUsers, onboardingProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function saveIdentificationStep(
    userId: string,
    step: number,
    data: any
) {
    try {
        // Step mapping:
        // step 0/1 => Type d'Identité / Info -> step1Data
        // step 2 => Déclaration d'Appareils -> step2Data
        // step 3 => Documents & Signatures -> step3Data

        let updateData: any = {
            lastStep: step,
            status: `step_${step}_done`,
            updatedAt: new Date()
        };

        if (step === 1) updateData.step1Data = data;
        else if (step === 2) updateData.step2Data = data;
        else if (step === 3) updateData.step3Data = data;

        const existing = await db.query.onboardingProgress.findFirst({
            where: eq(onboardingProgress.userId, userId)
        });

        if (existing) {
            await db.update(onboardingProgress)
                .set(updateData)
                .where(eq(onboardingProgress.userId, userId));
        } else {
            await db.insert(onboardingProgress).values({
                userId,
                ...updateData
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error saving identification step:", error);
        return { success: false, error: "Failed to save step" };
    }
}

export async function completeIdentification(userId: string) {
    try {
        await db.update(onboardingProgress)
            .set({
                status: "completed",
                completedAt: new Date(),
                lastStep: 4,
            })
            .where(eq(onboardingProgress.userId, userId));

        await db.update(appUsers)
            .set({ identificationCompleted: true })
            .where(eq(appUsers.id, userId));

        return { success: true };
    } catch (error) {
        console.error("Error completing identification:", error);
        return { success: false, error: "Failed to complete identification" };
    }
}
