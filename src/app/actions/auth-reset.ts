"use server";

import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { sendSms } from "@/lib/sms/messagebird";

export async function requestPasswordReset(identifier: string) {
    try {
        if (!identifier || identifier.trim().length < 5) {
            return { success: false, error: "Veuillez entrer un email ou un numéro de téléphone valide." };
        }

        const cleanIdentifier = identifier.trim();

        // 1. Find user by email or phone
        const [user] = await db
            .select()
            .from(appUsers)
            .where(
                or(
                    eq(appUsers.email, cleanIdentifier),
                    eq(appUsers.telephone, cleanIdentifier)
                )
            )
            .limit(1);

        if (!user) {
            // For security reasons, we return success even if the user is not found
            return { 
                success: true, 
                message: "Si un compte correspond à cet identifiant, les instructions de réinitialisation vous seront envoyées." 
            };
        }

        // 2. Generate a simulated reset link
        // In a production environment, you would save a token in the database
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const baseUrl = process.env.NEXTAUTH_URL || "https://redevance.vercel.app";
        const resetLink = `${baseUrl}/panel/reset-password?token=${token}`;

        console.log(`[PASSWORD_RESET] Request for: ${user.email}`);
        console.log(`[PASSWORD_RESET] Action: Reset link generated: ${resetLink}`);

        // 3. Send notification (SMS or Email)
        // If it looks like an email, we'd send an email. If it's the phone, we send an SMS.
        if (cleanIdentifier.includes("@")) {
            // Email sending logic would go here
            console.log(`[EMAIL_MOCK] Sending password reset to ${user.email}`);
        } else if (user.telephone) {
            try {
                const body = `RTNC Redevance: Pour réinitialiser votre mot de passe, cliquez ici : ${resetLink}`;
                await sendSms([user.telephone], body);
                console.log(`[SMS_SENT] Reset link sent to ${user.telephone}`);
            } catch (smsErr) {
                console.error("[SMS_ERROR] Failed to send reset link:", smsErr);
            }
        }

        return { 
            success: true, 
            message: "Si un compte correspond à cet identifiant, les instructions de réinitialisation vous seront envoyées." 
        };
    } catch (error) {
        console.error("Error in requestPasswordReset:", error);
        return { success: false, error: "Une erreur technique est survenue. Veuillez réessayer plus tard." };
    }
}
