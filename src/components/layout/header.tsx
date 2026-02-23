"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface HeaderProps {
    userName?: string;
    userTitle?: string;
    showLogo?: boolean;
}

export function Header({ userName, userTitle, showLogo = true }: HeaderProps) {
    const [mounted, setMounted] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <header className="h-16 bg-white sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-6 flex-1">
                    {showLogo && (
                        <div className="block shrink-0">
                            <div className="h-7 w-[100px] bg-slate-100 rounded-md" />
                        </div>
                    )}
                    <div className="relative max-w-md w-full hidden md:block">
                        <div className="pl-10 h-9 bg-slate-50 border-none rounded-md" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-8 w-px bg-slate-200 mx-2" />
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <div className="h-4 w-24 bg-slate-100 rounded" />
                            <div className="h-3 w-32 bg-slate-100 rounded mt-2" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="h-16 bg-white sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-6 flex-1">
                {showLogo && (
                    <Link href="/assujetti/dashboard" className="block shrink-0">
                        <Image
                            src="/logos/logo.png"
                            alt="RTNC Logo"
                            width={100}
                            height={28}
                            className="h-auto w-auto"
                            priority
                        />
                    </Link>
                )}
                <div className="relative max-w-md w-full hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Rechercher..."
                        className="pl-10 bg-slate-50 border-none focus-visible:ring-primary/20 transition-all font-medium text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative group" aria-label="Notifications">
                    <Bell className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </Button>

                <div className="h-8 w-px bg-slate-200 mx-2" />

                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setIsLogoutOpen(true)}
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-red-500 transition-colors">
                            {userName || "Utilisateur"}
                        </p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">
                            {userTitle || "Espace Personnel"}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden group-hover:bg-red-50 group-hover:border-red-200 transition-colors">
                        <User className="w-6 h-6 text-slate-400 group-hover:text-red-500 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
                <DialogContent className="sm:max-w-md rounded-[20px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-red-500 p-6 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <LogOut className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <DialogHeader className="text-center space-y-2">
                            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Déconnexion</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium">
                                Êtes-vous sûr de vouloir vous déconnecter de votre espace RTNC ?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-3 sm:justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setIsLogoutOpen(false)}
                                className="flex-1 rounded-xl h-12 font-bold text-slate-600 border-slate-200 hover:bg-slate-50"
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                                className="flex-1 rounded-xl h-12 font-bold bg-red-500 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all"
                            >
                                Oui, me déconnecter
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </header>
    );
}
