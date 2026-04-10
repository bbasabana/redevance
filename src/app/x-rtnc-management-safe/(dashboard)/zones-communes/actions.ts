"use server";

import { db } from "@/db";
import { assujettis, geographies, missionsTerrain } from "@/db/schema";
import { asc, count, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin/audit";
import { ADMIN_GEO_TYPES, ADMIN_LOC_CATS } from "@/admin/geo-constants";

const GeoBody = z.object({
    nom: z.string().min(1).max(255),
    type: z.enum(ADMIN_GEO_TYPES),
    parentId: z.string().uuid().nullable().optional(),
    category: z.enum(ADMIN_LOC_CATS).nullable().optional(),
    isActive: z.boolean().optional().default(true),
});

const GeoUpdate = GeoBody.extend({
    id: z.string().uuid(),
});

export type GeographyAdminRow = {
    id: string;
    nom: string;
    type: (typeof ADMIN_GEO_TYPES)[number];
    parentId: string | null;
    parentNom: string | null;
    category: string | null;
    isActive: boolean | null;
};

async function requireAdmin() {
    const s = await getSession();
    if (!s || s.user.role !== "admin") return null;
    return s.user;
}

export async function listGeographiesAdminAction(): Promise<
    { success: true; data: GeographyAdminRow[] } | { success: false; error: string }
> {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: "Non autorisé" };

    try {
        const rows = await db
            .select()
            .from(geographies)
            .orderBy(asc(geographies.type), asc(geographies.nom));

        const byId = new Map(rows.map((r) => [r.id, r]));

        return {
            success: true,
            data: rows.map((r) => ({
                id: r.id,
                nom: r.nom,
                type: r.type as GeographyAdminRow["type"],
                parentId: r.parentId,
                parentNom: r.parentId ? byId.get(r.parentId)?.nom ?? null : null,
                category: r.category ?? null,
                isActive: r.isActive,
            })),
        };
    } catch (e) {
        console.error("listGeographiesAdminAction", e);
        return { success: false, error: "Erreur chargement géographies" };
    }
}

export async function createGeographyAction(
    raw: z.infer<typeof GeoBody>
): Promise<{ success: true; id: string } | { success: false; error: string }> {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: "Non autorisé" };

    const parsed = GeoBody.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Données invalides" };
    const v = parsed.data;

    try {
        const [created] = await db
            .insert(geographies)
            .values({
                nom: v.nom,
                type: v.type,
                parentId: v.parentId ?? null,
                category: v.category ?? null,
                isActive: v.isActive ?? true,
            })
            .returning({ id: geographies.id });

        await logAdminAction({
            userId: admin.userId,
            action: "geography.create",
            targetType: "geography",
            targetId: created!.id,
            summary: `${v.type} ${v.nom}`,
        });

        revalidatePath("/x-rtnc-management-safe/zones-communes");
        return { success: true, id: created!.id };
    } catch (e) {
        console.error("createGeographyAction", e);
        return { success: false, error: "Création impossible" };
    }
}

export async function updateGeographyAction(
    raw: z.infer<typeof GeoUpdate>
): Promise<{ success: true } | { success: false; error: string }> {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: "Non autorisé" };

    const parsed = GeoUpdate.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Données invalides" };
    const v = parsed.data;

    if (v.parentId === v.id) {
        return { success: false, error: "Un lieu ne peut pas être son propre parent." };
    }

    try {
        await db
            .update(geographies)
            .set({
                nom: v.nom,
                type: v.type,
                parentId: v.parentId ?? null,
                category: v.category ?? null,
                isActive: v.isActive ?? true,
            })
            .where(eq(geographies.id, v.id));

        await logAdminAction({
            userId: admin.userId,
            action: "geography.update",
            targetType: "geography",
            targetId: v.id,
            summary: `${v.type} ${v.nom}`,
        });

        revalidatePath("/x-rtnc-management-safe/zones-communes");
        return { success: true };
    } catch (e) {
        console.error("updateGeographyAction", e);
        return { success: false, error: "Mise à jour impossible" };
    }
}

export async function deleteGeographyAction(
    id: string
): Promise<{ success: true } | { success: false; error: string }> {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: "Non autorisé" };

    const pid = z.string().uuid().safeParse(id);
    if (!pid.success) return { success: false, error: "Identifiant invalide" };

    try {
        const [child] = await db
            .select({ n: count() })
            .from(geographies)
            .where(eq(geographies.parentId, pid.data));

        if (Number(child?.n ?? 0) > 0) {
            return { success: false, error: "Impossible : des subdivisions dépendent de ce lieu." };
        }

        const [missions] = await db
            .select({ n: count() })
            .from(missionsTerrain)
            .where(eq(missionsTerrain.communeId, pid.data));

        if (Number(missions?.n ?? 0) > 0) {
            return { success: false, error: "Impossible : des missions terrain utilisent ce lieu." };
        }

        const [linked] = await db
            .select({ n: count() })
            .from(assujettis)
            .where(eq(assujettis.communeId, pid.data));

        if (Number(linked?.n ?? 0) > 0) {
            return { success: false, error: "Impossible : des assujettis sont rattachés à ce lieu." };
        }

        await db.delete(geographies).where(eq(geographies.id, pid.data));

        await logAdminAction({
            userId: admin.userId,
            action: "geography.delete",
            targetType: "geography",
            targetId: pid.data,
        });

        revalidatePath("/x-rtnc-management-safe/zones-communes");
        return { success: true };
    } catch (e) {
        console.error("deleteGeographyAction", e);
        return { success: false, error: "Suppression impossible" };
    }
}

