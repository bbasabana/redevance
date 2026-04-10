"use server";

import { db } from "@/db";
import { periodesDeclaration } from "@/db/schema";
import { and, asc, eq, ne } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin/audit";

const PeriodeBody = z.object({
    exercice: z.coerce.number().int().min(2000).max(2100),
    dateOuverture: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dateFermeture: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    isActive: z.boolean().optional().default(true),
});

const PeriodeUpdate = PeriodeBody.extend({
    id: z.string().uuid(),
});

export type PeriodeRow = {
    id: string;
    exercice: number;
    dateOuverture: string;
    dateFermeture: string;
    isActive: boolean | null;
};

async function requireAdmin() {
    const s = await getSession();
    if (!s || s.user.role !== "admin") return null;
    return s.user;
}

export async function listPeriodesAction(): Promise<
    { success: true; data: PeriodeRow[] } | { success: false; error: string }
> {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: "Non autorisé" };

    try {
        const rows = await db
            .select()
            .from(periodesDeclaration)
            .orderBy(asc(periodesDeclaration.exercice));

        const toYmd = (d: string | Date) =>
            typeof d === "string" ? d.slice(0, 10) : d.toISOString().slice(0, 10);

        return {
            success: true,
            data: rows.map((r) => ({
                id: r.id,
                exercice: r.exercice,
                dateOuverture: toYmd(r.dateOuverture as string | Date),
                dateFermeture: toYmd(r.dateFermeture as string | Date),
                isActive: r.isActive,
            })),
        };
    } catch (e) {
        console.error("listPeriodesAction", e);
        return { success: false, error: "Erreur chargement périodes" };
    }
}

export async function createPeriodeAction(
    raw: z.infer<typeof PeriodeBody>
): Promise<{ success: true; id: string } | { success: false; error: string }> {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: "Non autorisé" };

    const parsed = PeriodeBody.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Données invalides" };
    const v = parsed.data;

    if (v.dateFermeture < v.dateOuverture) {
        return { success: false, error: "La date de fermeture doit être après l’ouverture." };
    }

    try {
        const [dup] = await db
            .select({ id: periodesDeclaration.id })
            .from(periodesDeclaration)
            .where(eq(periodesDeclaration.exercice, v.exercice))
            .limit(1);

        if (dup) {
            return { success: false, error: "Un exercice avec ce millésime existe déjà." };
        }

        const [created] = await db
            .insert(periodesDeclaration)
            .values({
                exercice: v.exercice,
                dateOuverture: v.dateOuverture,
                dateFermeture: v.dateFermeture,
                isActive: v.isActive ?? true,
            })
            .returning({ id: periodesDeclaration.id });

        await logAdminAction({
            userId: admin.userId,
            action: "periode.create",
            targetType: "periode_declaration",
            targetId: created!.id,
            summary: `Exercice ${v.exercice}`,
        });

        revalidatePath("/x-rtnc-management-safe/periodes");
        return { success: true, id: created!.id };
    } catch (e) {
        console.error("createPeriodeAction", e);
        return { success: false, error: "Création impossible" };
    }
}

export async function updatePeriodeAction(
    raw: z.infer<typeof PeriodeUpdate>
): Promise<{ success: true } | { success: false; error: string }> {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: "Non autorisé" };

    const parsed = PeriodeUpdate.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Données invalides" };
    const v = parsed.data;

    if (v.dateFermeture < v.dateOuverture) {
        return { success: false, error: "La date de fermeture doit être après l’ouverture." };
    }

    try {
        const [conflict] = await db
            .select({ id: periodesDeclaration.id })
            .from(periodesDeclaration)
            .where(
                and(eq(periodesDeclaration.exercice, v.exercice), ne(periodesDeclaration.id, v.id))
            )
            .limit(1);

        if (conflict) {
            return { success: false, error: "Ce millésime est déjà utilisé par une autre période." };
        }

        await db
            .update(periodesDeclaration)
            .set({
                exercice: v.exercice,
                dateOuverture: v.dateOuverture,
                dateFermeture: v.dateFermeture,
                isActive: v.isActive ?? true,
            })
            .where(eq(periodesDeclaration.id, v.id));

        await logAdminAction({
            userId: admin.userId,
            action: "periode.update",
            targetType: "periode_declaration",
            targetId: v.id,
            summary: `Exercice ${v.exercice}`,
        });

        revalidatePath("/x-rtnc-management-safe/periodes");
        return { success: true };
    } catch (e) {
        console.error("updatePeriodeAction", e);
        return { success: false, error: "Mise à jour impossible" };
    }
}

export async function deletePeriodeAction(
    id: string
): Promise<{ success: true } | { success: false; error: string }> {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: "Non autorisé" };

    const pid = z.string().uuid().safeParse(id);
    if (!pid.success) return { success: false, error: "Identifiant invalide" };

    try {
        await db.delete(periodesDeclaration).where(eq(periodesDeclaration.id, pid.data));

        await logAdminAction({
            userId: admin.userId,
            action: "periode.delete",
            targetType: "periode_declaration",
            targetId: pid.data,
        });

        revalidatePath("/x-rtnc-management-safe/periodes");
        return { success: true };
    } catch (e) {
        console.error("deletePeriodeAction", e);
        return { success: false, error: "Suppression impossible" };
    }
}
