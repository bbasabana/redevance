"use server";

import { db } from "@/db";
import { adminAuditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export type AuditLogRow = {
    id: string;
    createdAt: Date;
    userId: string | null;
    action: string;
    targetType: string | null;
    targetId: string | null;
    summary: string | null;
    ipAddress: string | null;
};

export async function listAdminAuditLogsAction(): Promise<
    | { success: true; data: AuditLogRow[]; tableMissing?: false }
    | { success: false; error: string; tableMissing?: boolean }
> {
    const s = await getSession();
    if (!s || s.user.role !== "admin") {
        return { success: false, error: "Non autorisé" };
    }

    try {
        const rows = await db
            .select({
                id: adminAuditLogs.id,
                createdAt: adminAuditLogs.createdAt,
                userId: adminAuditLogs.userId,
                action: adminAuditLogs.action,
                targetType: adminAuditLogs.targetType,
                targetId: adminAuditLogs.targetId,
                summary: adminAuditLogs.summary,
                ipAddress: adminAuditLogs.ipAddress,
            })
            .from(adminAuditLogs)
            .orderBy(desc(adminAuditLogs.createdAt))
            .limit(200);

        return {
            success: true,
            data: rows.map((r) => ({
                id: r.id,
                createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt as unknown as string),
                userId: r.userId,
                action: r.action,
                targetType: r.targetType,
                targetId: r.targetId,
                summary: r.summary,
                ipAddress: r.ipAddress,
            })),
        };
    } catch (e) {
        console.error("listAdminAuditLogsAction", e);
        const msg = String(e);
        if (msg.includes("admin_audit_logs") || msg.includes("does not exist")) {
            return {
                success: false,
                error:
                    "Table `admin_audit_logs` absente : exécutez le script SQL `drizzle/add-admin-audit-logs.sql` sur la base.",
                tableMissing: true,
            };
        }
        return { success: false, error: "Impossible de charger le journal." };
    }
}

function csvEscape(val: string | null | undefined): string {
    const s = val ?? "";
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

const CSV_EXPORT_LIMIT = 10_000;

export async function exportAdminAuditLogsCsvAction(): Promise<
    { success: true; csv: string; filename: string } | { success: false; error: string; tableMissing?: boolean }
> {
    const s = await getSession();
    if (!s || s.user.role !== "admin") {
        return { success: false, error: "Non autorisé" };
    }

    try {
        const rows = await db
            .select({
                id: adminAuditLogs.id,
                createdAt: adminAuditLogs.createdAt,
                userId: adminAuditLogs.userId,
                action: adminAuditLogs.action,
                targetType: adminAuditLogs.targetType,
                targetId: adminAuditLogs.targetId,
                summary: adminAuditLogs.summary,
                ipAddress: adminAuditLogs.ipAddress,
            })
            .from(adminAuditLogs)
            .orderBy(desc(adminAuditLogs.createdAt))
            .limit(CSV_EXPORT_LIMIT);

        const header = [
            "id",
            "created_at_iso",
            "user_id",
            "action",
            "target_type",
            "target_id",
            "summary",
            "ip_address",
        ].join(",");

        const lines = rows.map((r) => {
            const created =
                r.createdAt instanceof Date
                    ? r.createdAt.toISOString()
                    : new Date(r.createdAt as unknown as string).toISOString();
            return [
                csvEscape(r.id),
                csvEscape(created),
                csvEscape(r.userId),
                csvEscape(r.action),
                csvEscape(r.targetType),
                csvEscape(r.targetId),
                csvEscape(r.summary),
                csvEscape(r.ipAddress),
            ].join(",");
        });

        const csv = [header, ...lines].join("\n");
        const filename = `audit-rtnc-${new Date().toISOString().slice(0, 10)}.csv`;

        return { success: true, csv, filename };
    } catch (e) {
        console.error("exportAdminAuditLogsCsvAction", e);
        const msg = String(e);
        if (msg.includes("admin_audit_logs") || msg.includes("does not exist")) {
            return {
                success: false,
                error:
                    "Table `admin_audit_logs` absente : exécutez `drizzle/add-admin-audit-logs.sql` sur la base.",
                tableMissing: true,
            };
        }
        return { success: false, error: "Export impossible." };
    }
}
