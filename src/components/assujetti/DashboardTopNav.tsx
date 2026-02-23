"use client";
// Force rebuild for module resolution

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
    Home, ReceiptText, FileText, ShieldCheck,
    History, User, Settings, LogOut, ChevronDown,
    AlertTriangle, Banknote, Bell, RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardTopNavProps {
    userName: string;
    userRole: string;
    nif: string | null;
    userInitial: string;
    typePersonne: "pp" | "pm";
    isEnRegle: boolean;
    hasFiscalData: boolean;
    classification?: string | null;
}

const NAV_ITEMS = [
    { href: "/assujetti/dashboard", label: "Accueil", icon: Home },
    { href: "/assujetti/redevance/en-cours", label: "Ma Note", icon: ReceiptText },
    { href: "/assujetti/redevance/historique", label: "Historique", icon: History },
    { href: "/assujetti/profil/infos", label: "Mon Dossier", icon: FileText },
];

export function DashboardTopNav({
    userName, userRole, nif, userInitial, typePersonne, isEnRegle, hasFiscalData, classification
}: DashboardTopNavProps) {
    const pathname = usePathname();
    const [profileOpen, setProfileOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <nav className="flex items-center gap-1">
                {/* Desktop navigation links */}
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== "/assujetti/dashboard" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "hidden md:flex items-center gap-2 h-9 px-4 rounded-lg text-[11px] font-black uppercase tracking-tighter transition-all",
                                active
                                    ? "bg-[#0d2870] text-white shadow-none"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    );
                })}

                {/* Status pill */}
                {isEnRegle && hasFiscalData && (
                    <div className="hidden lg:flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 ml-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">En Règle</span>
                    </div>
                )}

                {/* Divider */}
                <div className="hidden md:block w-px h-5 bg-slate-200 mx-1" />

                {/* Notification bell */}
                <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
                </button>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2.5 h-9 pl-1.5 pr-2.5 rounded-lg hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                    >
                        <div className="w-7 h-7 rounded-lg bg-[#0d2870] flex items-center justify-center text-white text-[11px] font-black shrink-0 border-b-2 border-slate-900">
                            {userInitial}
                        </div>
                        <span className="hidden md:block text-[11px] font-black text-slate-900 uppercase tracking-tighter max-w-[130px] truncate">{userName}</span>
                        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", profileOpen && "rotate-180")} />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 z-50 overflow-hidden">
                            {/* Header */}
                            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#0d2870] flex items-center justify-center text-white text-sm font-black shrink-0">
                                    {userInitial}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                        <p className="text-[10px] text-slate-400 truncate">
                                            {userRole}{nif && ` · ${nif}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile nav items */}
                            <div className="p-2 md:hidden border-b border-slate-100">
                                {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all"
                                    >
                                        <Icon className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium">{label}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="p-2">
                                <Link
                                    href="/assujetti/profil/infos"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                                        <User className="w-3.5 h-3.5 text-sky-500" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold">Mon dossier</p>
                                        <p className="text-[10px] text-slate-400">Infos &amp; Appareils</p>
                                    </div>
                                </Link>
                                <Link
                                    href="/assujetti/securite"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                        <Settings className="w-3.5 h-3.5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold">Paramètres</p>
                                        <p className="text-[10px] text-slate-400">Sécurité &amp; 2FA</p>
                                    </div>
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="border-t border-slate-100 p-2">
                                <button
                                    onClick={() => { setProfileOpen(false); setLogoutModalOpen(true); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 transition-all group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[13px] font-semibold text-red-500">Déconnexion</p>
                                        <p className="text-[10px] text-red-300">Quitter la session</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
            {logoutModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                        onClick={() => setLogoutModalOpen(false)}
                    />
                    <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 w-full max-w-sm mx-4 z-10">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Confirmer la déconnexion</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Êtes-vous sûr de vouloir vous déconnecter ?
                                </p>
                            </div>
                            <div className="flex gap-3 w-full pt-2">
                                <button
                                    onClick={() => setLogoutModalOpen(false)}
                                    className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    Annuler
                                </button>
                                <Link
                                    href="/api/auth/signout"
                                    className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-bold flex items-center justify-center hover:bg-red-700 transition-all shadow-sm shadow-red-900/10"
                                >
                                    Déconnecter
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
