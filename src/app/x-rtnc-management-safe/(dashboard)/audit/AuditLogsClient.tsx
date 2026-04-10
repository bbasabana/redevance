"use client";

import React, { useState, useTransition } from "react";
import { Download, RefreshCw, ScrollText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportAdminAuditLogsCsvAction, listAdminAuditLogsAction, type AuditLogRow } from "./actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AuditLogsClient({
    initialRows,
    initialError,
    tableMissing,
}: {
    initialRows: AuditLogRow[];
    initialError?: string;
    tableMissing?: boolean;
}) {
    const [rows, setRows] = useState(initialRows);
    const [err, setErr] = useState(initialError);
    const [missing, setMissing] = useState(tableMissing);
    const [pending, startTransition] = useTransition();

    const refresh = () => {
        startTransition(async () => {
            const res = await listAdminAuditLogsAction();
            if (res.success) {
                setRows(res.data);
                setErr(undefined);
                setMissing(false);
            } else {
                setErr(res.error);
                setMissing(!!res.tableMissing);
                setRows([]);
            }
        });
    };

    const downloadCsv = () => {
        startTransition(async () => {
            const res = await exportAdminAuditLogsCsvAction();
            if (!res.success) {
                setErr(res.error);
                setMissing(!!res.tableMissing);
                return;
            }
            const blob = new Blob(["\ufeff", res.csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = res.filename;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Export enregistré : ${res.filename}`);
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Journal d&apos;audit</h1>
                    <p className="text-slate-500 mt-1 max-w-2xl">
                        Historique des actions sensibles effectuées depuis la console admin (tarifs, géographies,
                        périodes, etc.).
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        className="rounded-xl font-bold gap-2"
                        onClick={downloadCsv}
                        disabled={pending}
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-xl font-bold gap-2"
                        onClick={refresh}
                        disabled={pending}
                    >
                        <RefreshCw className={cn("w-4 h-4", pending && "animate-spin")} />
                        Actualiser
                    </Button>
                </div>
            </div>

            {err && (
                <div
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3 text-amber-900"
                    role="alert"
                >
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                        <p className="font-bold text-sm">{missing ? "Configuration base de données" : "Erreur"}</p>
                        <p className="text-sm mt-1 opacity-90">{err}</p>
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80">
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Date
                                </th>
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Action
                                </th>
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Cible
                                </th>
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Détail
                                </th>
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    IP
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                        {err ? (
                                            "Aucune donnée affichée."
                                        ) : (
                                            <span className="inline-flex items-center gap-2 justify-center">
                                                <ScrollText className="w-5 h-5 opacity-40" />
                                                Aucun événement enregistré pour le moment.
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => (
                                    <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                            {row.createdAt.toLocaleString("fr-FR", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-900">{row.action}</td>
                                        <td className="px-4 py-3 text-slate-600 text-xs">
                                            {row.targetType ? (
                                                <>
                                                    <span className="font-semibold">{row.targetType}</span>
                                                    {row.targetId ? (
                                                        <span className="text-slate-400 ml-1 truncate max-w-[120px] inline-block align-bottom">
                                                            {row.targetId.slice(0, 8)}…
                                                        </span>
                                                    ) : null}
                                                </>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-slate-700 max-w-md truncate"
                                            title={row.summary ?? ""}
                                        >
                                            {row.summary ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                            {row.ipAddress ?? "—"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
