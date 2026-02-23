"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FileText,
    CreditCard,
    User,
    Building2,
    MoreHorizontal
} from "lucide-react";

export function BottomNav({ typePersonne = "pp" }: { typePersonne?: "pp" | "pm" }) {
    const pathname = usePathname();

    const bottomItems = [
        { id: "dashboard", title: "Accueil", href: "/assujetti/dashboard", icon: LayoutDashboard },
        { id: "demandes", title: "Demandes", href: "/assujetti/demandes", icon: FileText },
        { id: "paiements", title: "Paiements", href: "/assujetti/paiements", icon: CreditCard },
        {
            id: "profil",
            title: "Profil",
            href: "/assujetti/profil",
            icon: typePersonne === "pm" ? Building2 : User
        },
        { id: "menu", title: "Plus", href: "#", icon: MoreHorizontal },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm">
            {/* Minimalist flat floating bar */}
            <div className="bg-white/80 backdrop-blur-xl border-none rounded-[2rem] px-2 py-2">
                <div className="grid h-14 grid-cols-5 items-center">
                    {bottomItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.id === "demandes" && pathname.startsWith("/assujetti/demandes"));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="flex flex-col items-center justify-center group"
                            >
                                <div className={cn(
                                    "flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200",
                                    isActive
                                        ? "bg-slate-900 text-white scale-105"
                                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                                )}>
                                    <Icon className="w-5.5 h-5.5" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
