import { Suspense } from "react";
import { auth } from "@/auth";
import { db } from "@/db";
import { assujettis } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getDashboardRouting } from "@/app/actions/dashboard";
import { DashboardStatusView } from "@/components/assujetti/DashboardStatusView";
import { ShieldCheck } from "lucide-react";

export default async function AssujettiDashboard() {
    const session = await auth();

    let displayName = "Assujetti";
    let nif: string | null = null;

    if (session?.user?.id) {
        const [profile] = await db
            .select({ nomRaisonSociale: assujettis.nomRaisonSociale, nif: assujettis.nif })
            .from(assujettis)
            .where(eq(assujettis.userId, session.user.id))
            .limit(1);

        displayName = profile?.nomRaisonSociale || session.user.name || "Assujetti";
        nif = profile?.nif || null;
    }

    const dashboardData = await getDashboardRouting();
    const currentYear = new Date().getFullYear();

    return (
        <div className="space-y-6">

            {/* ― Greeting Header ― compact, like identification page */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Exercice {currentYear} — Espace Assujetti
                        </p>
                        {dashboardData.classification && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-400 rounded border-b border-yellow-600 shadow-sm">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#0d2870]">
                                    CLASSIFICATION {dashboardData.classification}
                                </span>
                            </div>
                        )}
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                        {displayName}
                    </h1>
                    {nif && (
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">NIF</span>
                            <span className="text-xs font-mono font-semibold text-slate-500">{nif}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end justify-center">
                    {dashboardData.status === "COMPLIANT" && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-600">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">En Règle</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ― Main Status Cards ― */}
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardStatusView data={dashboardData} />
            </Suspense>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Main Status Hero Skeleton */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-100 rounded-full w-1/4" />
                        <div className="h-6 bg-slate-100 rounded-full w-1/2" />
                    </div>
                </div>
                <div className="h-4 bg-slate-50 rounded-full w-full" />
                <div className="h-4 bg-slate-50 rounded-full w-5/6" />
                <div className="pt-2">
                    <div className="h-10 bg-slate-100 rounded-xl w-32" />
                </div>
            </div>

            {/* KPI Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                            <div className="w-12 h-4 bg-slate-50 rounded-full" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                            <div className="h-5 bg-slate-100 rounded-full w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
