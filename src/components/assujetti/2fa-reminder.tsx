"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function TwoFactorReminder({ enabled }: { enabled: boolean }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!enabled) {
            const timer = setTimeout(() => {
                setOpen(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [enabled]);

    const handleDismiss = () => {
        setOpen(false);
    };

    const handleSetup = () => {
        router.push("/assujetti/securite");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[320px] p-0 overflow-hidden border-none bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl">
                <div className="p-6 space-y-5">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                            <ShieldCheck className="w-6 h-6 text-[#0d2870]" />
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Protégez votre compte</h2>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed px-2">
                                La double authentification ajoute une couche de sécurité supplémentaire.
                                C'est rapide et fortement recommandé.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleSetup}
                            className="h-11 bg-[#0d2870] hover:bg-[#0a1e54] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-900/10 group active:scale-95 transition-all"
                        >
                            Activer maintenant
                            <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleDismiss}
                            className="h-10 text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-[9px]"
                        >
                            Peut-être plus tard
                        </Button>
                    </div>

                    <div className="pt-1 flex items-center justify-center gap-1.5 opacity-40">
                        <Lock className="w-2.5 h-2.5" />
                        <span className="text-[7px] font-black uppercase tracking-widest text-slate-500">Sécurisé par RTNC-CORE</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
