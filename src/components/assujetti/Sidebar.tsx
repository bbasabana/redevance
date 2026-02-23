"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
    User,
    FileText,
    CreditCard,
    Bell,
    ShieldCheck,
    LogOut,
    Building2,
    ChevronDown,
    Home,
    AlertTriangle,
    History,
    CheckSquare,
    Tv,
    Key,
    Smartphone,
    MonitorPlay
} from "lucide-react";


type MenuItem = {
    id: string;
    title: string;
    href?: string;
    icon: React.ElementType;
    badge?: number;
    subItems?: { title: string; href: string; icon: React.ElementType }[];
};

const mainMenu: MenuItem[] = [
    { id: "dashboard", title: "Tableau de Bord", href: "/assujetti/dashboard", icon: Home },
    {
        id: "ma_redevance",
        title: "Ma Redevance",
        icon: FileText,
        subItems: [
            { title: "Note en cours", href: "/assujetti/redevance/en-cours", icon: FileText },
            { title: "Historique", href: "/assujetti/redevance/historique", icon: History },
            { title: "Confirmer paiement", href: "/assujetti/redevance/paiement", icon: CheckSquare },
        ],
    },
    {
        id: "mon_dossier",
        title: "Mon Dossier",
        icon: User,
        subItems: [
            { title: "Infos personnelles", href: "/assujetti/profil/infos", icon: User },
            { title: "Appareils déclarés", href: "/assujetti/profil/appareils", icon: Tv },
        ],
    },
    { id: "rappels", title: "Mes Rappels", href: "/assujetti/rappels", icon: Bell },
];

const accountMenu: MenuItem[] = [
    {
        id: "securite",
        title: "Sécurité",
        icon: ShieldCheck,
        subItems: [
            { title: "Mot de passe", href: "/assujetti/securite", icon: Key },
            { title: "Auth 2FA", href: "/panel/setup-2fa", icon: Smartphone },
            { title: "Sessions actives", href: "/assujetti/securite/sessions", icon: MonitorPlay },
        ],
    }
];

const ICON_COLORS: Record<string, { bg: string; color: string; activeBg: string }> = {
    dashboard: { bg: "bg-slate-100", color: "text-[#0d2870]", activeBg: "bg-[#0d2870]/10" },
    ma_redevance: { bg: "bg-slate-100", color: "text-amber-600", activeBg: "bg-amber-100" },
    mon_dossier: { bg: "bg-slate-100", color: "text-emerald-600", activeBg: "bg-emerald-100" },
    rappels: { bg: "bg-slate-100", color: "text-rose-500", activeBg: "bg-rose-100" },
    securite: { bg: "bg-slate-100", color: "text-slate-500", activeBg: "bg-slate-200" },
};

function NavItem({ item, pathname }: { item: MenuItem; pathname: string }) {
    const [open, setOpen] = useState(() =>
        item.subItems?.some((s) => pathname.startsWith(s.href.replace("/new", ""))) ?? false
    );

    const colors = ICON_COLORS[item.id] ?? { bg: "bg-slate-100", color: "text-slate-400", activeBg: "bg-slate-200" };

    if (item.subItems) {
        const isGroupActive = item.subItems.some((s) => pathname.startsWith(s.href.replace("/new", "")));

        return (
            <div>
                <button
                    onClick={() => setOpen(!open)}
                    className={cn(
                        "w-full flex items-center justify-between px-2 py-2 rounded-xl transition-all duration-150 group",
                        isGroupActive
                            ? "bg-[#0d2870]/5"
                            : "hover:bg-slate-50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            isGroupActive ? colors.activeBg : colors.bg
                        )}>
                            <item.icon className={cn("w-4 h-4", colors.color)} />
                        </div>
                        <span className={cn(
                            "text-[13px] font-semibold tracking-tight",
                            isGroupActive ? "text-[#0d2870]" : "text-slate-600 group-hover:text-slate-900"
                        )}>
                            {item.title}
                        </span>
                    </div>
                    <ChevronDown className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        open ? "rotate-180 text-[#0d2870]" : "text-slate-300"
                    )} />
                </button>

                {open && (
                    <div className="mt-1 ml-[18px] pl-5 border-l-2 border-slate-100 space-y-0.5 py-1">
                        {item.subItems.map((sub) => {
                            const isActive = pathname === sub.href;
                            return (
                                <Link
                                    key={sub.href}
                                    href={sub.href}
                                    className={cn(
                                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all relative",
                                        isActive
                                            ? "text-[#0d2870] bg-[#0d2870]/5 font-semibold"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                    )}
                                >
                                    <span className={cn(
                                        "w-1.5 h-1.5 rounded-full shrink-0",
                                        isActive ? "bg-[#0d2870]" : "bg-slate-300"
                                    )} />
                                    {sub.title}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    const isActive = pathname === item.href;
    return (
        <Link
            href={item.href!}
            className={cn(
                "flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-150 group relative",
                isActive ? "bg-[#0d2870]" : "hover:bg-slate-50"
            )}
        >
            {/* Icon container */}
            <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                isActive ? "bg-white/15" : colors.bg
            )}>
                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : colors.color)} />
            </div>

            <span className={cn(
                "text-[13px] font-semibold tracking-tight flex-1",
                isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"
            )}>
                {item.title}
            </span>

            {/* Active dot */}
            {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
            )}

            {item.badge !== undefined && (
                <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-white/20 text-white" : "bg-[#0d2870]/10 text-[#0d2870]"
                )}>
                    {item.badge}
                </span>
            )}
        </Link>
    );
}

export function Sidebar({
    typePersonne = "pp",
    userName,
    userRole,
    nif,
    isEnRegle = false,
    hasFiscalData = false,
}: {
    typePersonne?: "pp" | "pm";
    userName?: string;
    userRole?: string;
    nif?: string | null;
    isEnRegle?: boolean;
    hasFiscalData?: boolean;
}) {
    const pathname = usePathname();
    const [logoutOpen, setLogoutOpen] = useState(false);

    return (
        <>
            <aside className="w-56 shrink-0 flex flex-col h-full bg-white border-r border-slate-100">
                {/* Logo — h-16 matches the header bar height */}
                <div className="h-20 flex items-center px-5 shrink-0" style={{ background: "linear-gradient(135deg, #0d2870 0%, #081B4B 100%)" }}>
                    <Link href="/assujetti/dashboard">
                        <Image
                            src="/logos/logo_new.png"
                            alt="Logo"
                            width={160}
                            height={52}
                            className="h-12 w-auto"
                            priority
                        />
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-2 py-5 space-y-6">
                    {/* Main menu */}
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 px-2 mb-3">
                            <span className="h-px flex-1 bg-slate-100" />
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em] shrink-0">
                                Menu
                            </p>
                            <span className="h-px flex-1 bg-slate-100" />
                        </div>
                        {mainMenu.map((item) => (
                            <NavItem key={item.id} item={item} pathname={pathname} />
                        ))}
                    </div>

                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 px-2 mb-3 mt-8">
                            <span className="h-px flex-1 bg-slate-100" />
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em] shrink-0">
                                Compte
                            </p>
                            <span className="h-px flex-1 bg-slate-100" />
                        </div>
                        {accountMenu.map((item) => (
                            <NavItem key={item.id} item={item} pathname={pathname} />
                        ))}

                        <button
                            onClick={() => setLogoutOpen(true)}
                            className="w-full flex items-center justify-between px-2 py-2 rounded-xl transition-all duration-150 group hover:bg-red-50 mt-2"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors bg-red-100/50">
                                    <LogOut className="w-4 h-4 text-red-500" />
                                </div>
                                <span className="text-[13px] font-semibold tracking-tight text-red-600 group-hover:text-red-700">
                                    Déconnexion
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Footer — Blue branded panel */}
                <div className="mx-3 mb-3 rounded-2xl overflow-hidden" style={{ background: "#0d2870" }}>
                    <div className="px-4 pt-5 pb-4">
                        {/* Key fiscal info */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-white/50">NIF</span>
                                <span className="text-[10px] font-mono font-bold text-white/90">{nif || "—"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-white/50">Exercice</span>
                                <span className="text-[10px] font-bold text-white/90">{new Date().getFullYear()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-white/50">Statut</span>
                                {hasFiscalData ? (
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                                        isEnRegle
                                            ? "bg-emerald-400/20 text-emerald-300"
                                            : "bg-amber-400/20 text-amber-300"
                                    )}>
                                        {isEnRegle ? "En règle" : "Montant dû"}
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-white/40">—</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </aside >
            {/* Logout Confirmation Modal */}
            {
                logoutOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                            onClick={() => setLogoutOpen(false)}
                        />
                        <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4 z-10 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                                    <AlertTriangle className="w-7 h-7 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Confirmer la déconnexion</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Êtes-vous sûr de vouloir quitter votre espace assujetti ?
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full pt-2">
                                    <button
                                        onClick={() => setLogoutOpen(false)}
                                        className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <Link
                                        href="/api/auth/signout"
                                        className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-bold flex items-center justify-center hover:bg-red-700 transition-all"
                                    >
                                        Déconnecter
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
