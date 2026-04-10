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
    FileJson,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ADMIN_BASE_PATH } from "@/admin/config";
import { ADMIN_NAV_ITEMS, adminHref, type AdminNavIconKey } from "@/admin/navigation";

const ICON_MAP: Record<AdminNavIconKey, React.ElementType> = {
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

function navItemActive(pathname: string, href: string): boolean {
    if (href === ADMIN_BASE_PATH) {
        return pathname === ADMIN_BASE_PATH || pathname === `${ADMIN_BASE_PATH}/`;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 shrink-0 overflow-y-auto">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <Link href={ADMIN_BASE_PATH} className="block">
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

                <nav className="space-y-1" aria-label="Navigation administration">
                    {ADMIN_NAV_ITEMS.map((item) => {
                        const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
                        const href = adminHref(item.segment);
                        const active = navItemActive(pathname, href);
                        return (
                            <Link
                                key={item.segment || "home"}
                                href={href}
                                title={item.description}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                    active
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "w-5 h-5 transition-colors shrink-0",
                                        active ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                                    )}
                                />
                                <span className="flex-1 truncate">{item.title}</span>
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
                            Administration RTNC
                        </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 truncate">Console sécurisée</p>
                </div>

                <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/panel/signin" })}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                </button>
            </div>
        </div>
    );
}
