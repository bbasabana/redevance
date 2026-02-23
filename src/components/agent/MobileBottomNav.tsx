"use client";

import { Home, Search, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type AgentTab = "home" | "search" | "reports" | "profile";

interface MobileBottomNavProps {
    activeTab: AgentTab;
    onTabChange: (tab: AgentTab) => void;
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
    const tabs = [
        { id: "home", label: "Accueil", icon: Home },
        { id: "search", label: "Recherche", icon: Search },
        { id: "reports", label: "Rapports", icon: ClipboardList },
        { id: "profile", label: "Profil", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 h-20 px-4 pb-safe max-w-[500px] mx-auto w-full">
            <div className="flex items-center justify-around h-full">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id as AgentTab)}
                            className="relative flex flex-col items-center justify-center gap-1 w-16 transition-all"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className="absolute -top-3 w-10 h-1 bg-[#0d2870] rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <div className={cn(
                                "p-2 rounded-xl transition-all duration-300",
                                isActive ? "bg-[#0d2870] text-white shadow-lg shadow-[#0d2870]/20 scale-110" : "text-slate-400 hover:text-slate-600"
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                                isActive ? "text-[#0d2870] opacity-100" : "text-slate-400 opacity-60"
                            )}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
