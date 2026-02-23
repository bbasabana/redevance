"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    Search, Bell, User, Settings, LogOut,
    ChevronDown, X, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderActionsProps {
    userName: string;
    userRole: string;
    userInitial: string;
}

export function HeaderActions({ userName, userRole, userInitial }: HeaderActionsProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (searchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    }, [searchOpen]);

    // Quick nav suggestions
    const suggestions = [
        { label: "Tableau de bord", href: "/assujetti/dashboard" },
        { label: "Note de redevance", href: "/assujetti/redevance/en-cours" },
        { label: "Historique", href: "/assujetti/redevance/historique" },
        { label: "Paiements", href: "/assujetti/redevance/paiement" },
        { label: "Mon profil", href: "/assujetti/profil/infos" },
        { label: "Sécurité & 2FA", href: "/assujetti/securite" },
    ];

    const filtered = searchQuery.length > 0
        ? suggestions.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : suggestions;

    return (
        <>
            <div className="flex items-center gap-2">

                {/* Search */}
                <div className="relative" ref={searchRef}>
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                            searchOpen
                                ? "bg-white text-[#0d2870]"
                                : "bg-white/15 text-white hover:bg-white/25"
                        )}
                        title="Rechercher"
                    >
                        <Search className="w-4 h-4" />
                    </button>

                    {searchOpen && (
                        <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 z-50 overflow-hidden">
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
                                <Search className="w-4 h-4 text-slate-300 shrink-0" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher une page..."
                                    className="flex-1 text-sm text-slate-900 placeholder:text-slate-300 outline-none bg-transparent"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery("")}>
                                        <X className="w-3.5 h-3.5 text-slate-300 hover:text-slate-600" />
                                    </button>
                                )}
                            </div>
                            <div className="py-2">
                                {filtered.length > 0 ? (
                                    filtered.map((s) => (
                                        <Link
                                            key={s.href}
                                            href={s.href}
                                            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <Search className="w-3 h-3 text-slate-400" />
                                            </div>
                                            <span className="text-sm text-slate-700">{s.label}</span>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400 text-center py-4">Aucun résultat</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Notification Bell */}
                <button className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-all relative">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border-2 border-[#0d2870]" />
                </button>

                {/* Profile Button + Dropdown */}
                <div className="relative ml-1 border-l border-white/20 pl-3" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white text-sm font-bold shrink-0 hover:bg-white/30 transition-colors">
                            {userInitial}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">{userName}</p>
                            <p className="text-[10px] text-white/60">{userRole}</p>
                        </div>
                        <ChevronDown className={cn(
                            "w-3.5 h-3.5 text-white/60 transition-transform hidden md:block",
                            profileOpen && "rotate-180"
                        )} />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-14 w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-300/30 z-50 overflow-hidden">
                            {/* Dark blue header */}
                            <div className="px-5 py-4" style={{ background: "#0d2870" }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-base shrink-0 ring-2 ring-white/30">
                                        {userInitial}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{userName}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                            <p className="text-[10px] text-white/60">{userRole}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu items */}
                            <div className="p-2">
                                <Link
                                    href="/assujetti/profil/infos"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4 text-sky-500" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold">Mon dossier</p>
                                        <p className="text-[10px] text-slate-400">Infos & Appareils</p>
                                    </div>
                                </Link>
                                <Link
                                    href="/assujetti/securite"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                        <Settings className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold">Paramètres</p>
                                        <p className="text-[10px] text-slate-400">Sécurité & 2FA</p>
                                    </div>
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="border-t border-slate-100 p-2">
                                <button
                                    onClick={() => { setProfileOpen(false); setLogoutModalOpen(true); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                                        <LogOut className="w-4 h-4 text-red-500" />
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
            </div>

            {/* Logout Confirmation Modal */}
            {logoutModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                        onClick={() => setLogoutModalOpen(false)}
                    />
                    {/* Modal */}
                    <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 w-full max-w-sm mx-4 z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Confirmer la déconnexion</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Êtes-vous sûr de vouloir vous déconnecter de votre espace assujetti ?
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
