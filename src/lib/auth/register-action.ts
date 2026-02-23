"use server";

import { db } from "@/db";
import { appUsers, assujettis, adminUsers, roles, userRoles } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendWelcomeEmail } from "../mail";
import { createFullSession } from "./session";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    nomPrenom: z.string().min(2),
    telephone: z.string().optional(),
    adresseSiege: z.string().min(5),
    commune: z.string().min(2),
    accountType: z.enum(["particulier", "entreprise"]),
    // DRC Administrative IDs - Relaxed patterns
    nif: z.string().regex(/^[A-Z0-9]{5,15}$/, "Format NIF invalide (Ex: A1006563)").optional().or(z.literal("")),
    // Enterprise
    raisonSociale: z.string().optional(),
    rccm: z.string().regex(/^[A-Z0-9\s'.:\/-]{5,40}$/, "Format RCCM invalide (Ex: CD/TRICOM/L'SHI/RCCM:14-B-1561)").optional().or(z.literal("")),
    representantLegal: z.string().min(2, "Le nom du représentant légal est requis").optional().or(z.literal("")),
});

export async function registerUser(formData: z.infer<typeof registerSchema>) {
    try {
        const validatedData = registerSchema.parse(formData);

        // 1. Check if user already exists in either table
        const [existingAppUser] = await db.select().from(appUsers).where(eq(appUsers.email, validatedData.email)).limit(1);
        const [existingAdminUser] = await db.select().from(adminUsers).where(eq(adminUsers.email, validatedData.email)).limit(1);

        if (existingAppUser || existingAdminUser) {
            return { success: false, error: "EMAIL_ALREADY_EXISTS" };
        }

        // 2. Hash password
        const passwordHash = await bcrypt.hash(validatedData.password, 10);

        // 3. Create App User
        const [newUser] = await db.insert(appUsers).values({
            email: validatedData.email,
            passwordHash,
            nomPrenom: validatedData.nomPrenom,
            telephone: validatedData.telephone,
            isActive: false, // Must be activated via identification completion
        }).returning({ id: appUsers.id });

        // 4. Assign Role
        const roleName = validatedData.accountType === "particulier" ? "particular" : "entreprise";
        const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
        if (role) {
            await db.insert(userRoles).values({
                userId: newUser.id,
                roleId: role.id,
            });
        }

        // 5. Create Assujetti Profile
        await db.insert(assujettis).values({
            userId: newUser.id,
            typePersonne: validatedData.accountType === "particulier" ? "pp" : "pm",
            nomRaisonSociale: validatedData.accountType === "particulier" ? validatedData.nomPrenom : (validatedData.raisonSociale || validatedData.nomPrenom),
            nif: validatedData.nif,
            rccm: validatedData.rccm,
            representantLegal: validatedData.representantLegal,
            adresseSiege: validatedData.adresseSiege,
            // Defaulting zone to urbaine for now as per simple setup, could be dynamic later
            zoneTarifaire: "urbaine",
            email: validatedData.email,
            telephonePrincipal: validatedData.telephone,
        });

        // 6. Send Welcome Email
        await sendWelcomeEmail(validatedData.email, validatedData.nomPrenom);

        // 7. Auto-create full session for immediate login
        await createFullSession(newUser.id, roleName || "assujetti", false);

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: "VALIDATION_ERROR", details: error.issues };
        }
        return { success: false, error: "INTERNAL_SERVER_ERROR" };
    }
}
