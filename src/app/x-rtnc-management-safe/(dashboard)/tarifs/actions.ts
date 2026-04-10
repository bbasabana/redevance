"use server";

import { db } from "@/db";
import { taxationRules } from "@/db/schema";
import { and, asc, eq, ne } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin/audit";

const locationCategories = ["URBAINE", "URBANO_RURALE", "RURALE"] as const;
const entityTypes = ["pm", "pmta", "ppta"] as const;
const deviceCategories = ["Téléviseurs", "Radios"] as const;

const RuleBodySchema = z.object({
    category: z.enum(locationCategories),
    entityType: z.enum(entityTypes),
    categorieAppareil: z.enum(deviceCategories),
    price: z.coerce.number().positive().max(99999999),
    currency: z.string().length(3).default("USD"),
});

export type TarifRuleRow = {
    id: string;
    category: (typeof locationCategories)[number];
    entityType: (typeof entityTypes)[number];
    categorieAppareil: string | null;
    price: string;
    currency: string | null;
};

function assertAdmin() {
    return getSession().then((s) => {
        if (!s || s.user.role !== "admin") return null;
        return s;
    });
}

export async function listTarifRulesAction(): Promise<
    | { success: true; data: TarifRuleRow[] }
    | { success: false; error: string }
> {
    const session = await assertAdmin();
    if (!session) {
        return { success: false, error: "Non autorisé" };
    }

    try {
        const rows = await db
            .select({
                id: taxationRules.id,
                category: taxationRules.category,
                entityType: taxationRules.entityType,
                categorieAppareil: taxationRules.categorieAppareil,
                price: taxationRules.price,
                currency: taxationRules.currency,
            })
            .from(taxationRules)
            .orderBy(asc(taxationRules.category), asc(taxationRules.entityType), asc(taxationRules.categorieAppareil));

        return {
            success: true,
            data: rows.map((r) => ({
                id: r.id,
                category: r.category as TarifRuleRow["category"],
                entityType: r.entityType as TarifRuleRow["entityType"],
                categorieAppareil: r.categorieAppareil,
                price: String(r.price),
                currency: r.currency,
            })),
        };
    } catch (e) {
        console.error("listTarifRulesAction", e);
        return { success: false, error: "Erreur lors du chargement des tarifs" };
    }
}

export async function createTarifRuleAction(
    raw: z.infer<typeof RuleBodySchema>
): Promise<{ success: true; id: string } | { success: false; error: string }> {
    const session = await assertAdmin();
    if (!session) {
        return { success: false, error: "Non autorisé" };
    }

    const parsed = RuleBodySchema.safeParse(raw);
    if (!parsed.success) {
        return { success: false, error: "Données invalides" };
    }
    const v = parsed.data;

    try {
        const [dup] = await db
            .select({ id: taxationRules.id })
            .from(taxationRules)
            .where(
                and(
                    eq(taxationRules.category, v.category),
                    eq(taxationRules.entityType, v.entityType),
                    eq(taxationRules.categorieAppareil, v.categorieAppareil)
                )
            )
            .limit(1);

        if (dup) {
            return {
                success: false,
                error: "Une règle existe déjà pour cette combinaison zone × type d’entité × appareil.",
            };
        }

        const [inserted] = await db
            .insert(taxationRules)
            .values({
                category: v.category,
                entityType: v.entityType,
                categorieAppareil: v.categorieAppareil,
                price: String(v.price),
                currency: v.currency,
            })
            .returning({ id: taxationRules.id });

        await logAdminAction({
            userId: session.user.userId,
            action: "tarif.create",
            targetType: "taxation_rule",
            targetId: inserted!.id,
            summary: `${v.category} / ${v.entityType} / ${v.categorieAppareil} → ${v.price} ${v.currency}`,
        });

        revalidatePath("/x-rtnc-management-safe/tarifs");
        return { success: true, id: inserted!.id };
    } catch (e) {
        console.error("createTarifRuleAction", e);
        return { success: false, error: "Impossible de créer la règle" };
    }
}

const UpdateRuleSchema = RuleBodySchema.extend({
    id: z.string().uuid(),
});

export async function updateTarifRuleAction(
    raw: z.infer<typeof UpdateRuleSchema>
): Promise<{ success: true } | { success: false; error: string }> {
    const session = await assertAdmin();
    if (!session) {
        return { success: false, error: "Non autorisé" };
    }

    const parsed = UpdateRuleSchema.safeParse(raw);
    if (!parsed.success) {
        return { success: false, error: "Données invalides" };
    }
    const v = parsed.data;

    try {
        const [conflict] = await db
            .select({ id: taxationRules.id })
            .from(taxationRules)
            .where(
                and(
                    eq(taxationRules.category, v.category),
                    eq(taxationRules.entityType, v.entityType),
                    eq(taxationRules.categorieAppareil, v.categorieAppareil),
                    ne(taxationRules.id, v.id)
                )
            )
            .limit(1);

        if (conflict) {
            return {
                success: false,
                error: "Une autre règle utilise déjà cette combinaison.",
            };
        }

        await db
            .update(taxationRules)
            .set({
                category: v.category,
                entityType: v.entityType,
                categorieAppareil: v.categorieAppareil,
                price: String(v.price),
                currency: v.currency,
            })
            .where(eq(taxationRules.id, v.id));

        await logAdminAction({
            userId: session.user.userId,
            action: "tarif.update",
            targetType: "taxation_rule",
            targetId: v.id,
            summary: `${v.category} / ${v.entityType} / ${v.categorieAppareil} → ${v.price} ${v.currency}`,
        });

        revalidatePath("/x-rtnc-management-safe/tarifs");
        return { success: true };
    } catch (e) {
        console.error("updateTarifRuleAction", e);
        return { success: false, error: "Impossible de mettre à jour la règle" };
    }
}

export async function deleteTarifRuleAction(
    id: string
): Promise<{ success: true } | { success: false; error: string }> {
    const session = await assertAdmin();
    if (!session) {
        return { success: false, error: "Non autorisé" };
    }

    const parsed = z.string().uuid().safeParse(id);
    if (!parsed.success) {
        return { success: false, error: "Identifiant invalide" };
    }

    try {
        await db.delete(taxationRules).where(eq(taxationRules.id, parsed.data));

        await logAdminAction({
            userId: session.user.userId,
            action: "tarif.delete",
            targetType: "taxation_rule",
            targetId: parsed.data,
        });

        revalidatePath("/x-rtnc-management-safe/tarifs");
        return { success: true };
    } catch (e) {
        console.error("deleteTarifRuleAction", e);
        return { success: false, error: "Impossible de supprimer la règle" };
    }
}
