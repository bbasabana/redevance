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
    MapPin,
    DollarSign,
    Calendar,
    FileJson
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
    dashboard: LayoutDashboard,
    users: Users,
    settings: Settings,
    reports: BarChart3,
    shield: Shield,
    declarations: FileText,
    recensement: Briefcase,
    notes: CreditCard,
    notifications: Bell,
    zones: MapPin,
    tarifs: DollarSign,
    periodes: Calendar,
    audit: FileJson,
};

const adminItems = [
    { title: "Tableau de Bord", href: "/admin/dashboard", iconName: "dashboard" },
    { title: "Utilisateurs", href: "/admin/utilisateurs", iconName: "users" },
    { title: "Zones & Communes", href: "/admin/zones-communes", iconName: "zones" },
    { title: "Tarifs", href: "/admin/tarifs", iconName: "tarifs" },
    { title: "Périodes", href: "/admin/periodes", iconName: "periodes" },
    { title: "Audit Logs", href: "/admin/audit", iconName: "audit" },
    { title: "Paramètres Globaux", href: "/admin/parametres", iconName: "settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 shrink-0 overflow-y-auto">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <Link href="/admin/dashboard" className="block">
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
                    {adminItems.map((item) => {
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

            <div className="mt-auto p-6 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-2xl mb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                            Administrateur
                        </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 truncate">Utilisateur Redevance</p>
                </div>

                <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                </button>
            </div>
        </div>
    );
}
