"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DashboardStatus, DashboardRoutingResult } from "@/app/actions/dashboard";
import {
    AlertCircle, CheckCircle2, Clock, ArrowRight, DownloadCloud,
    AlertTriangle, FileText, ShieldCheck, ReceiptText, CalendarDays, Banknote, Tv, Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DashboardStatusViewProps {
    data: DashboardRoutingResult;
}

const STATUS_CONFIG: Record<DashboardStatus, {
    color: string;
    bg: string;
    ring: string;
    dotColor: string;
    icon: React.ElementType;
    label: string;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
}> = {
    COMPLIANT: {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        ring: "ring-emerald-200",
        dotColor: "bg-emerald-500",
        icon: CheckCircle2,
        label: "En Règle",
        title: "Vous êtes en règle",
        description: "Votre redevance audiovisuelle pour l'exercice en cours est entièrement réglée. Merci de votre contribution.",
        actionLabel: "Voir ma quittance",
        actionHref: "/assujetti/redevance/historique",
    },
    PAYMENT_PENDING: {
        color: "text-amber-600",
        bg: "bg-amber-50",
        ring: "ring-amber-200",
        dotColor: "bg-amber-500",
        icon: Clock,
        label: "Paiement en attente",
        title: "Paiement requis",
        description: "Votre note de taxation est disponible. Merci de procéder au règlement avant la date d'échéance pour éviter des pénalités.",
        actionLabel: "Payer ma redevance",
        actionHref: "/assujetti/redevance/paiement",
    },
    AWAITING_CONFIRMATION: {
        color: "text-blue-600",
        bg: "bg-blue-50",
        ring: "ring-blue-200",
        dotColor: "bg-blue-500",
        icon: ShieldCheck,
        label: "En cours de vérification",
        title: "Paiement signalé",
        description: "Votre paiement a bien été enregistré et est en cours de vérification par nos services fiscaux. Vous serez notifié dès validation.",
        actionLabel: "Voir le statut",
        actionHref: "/assujetti/redevance/en-cours",
    },
    OVERDUE: {
        color: "text-red-600",
        bg: "bg-red-50",
        ring: "ring-red-200",
        dotColor: "bg-red-500",
        icon: AlertCircle,
        label: "En retard",
        title: "Situation irrégulière",
        description: "La date limite est dépassée. Veuillez régulariser votre situation immédiatement pour éviter des pénalités supplémentaires et des poursuites.",
        actionLabel: "Régulariser maintenant",
        actionHref: "/assujetti/redevance/paiement",
    },
    RENEWAL_REQUIRED: {
        color: "text-orange-600",
        bg: "bg-orange-50",
        ring: "ring-orange-200",
        dotColor: "bg-orange-500",
        icon: AlertTriangle,
        label: "Renouvellement requis",
        title: "Renouvellement annuel",
        description: "L'exercice précédent est clos. Vous devez effectuer votre déclaration annuelle pour obtenir votre note de taxation pour l'exercice en cours.",
        actionLabel: "Renouveler ma déclaration",
        actionHref: "/assujetti/renouvellement",
    },
    INITIAL_DECLARATION_REQUIRED: {
        color: "text-[#0d2870]",
        bg: "bg-blue-50",
        ring: "ring-blue-100",
        dotColor: "bg-[#0d2870]",
        icon: ReceiptText,
        label: "Note manquante",
        title: "Générer votre note",
        description: "Votre profil est complet mais aucune note de taxation n'a été générée. Veuillez déclarer vos appareils pour obtenir votre note officielle.",
        actionLabel: "Déclarer mes appareils",
        actionHref: "/assujetti/profil/appareils", // Redirecting to appareils for now or a fix page
    },
    NEW_ASSUJETTI: {
        color: "text-[#0d2870]",
        bg: "bg-blue-50",
        ring: "ring-blue-100",
        dotColor: "bg-[#0d2870]",
        icon: FileText,
        label: "Nouveau compte",
        title: "Bienvenue dans votre espace",
        description: "Votre identification a été complétée. Notre administration génèrera votre première Note de Taxation sur la base de vos déclarations d'appareils.",
        actionLabel: "Compléter mon dossier",
        actionHref: "/assujetti/profil/infos",
    },
};

export function DashboardStatusView({ data }: DashboardStatusViewProps) {
    const { status, noteCourante, paiementEnCours, notePrecedente } = data;
    const cfg = STATUS_CONFIG[status];
    const Icon = cfg.icon;
    const activeNote = noteCourante || notePrecedente;

    const formatCurrency = (v: string | number) =>
        new Intl.NumberFormat("fr-CD", { style: "currency", currency: "USD" }).format(Number(v));

    return (
        <div className="space-y-5">

            {/* ― STATUS HERO CARD ― */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={cn(
                    "relative overflow-hidden rounded-lg border shadow-none",
                    status === "PAYMENT_PENDING"
                        ? "bg-[#0d2870] border-[#081B4B] border-t-4 border-t-yellow-400"
                        : "bg-white border-slate-200"
                )}
            >
                {/* Dot grid texture strip - Only for blue card */}
                {status === "PAYMENT_PENDING" && (
                    <div
                        className="absolute inset-0 opacity-[0.05] pointer-events-none"
                        style={{
                            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
                            backgroundSize: "20px 20px"
                        }}
                    />
                )}

                <div className="relative z-10 p-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Status Icon Pill */}
                        <div className={cn(
                            "w-16 h-16 rounded-lg flex items-center justify-center shrink-0 border-b-4",
                            status === "PAYMENT_PENDING"
                                ? "bg-yellow-400 border-yellow-600 text-[#0d2870]"
                                : cn(cfg.bg, cfg.ring, cfg.color, "border-slate-200")
                        )}>
                            <Icon className="w-8 h-8" />
                        </div>

                        <div className="space-y-2">
                            {/* Status Badge */}
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                    "inline-block w-2.5 h-2.5 rounded-full",
                                    status === "PAYMENT_PENDING" ? "bg-yellow-400 animate-pulse" : cfg.dotColor
                                )} />
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.2em]",
                                    status === "PAYMENT_PENDING" ? "text-yellow-400" : cfg.color
                                )}>
                                    {cfg.label} {data.classification && <span className="opacity-50 ml-2">// {data.classification}</span>}
                                </span>
                            </div>
                            <h2 className={cn(
                                "text-2xl font-black tracking-tighter leading-none uppercase",
                                status === "PAYMENT_PENDING" ? "text-white" : "text-slate-900"
                            )}>
                                {cfg.title}
                            </h2>
                            <p className={cn(
                                "text-sm font-medium leading-relaxed max-w-xl",
                                status === "PAYMENT_PENDING" ? "text-white/70" : "text-slate-500"
                            )}>
                                {cfg.description}
                            </p>
                        </div>
                    </div>

                    {cfg.actionLabel && cfg.actionHref && (
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            {status === "COMPLIANT" && (
                                <Link
                                    href="/assujetti/profil/edit"
                                    className="shrink-0 flex items-center gap-2 h-14 px-6 rounded-lg font-black text-[11px] uppercase tracking-[0.15em] transition-all whitespace-nowrap bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                >
                                    Modifier mes infos
                                </Link>
                            )}
                            <Link
                                href={cfg.actionHref}
                                className={cn(
                                    "shrink-0 flex items-center gap-3 h-14 px-8 rounded-lg font-black text-[11px] uppercase tracking-[0.15em] transition-all whitespace-nowrap",
                                    status === "PAYMENT_PENDING"
                                        ? "bg-yellow-400 hover:bg-yellow-300 text-[#0d2870] border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1"
                                        : status === "OVERDUE"
                                            ? "bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-900/20"
                                            : "bg-[#0d2870] hover:bg-slate-900 text-white shadow-none"
                                )}
                            >
                                {cfg.actionLabel}
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ― NOTE CARDS ROW ― */}
            {activeNote && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Card 1 — Montant */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08, duration: 0.35 }}
                        className="bg-white rounded-lg border border-slate-200 shadow-none p-6 flex flex-col gap-4 transition-all hover:border-[#0d2870]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0d2870]">
                                <ReceiptText className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Montant Dû</p>
                                <p className="text-[11px] font-bold text-slate-500 truncate">Note N° {activeNote.numeroNote || "Brouillon"}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-3xl font-black tabular-nums text-slate-900 tracking-tight">
                                {formatCurrency(activeNote.montantTotalDu)}
                            </p>
                            {Number(activeNote.montantPenalites) > 0 && (
                                <p className="text-xs font-semibold text-red-500 mt-1">
                                    dont {formatCurrency(activeNote.montantPenalites)} de pénalités
                                </p>
                            )}
                        </div>

                        <Link
                            href="/assujetti/redevance/en-cours"
                            className="text-[11px] font-black text-[#0d2870] uppercase tracking-widest flex items-center gap-1 mt-auto hover:opacity-70 transition-opacity"
                        >
                            Voir le détail <ArrowRight className="w-3 h-3" />
                        </Link>
                    </motion.div>

                    {/* Card 2 — Échéance */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.14, duration: 0.35 }}
                        className="bg-white rounded-lg border border-slate-200 shadow-none p-6 flex flex-col gap-4 transition-all hover:border-[#0d2870]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0d2870]">
                                <CalendarDays className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Limite</p>
                                <p className="text-[11px] font-bold text-slate-500">Exercice {activeNote.exercice}</p>
                            </div>
                        </div>

                        <div>
                            {activeNote.dateEcheance ? (
                                <>
                                    <p className="text-2xl font-black text-slate-900 leading-tight">
                                        {new Date(activeNote.dateEcheance).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-400 mt-0.5">
                                        {new Date(activeNote.dateEcheance).getFullYear()}
                                    </p>
                                </>
                            ) : (
                                <p className="text-xl font-bold text-slate-400">Non fixée</p>
                            )}
                        </div>

                        {activeNote.dateEmission && (
                            <p className="text-[11px] text-slate-400 font-medium mt-auto">
                                Émission : {new Date(activeNote.dateEmission).toLocaleDateString("fr-FR")}
                            </p>
                        )}
                    </motion.div>

                    {/* Card 3 — Actions rapides */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.35 }}
                        className="bg-[#0d2870] rounded-lg border border-[#081B4B] shadow-none p-6 flex flex-col gap-3 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{
                                backgroundImage: "radial-gradient(white 1px, transparent 1px)",
                                backgroundSize: "20px 20px"
                            }}
                        />
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 relative z-10">Actions rapides</p>

                        <div className="flex flex-col gap-2 relative z-10 mt-auto">
                            {status !== "COMPLIANT" && (
                                <Link
                                    href="/assujetti/redevance/paiement"
                                    className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white text-sm font-bold"
                                >
                                    <span className="flex items-center gap-2"><Banknote className="w-4 h-4" /> Déclarer paiement</span>
                                    <ArrowRight className="w-4 h-4 opacity-60" />
                                </Link>
                            )}
                            <Link
                                href="/assujetti/redevance/en-cours"
                                className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white text-sm font-bold"
                            >
                                <span className="flex items-center gap-2"><ReceiptText className="w-4 h-4" /> Voir ma note</span>
                                <ArrowRight className="w-4 h-4 opacity-60" />
                            </Link>
                            {activeNote.pdfUrl && (
                                <a
                                    href={activeNote.pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white text-sm font-bold"
                                >
                                    <span className="flex items-center gap-2"><DownloadCloud className="w-4 h-4" /> PDF Officiel</span>
                                    <ArrowRight className="w-4 h-4 opacity-60" />
                                </a>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* ― QUICK LINKS GRID ― Always visible now */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.35 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
                {[
                    { href: "/assujetti/profil/infos", label: "Mon Dossier", sub: "Infos personnelles", icon: FileText },
                    {
                        href: "/assujetti/profil/appareils",
                        label: "Mes Appareils",
                        sub: data.deviceSummary
                            ? `${data.deviceSummary.tv} TV · ${data.deviceSummary.radio} Radio`
                            : "Déclarations",
                        icon: ReceiptText
                    },
                    { href: "/assujetti/redevance/historique", label: "Historique", sub: "Notes et paiements", icon: CalendarDays },
                ].map(({ href, label, sub, icon: Icon }) => (
                    <Link key={href} href={href}
                        className="bg-white rounded-lg border border-slate-200 shadow-none p-5 flex flex-col gap-3 hover:border-[#0d2870] transition-all group"
                    >
                        <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#0d2870] transition-colors">
                            <Icon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{label}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{sub}</p>
                        </div>
                    </Link>
                ))}
            </motion.div>
        </div>
    );
}
