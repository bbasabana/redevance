"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
    Shield,
    LogOut,
    LayoutDashboard,
    Users,
    Settings,
    BarChart3,
    FileText,
    Briefcase,
    CreditCard,
    Bell,
    Scale,
    FolderOpen
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
    dashboard: LayoutDashboard,
    users: Users,
    settings: Settings,
    reports: BarChart3,
    shield: Shield,
    declarations: FileText,
    recensement: Users,
    notes: FileText,
    paiements: CreditCard,
    controles: Scale,
    recouvrement: FolderOpen,
    analytics: BarChart3,
    notifications: Bell,
};

const agentItems = [
    { title: "Tableau de Bord", href: "/dashboard/agent/dashboard", iconName: "dashboard" },
    { title: "Assujettis", href: "/dashboard/agent/assujettis", iconName: "recensement" },
    { title: "Déclarations", href: "/dashboard/agent/declarations", iconName: "declarations" },
    { title: "Taxation", href: "/dashboard/agent/taxation", iconName: "notes" },
    { title: "Paiements", href: "/dashboard/agent/paiements", iconName: "paiements" },
    { title: "Contrôles & PV", href: "/dashboard/agent/controles", iconName: "controles" },
    { title: "Recouvrement", href: "/dashboard/agent/recouvrement", iconName: "recouvrement" },
    { title: "Rapports", href: "/dashboard/agent/rapports", iconName: "analytics" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 shrink-0 overflow-y-auto">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <Link href="/dashboard/agent/dashboard" className="block">
                        <Image
                            src="/logos/logo.png"
                            alt="RTNC Logo"
                            width={140}
                            height={40}
                            className="h-auto w-auto"
                            priority
                        />
                    </Link>
                </div>

                <nav className="space-y-1">
                    {agentItems.map((item) => {
                        const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                    active
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                <Icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    active ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                                )} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-4 border-t border-slate-100">
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl mb-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#0d2870]/5 rounded-full -translate-y-8 translate-x-8" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-[#0d2870] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-900/20">
                            AG
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] uppercase font-black tracking-[0.15em] text-slate-400">
                                    Agent de Terrain
                                </span>
                            </div>
                            <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">Utilisateur Redevance</p>
                        </div>
                    </div>
                </div>

                <button className="flex items-center justify-between px-4 py-3 w-full rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all group border border-transparent hover:border-red-100">
                    <span className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </span>
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <div className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-red-400" />
                    </div>
                </button>
            </div>
        </div>
    );
}
