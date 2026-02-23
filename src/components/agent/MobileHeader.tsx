"use client";

import { Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface MobileHeaderProps {
    userName: string;
    userRole: string;
}

export function MobileHeader({ userName, userRole }: MobileHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 h-16 flex items-center justify-between px-4 max-w-[600px] mx-auto w-full">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative">
                    <Image
                        src="/logos/logo.png"
                        alt="RTNC Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <div className="h-4 w-px bg-slate-100 hidden sm:block" />
                <span className="text-[10px] font-black text-[#0d2870] uppercase tracking-[0.2em] hidden sm:block">Redevance</span>
            </div>

            <div className="flex items-center gap-3">
                <button className="relative p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-[#0d2870] transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
                </button>

                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-900 leading-tight uppercase tracking-tight">{userName}</span>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{userRole}</span>
                    </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-[#0d2870] flex items-center justify-center text-white font-black text-[10px] shadow-lg shadow-[#0d2870]/20 shrink-0">
                    {userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                </div>
            </div>
        </header>
    );
}
