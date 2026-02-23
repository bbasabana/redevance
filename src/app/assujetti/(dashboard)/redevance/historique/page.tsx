import { auth } from "@/auth";
import { db } from "@/db";
import { notesTaxation, paiements, assujettis } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { History, ArrowLeft, DownloadCloud, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function HistoriquePage() {
    const session = await auth();

    if (!session?.user?.id) return null;

    const [assujetti] = await db
        .select()
        .from(assujettis)
        .where(eq(assujettis.userId, session.user.id))
        .limit(1);

    if (!assujetti) return null;

    const notes = await db
        .select()
        .from(notesTaxation)
        .where(eq(notesTaxation.assujettiId, assujetti.id))
        .orderBy(desc(notesTaxation.exercice), desc(notesTaxation.createdAt));

    const allPaiements = await db
        .select()
        .from(paiements)
        .where(eq(paiements.assujettiId, assujetti.id))
        .orderBy(desc(paiements.createdAt));

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'USD' }).format(Number(amount));
    };

    const getStatusConfig = (statut: string) => {
        switch (statut) {
            case "payee":
                return { bg: "bg-emerald-50", color: "text-emerald-600", border: "border-emerald-200", icon: CheckCircle2, label: "Payée" };
            case "partiellement_payee":
                return { bg: "bg-blue-50", color: "text-blue-600", border: "border-blue-200", icon: Clock, label: "Paiement Partiel" };
            case "en_attente_signature1":
            case "en_attente_signature2":
                return { bg: "bg-slate-50", color: "text-slate-600", border: "border-slate-200", icon: Clock, label: "En traitement interne" };
            case "brouillon":
                return { bg: "bg-amber-50", color: "text-amber-600", border: "border-amber-200", icon: Clock, label: "Brouillon" };
            case "en_retard":
                return { bg: "bg-red-50", color: "text-red-600", border: "border-red-200", icon: AlertCircle, label: "En retard" };
            default:
                return { bg: "bg-slate-50", color: "text-slate-600", border: "border-slate-200", icon: FileText, label: "Émise" };
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Section - High-Level Technical Look */}
            <div className="bg-[#0d2870] p-8 md:p-10 rounded-lg border-t-8 border-yellow-400 relative overflow-hidden shadow-none">
                {/* Technical Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />

                <div className="relative z-10">
                    <Link
                        href="/assujetti/dashboard"
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-yellow-400 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Tableau de Bord
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                                Historique Fiscal
                            </h1>
                            <p className="text-white/60 text-sm font-medium tracking-tight max-w-md">
                                Archive technique de vos certifications, notes de taxation et flux de paiements enregistrés.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white/10 rounded-lg border border-white/10">
                                <History className="w-8 h-8 text-yellow-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-6">
                {notes.length === 0 ? (
                    <div className="p-20 text-center bg-white rounded-lg border-2 border-slate-100 border-dashed">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Aucune donnée trouvée</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-1">Le registre est actuellement vide.</p>
                    </div>
                ) : (
                    notes.map((note) => {
                        const status = getStatusConfig(note.statut || "emise");
                        const StatusIcon = status.icon;
                        const notePayments = allPaiements.filter(p => p.noteTaxationId === note.id);

                        return (
                            <div key={note.id} className="group/item bg-white rounded-lg border border-slate-200 shadow-none overflow-hidden transition-all hover:border-[#0d2870]">
                                <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    {/* Grid Overlay on Hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover/item:opacity-[0.02] pointer-events-none transition-opacity"
                                        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '12px 12px' }}
                                    />

                                    <div className="relative z-10 flex items-start gap-6">
                                        <div className={cn(
                                            "w-14 h-14 rounded-lg flex items-center justify-center shrink-0 border-b-4 transition-transform group-hover/item:scale-105",
                                            status.bg, status.color, "border- текущий_border_color" // Placeholder to replace below
                                        ).replace('border- текущий_border_color', status.border)}>
                                            <StatusIcon className="w-7 h-7" />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded">
                                                    EXERCICE {note.exercice}
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest border px-2.5 py-1 rounded",
                                                    status.bg, status.color, status.border
                                                )}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                                                    NOTE N° {note.numeroNote || "BROUILLON"}
                                                </h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">
                                                    ID: {note.id.substring(0, 12).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10 flex flex-col md:items-end gap-4">
                                        <div className="text-left md:text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Certifié</p>
                                            <p className="text-3xl font-black text-[#0d2870] tabular-nums tracking-tighter leading-none">
                                                {formatCurrency(note.montantTotalDu)}
                                            </p>
                                        </div>

                                        {note.pdfUrl && (
                                            <a
                                                href={note.pdfUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 h-10 px-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#0d2870] transition-all"
                                            >
                                                <DownloadCloud className="w-4 h-4" />
                                                Archive PDF
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Payments - Technical Table Look */}
                                {notePayments.length > 0 && (
                                    <div className="bg-slate-50 border-t border-slate-100 p-6 md:px-8">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-px flex-1 bg-slate-200" />
                                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] shrink-0">JOURNAL DES FLUX</h4>
                                            <div className="h-px flex-1 bg-slate-200" />
                                        </div>

                                        <div className="space-y-2">
                                            {notePayments.map(payment => (
                                                <div key={payment.id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded border border-slate-200 group/payment hover:border-[#0d2870] transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                                                            payment.statut === "confirme" ? "bg-emerald-500" : payment.statut === "rejete" ? "bg-red-500" : "bg-amber-500 animate-pulse"
                                                        )} />
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{payment.canal?.replace('_', ' ')}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Canal de Règlement</p>
                                                        </div>
                                                    </div>

                                                    <div className="hidden md:block">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence</p>
                                                        <p className="text-[11px] font-bold text-slate-800 font-mono tracking-tighter">{payment.referenceTransaction}</p>
                                                    </div>

                                                    <div className="hidden lg:block">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                                        <p className="text-[11px] font-bold text-slate-800 tracking-tighter">
                                                            {new Date(payment.datePaiement).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                        </p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Montant</p>
                                                        <p className="text-base font-black text-[#0d2870] tabular-nums tracking-tighter">
                                                            {formatCurrency(payment.montant)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
