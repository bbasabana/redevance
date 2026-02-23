import { auth } from "@/auth";
import { db } from "@/db";
import { declarations, notesTaxation, assujettis, paiements, rappels as rappelsTable } from "@/db/schema";
import { eq, sql, count, desc, and, ne, gte } from "drizzle-orm";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    CreditCard, FileText, BellRing, CheckCircle,
    ArrowRight, CalendarCheck, ClipboardList
} from "lucide-react";

export async function DashboardKpis() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const [profile] = await db
        .select({ id: assujettis.id })
        .from(assujettis)
        .where(eq(assujettis.userId, session.user.id))
        .limit(1);

    if (!profile) return null;
    const assujettiId = profile.id;
    const currentYear = new Date().getFullYear();

    const [
        totalDemandesResult,
        demandesEnAttenteResult,
        notesActivesResult,
        montantDuResult,
        montantPayeResult,
        rappelsResult,
        echeanceResult,
        historiqueResult,
    ] = await Promise.all([
        // 1. Nombre total de demandes
        db.select({ count: count() })
            .from(declarations)
            .where(eq(declarations.assujettiId, assujettiId)),

        // 2. Demandes en attente de validation
        db.select({ count: count() })
            .from(declarations)
            .where(and(
                eq(declarations.assujettiId, assujettiId),
                eq(declarations.statut, "soumise")
            )),

        // 3. Notes de taxation actives (statut != 'payee')
        db.select({ count: count() })
            .from(notesTaxation)
            .where(and(
                eq(notesTaxation.assujettiId, assujettiId),
                ne(notesTaxation.statut, "payee")
            )),

        // 4. Montant total dû (exercice courant)
        db.select({ total: sql<number>`coalesce(sum(${notesTaxation.montantTotalDu}), 0)` })
            .from(notesTaxation)
            .where(and(
                eq(notesTaxation.assujettiId, assujettiId),
                eq(notesTaxation.exercice, currentYear)
            )),

        // 5. Montant total payé (paiements confirmés)
        db.select({ total: sql<number>`coalesce(sum(${paiements.montant}), 0)` })
            .from(paiements)
            .where(and(
                eq(paiements.assujettiId, assujettiId),
                eq(paiements.statut, "confirme")
            )),

        // 6. Nombre de rappels reçus
        db.select({ count: count() })
            .from(rappelsTable)
            .where(eq(rappelsTable.assujettiId, assujettiId)),

        // 7. Prochaine échéance (jours restants)
        db.select({
            dateEcheance: notesTaxation.dateEcheance,
            numeroNote: notesTaxation.numeroNote,
            montant: notesTaxation.montantTotalDu,
        })
            .from(notesTaxation)
            .where(and(
                eq(notesTaxation.assujettiId, assujettiId),
                ne(notesTaxation.statut, "payee"),
                gte(notesTaxation.dateEcheance, sql`CURRENT_DATE`)
            ))
            .orderBy(notesTaxation.dateEcheance)
            .limit(1),

        // 8. Historique récent des paiements
        db.select({
            id: paiements.id,
            date: paiements.datePaiement,
            amount: paiements.montant,
            status: paiements.statut,
            ref: paiements.referenceTransaction,
            canal: paiements.canal,
        })
            .from(paiements)
            .where(eq(paiements.assujettiId, assujettiId))
            .orderBy(desc(paiements.datePaiement))
            .limit(5),
    ]);

    const totalDemandes = totalDemandesResult[0]?.count ?? 0;
    const demandesEnAttente = demandesEnAttenteResult[0]?.count ?? 0;
    const notesActives = notesActivesResult[0]?.count ?? 0;
    const montantDu = Number(montantDuResult[0]?.total) || 0;
    const montantPaye = Number(montantPayeResult[0]?.total) || 0;
    const solde = montantDu - montantPaye;
    const nombreRappels = rappelsResult[0]?.count ?? 0;
    const prochaineEcheance = echeanceResult[0] ?? null;

    // Calcul des jours avant échéance
    let joursAvantEcheance: number | null = null;
    if (prochaineEcheance?.dateEcheance) {
        const echeanceDate = new Date(prochaineEcheance.dateEcheance);
        const today = new Date();
        joursAvantEcheance = Math.ceil((echeanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Progression du paiement (%)
    const progressPct = montantDu > 0 ? Math.min(100, Math.round((montantPaye / montantDu) * 100)) : 0;

    // Stats pour les 3 cartes du haut
    const topStats = [
        {
            label: "Solde de compte récent",
            value: `$${solde.toLocaleString("fr-FR")}`,
            icon: CreditCard,
            check: solde <= 0,
            bg: "bg-blue-50",
            iconBg: "bg-blue-100 text-blue-500",
        },
        {
            label: "Nombre de vos dossiers",
            value: totalDemandes.toString(),
            icon: FileText,
            check: totalDemandes > 0,
            bg: "bg-white",
            iconBg: "bg-slate-100 text-slate-400",
        },
        {
            label: "Vos dépenses totales",
            value: `$${montantPaye.toLocaleString("fr-FR")}`,
            icon: CheckCircle,
            check: montantPaye > 0,
            bg: "bg-emerald-50",
            iconBg: "bg-emerald-100 text-emerald-500",
        },
    ];

    return (
        <div className="flex gap-6 h-full">
            {/* Main area */}
            <div className="flex-1 min-w-0 space-y-6">
                {/* Top 3 stat cards */}
                <div className="grid grid-cols-3 gap-4">
                    {topStats.map((stat, i) => (
                        <div
                            key={i}
                            className={cn("rounded-2xl p-6 border border-slate-200 flex flex-col gap-4", stat.bg)}
                        >
                            <div className="flex items-start justify-between">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.iconBg)}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center",
                                    stat.check ? "text-emerald-500" : "text-slate-200"
                                )}>
                                    <CheckCircle className="w-4 h-4" />
                                </span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Secondary stat row */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-amber-50 rounded-2xl p-5 border border-slate-200 col-span-1">
                        <p className="text-xs text-slate-500 mb-2">Demandes en attente</p>
                        <p className="text-xl font-bold text-slate-900">{demandesEnAttente}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 col-span-1">
                        <p className="text-xs text-slate-500 mb-2">Notes de taxation actives</p>
                        <p className="text-xl font-bold text-slate-900">{notesActives}</p>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-5 border border-slate-200 col-span-1">
                        <p className="text-xs text-slate-500 mb-2">Rappels reçus</p>
                        <p className="text-xl font-bold text-slate-900">{nombreRappels}</p>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-50">
                        <h3 className="font-bold text-slate-900 text-sm">Historique des transactions</h3>
                        <Link
                            href="/assujetti/paiements"
                            className="text-xs text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1"
                        >
                            Voir tout <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    {["TrxID", "Date", "Canal", "Statut", "Montant"].map((h) => (
                                        <th key={h} className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {historiqueResult.length > 0 ? historiqueResult.map((trx) => (
                                    <tr key={trx.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500 uppercase">{trx.id.substring(0, 8)}</td>
                                        <td className="px-6 py-4 text-xs text-slate-700">
                                            {new Date(trx.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-600 capitalize">{trx.canal}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-semibold",
                                                trx.status === "confirme"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : trx.status === "rejete"
                                                        ? "bg-red-50 text-red-500"
                                                        : "bg-amber-50 text-amber-600"
                                            )}>
                                                {trx.status === "confirme" ? "Succès" : trx.status === "rejete" ? "Rejeté" : "En attente"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-slate-900">
                                            ${Number(trx.amount).toLocaleString("fr-FR")}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-xs text-slate-400 italic">
                                            Aucune transaction enregistrée pour le moment.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right sidebar */}
            <div className="w-64 shrink-0 space-y-4">
                {/* Fiscal Status — dark card */}
                <div className="rounded-2xl p-6 text-white space-y-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0d2870 0%, #081B4B 100%)" }}>
                    <div className="relative z-10">
                        <h4 className="font-bold text-sm text-white">Situation Fiscale</h4>
                        <p className="text-xs text-white/40 mt-0.5">En cours</p>
                    </div>
                    <div className="relative z-10 space-y-2">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-700"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-white/40">
                            <span>Progression</span>
                            <span className="text-white font-semibold">{progressPct}%</span>
                        </div>
                    </div>
                    <div className="relative z-10 pt-4 border-t border-white/10 text-center space-y-1">
                        <p className="text-[10px] text-white/40">Traitement estimé</p>
                        <p className="text-xs font-semibold text-white">4-5 jours ouvrables</p>
                    </div>
                    <Link
                        href="/assujetti/demandes"
                        className="relative z-10 flex items-center justify-center w-full py-3 bg-white rounded-xl text-[11px] font-bold text-slate-950 hover:bg-slate-100 transition-all"
                    >
                        Tout voir
                    </Link>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                </div>

                {/* To Do List */}
                <div className="bg-sky-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h4 className="font-bold text-sm text-slate-900">À faire</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                    <ClipboardList className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 leading-tight">Déclaration {currentYear}</p>
                                    <p className="text-[10px] text-slate-400">
                                        {demandesEnAttente > 0 ? `${demandesEnAttente} en attente` : "Initier une demande"}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 shrink-0">${solde.toLocaleString("fr-FR")}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                    <BellRing className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 leading-tight">Rappels reçus</p>
                                    <p className="text-[10px] text-slate-400">{nombreRappels} notification(s)</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 shrink-0">Info</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 leading-tight">Notes actives</p>
                                    <p className="text-[10px] text-slate-400">{notesActives} note(s) impayée(s)</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 shrink-0">{notesActives}</span>
                        </div>
                    </div>
                </div>

                {/* Upcoming Payment */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                    <div>
                        <h4 className="font-bold text-sm text-slate-900">Prochaine Échéance</h4>
                        {prochaineEcheance?.dateEcheance && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(prochaineEcheance.dateEcheance).toLocaleDateString("fr-FR", {
                                    day: "2-digit", month: "short", year: "numeric"
                                })}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between py-2 border-b border-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                    <CalendarCheck className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-900">
                                        {prochaineEcheance?.numeroNote ?? "Aucune"}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        {joursAvantEcheance !== null ? `Dans ${joursAvantEcheance} jours` : "Non définie"}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-900">
                                {prochaineEcheance?.montant
                                    ? `$${Number(prochaineEcheance.montant).toLocaleString("fr-FR")}`
                                    : "—"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                    <CreditCard className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-900">Montant dû</p>
                                    <p className="text-[10px] text-slate-400">Exercice {currentYear}</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-900">${montantDu.toLocaleString("fr-FR")}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
