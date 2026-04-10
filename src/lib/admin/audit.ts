import { db } from "@/db";
import { adminAuditLogs } from "@/db/schema";
import { headers } from "next/headers";

export async function logAdminAction(params: {
    userId: string | null | undefined;
    action: string;
    targetType?: string;
    targetId?: string;
    summary?: string;
    metadata?: Record<string, unknown>;
}): Promise<void> {
    try {
        const h = headers();
        const fwd = h.get("x-forwarded-for");
        const ip = fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || null;

        await db.insert(adminAuditLogs).values({
            userId: params.userId || null,
            action: params.action,
            targetType: params.targetType ?? null,
            targetId: params.targetId ?? null,
            summary: params.summary ?? null,
            metadata: params.metadata ?? null,
            ipAddress: ip,
        });
    } catch (e) {
        console.error("[admin-audit] insert failed (table missing? run drizzle/add-admin-audit-logs.sql):", e);
    }
}
