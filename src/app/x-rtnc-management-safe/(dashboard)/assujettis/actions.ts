"use server";

import { db } from "@/db";
import { assujettis, paiements, notesTaxation, appUsers, geographies, declarations, lignesDeclaration } from "@/db/schema";
import { eq, sql, desc, and, ne } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { checkUniqueness } from "@/app/actions/taxation";
import { logAdminAction } from "@/lib/admin/audit";

export type AssujettiFinancialRow = {
    id: string;
    identifiantFiscal: string | null;
    nomRaisonSociale: string;
    typePersonne: string;
    commune: string | null;
    totalDu: number;
    totalPaye: number;
    statut: string | null;
    dernierPaiement: Date | null;
};

export async function getAssujettisFinancialListAction(): Promise<{ success: true; data: AssujettiFinancialRow[] } | { success: false; error: string }> {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
        return { success: false, error: "Non autorisé" };
    }

    try {
        // Query to get all assujettis with their summed financial data
        // We use a subquery or custom SQL to sum payments and notes
        const rows = await db.select({
            id: assujettis.id,
            identifiantFiscal: assujettis.identifiantFiscal,
            nomRaisonSociale: assujettis.nomRaisonSociale,
            typePersonne: assujettis.typePersonne,
            commune: geographies.nom,
            statut: assujettis.statut,
            totalDu: sql<string>`COALESCE((SELECT SUM(montant_total_du) FROM ${notesTaxation} WHERE assujetti_id = ${assujettis.id}), 0)`,
            totalPaye: sql<string>`COALESCE((SELECT SUM(montant) FROM ${paiements} WHERE assujetti_id = ${assujettis.id} AND statut = 'confirme'), 0)`,
            dernierPaiement: sql<Date>`(SELECT MAX(date_paiement) FROM ${paiements} WHERE assujetti_id = ${assujettis.id} AND statut = 'confirme')`,
        })
        .from(assujettis)
        .leftJoin(geographies, eq(assujettis.communeId, geographies.id))
        .orderBy(desc(assujettis.createdAt));

        return {
            success: true,
            data: rows.map(r => ({
                ...r,
                totalDu: Number(r.totalDu),
                totalPaye: Number(r.totalPaye),
            }))
        };
    } catch (error: any) {
        console.error("Error fetching assujettis financial list:", error);
        return { success: false, error: error.message || "Erreur serveur" };
    }
}

export async function getAssujettiDetailsAction(id: string) {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
        return { success: false, error: "Non autorisé" };
    }

    try {
        const [assujetti] = await db.select()
            .from(assujettis)
            .where(eq(assujettis.id, id))
            .limit(1);

        if (!assujetti) return { success: false, error: "Assujetti non trouvé" };

        const history = await db.select()
            .from(paiements)
            .where(eq(paiements.assujettiId, id))
            .orderBy(desc(paiements.datePaiement));

        const notes = await db.select()
            .from(notesTaxation)
            .where(eq(notesTaxation.assujettiId, id))
            .orderBy(desc(notesTaxation.exercice));

        const decls = await db.select()
            .from(declarations)
            .where(eq(declarations.assujettiId, id))
            .orderBy(desc(declarations.exercice));
        
        // Fetch detailed lines for all declarations of this assujetti
        const declarationIds = decls.map(d => d.id);
        let lines: any[] = [];
        if (declarationIds.length > 0) {
            lines = await db.select()
                .from(lignesDeclaration)
                .where(sql`${lignesDeclaration.declarationId} IN ${declarationIds}`);
        }

        return {
            success: true,
            data: {
                assujetti,
                paiements: history,
                notes,
                declarations: decls.map(d => ({
                    ...d,
                    lignes: lines.filter(l => l.declarationId === d.id)
                }))
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

const AdminAssujettiPatchSchema = z.object({
    assujettiId: z.string().uuid(),
    nomRaisonSociale: z.string().min(2).max(255),
    nif: z.string().max(50).optional().nullable(),
    rccm: z.string().max(100).optional().nullable(),
    idNat: z.string().max(50).optional().nullable(),
    representantLegal: z.string().max(255).optional().nullable(),
    adresseSiege: z.string().min(3).max(2000),
    telephonePrincipal: z.string().max(30).optional().nullable(),
    email: z.union([z.string().email(), z.literal("")]).optional().nullable(),
    identifiantFiscal: z.string().max(30).optional().nullable(),
});

export type AdminAssujettiPatchInput = z.infer<typeof AdminAssujettiPatchSchema>;

export async function updateAssujettiByAdminAction(
    raw: AdminAssujettiPatchInput
): Promise<{ success: true } | { success: false; error: string }> {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
        return { success: false, error: "Non autorisé" };
    }

    const parsed = AdminAssujettiPatchSchema.safeParse(raw);
    if (!parsed.success) {
        return { success: false, error: "Données invalides" };
    }
    const v = parsed.data;

    try {
        const [current] = await db.select().from(assujettis).where(eq(assujettis.id, v.assujettiId)).limit(1);
        if (!current) {
            return { success: false, error: "Assujetti introuvable" };
        }

        const nif = (v.nif ?? "").trim() || null;
        const rccm = (v.rccm ?? "").trim() || null;
        const idNat = (v.idNat ?? "").trim() || null;
        const identifiantFiscal = (v.identifiantFiscal ?? "").trim() || null;

        if (nif && nif !== current.nif) {
            const u = await checkUniqueness("nif", nif, v.assujettiId);
            if (!u.isUnique) return { success: false, error: "Ce NIF est déjà utilisé." };
        }
        if (rccm && rccm !== current.rccm) {
            const u = await checkUniqueness("rccm", rccm, v.assujettiId);
            if (!u.isUnique) return { success: false, error: "Ce RCCM est déjà utilisé." };
        }
        if (idNat && idNat !== current.idNat) {
            const u = await checkUniqueness("idNat", idNat, v.assujettiId);
            if (!u.isUnique) return { success: false, error: "Cet ID national est déjà utilisé." };
        }

        if (identifiantFiscal && identifiantFiscal !== current.identifiantFiscal) {
            const [dup] = await db
                .select({ id: assujettis.id })
                .from(assujettis)
                .where(and(eq(assujettis.identifiantFiscal, identifiantFiscal), ne(assujettis.id, v.assujettiId)))
                .limit(1);
            if (dup) {
                return { success: false, error: "Cet identifiant fiscal est déjà attribué." };
            }
        }

        await db
            .update(assujettis)
            .set({
                nomRaisonSociale: v.nomRaisonSociale.trim(),
                nif,
                rccm,
                idNat,
                representantLegal: (v.representantLegal ?? "").trim() || null,
                adresseSiege: v.adresseSiege.trim(),
                telephonePrincipal: (v.telephonePrincipal ?? "").trim() || null,
                email: (v.email ?? "").trim() || null,
                identifiantFiscal,
                updatedAt: new Date(),
            })
            .where(eq(assujettis.id, v.assujettiId));

        await logAdminAction({
            userId: session.user.userId,
            action: "assujetti.admin_update",
            targetType: "assujetti",
            targetId: v.assujettiId,
            summary: `Mise à jour identité : ${v.nomRaisonSociale.trim().slice(0, 80)}`,
            metadata: {
                assujettiId: v.assujettiId,
                champs: ["nomRaisonSociale", "nif", "rccm", "idNat", "representantLegal", "adresseSiege", "telephonePrincipal", "email", "identifiantFiscal"],
            },
        });

        revalidatePath("/x-rtnc-management-safe/assujettis");
        revalidatePath("/x-rtnc-management-safe/audit");
        return { success: true };
    } catch (e: unknown) {
        console.error("updateAssujettiByAdminAction", e);
        return { success: false, error: e instanceof Error ? e.message : "Erreur serveur" };
    }
}
