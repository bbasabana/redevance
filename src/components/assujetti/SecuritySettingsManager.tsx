"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ShieldCheck, ShieldAlert, Key, Smartphone, Loader2, Save, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { disable2FA } from "@/lib/auth/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Setup2FAModal } from "./Setup2FAModal";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";

interface SecuritySettingsManagerProps {
    initial2FA: boolean;
}

export default function SecuritySettingsManager({ initial2FA }: SecuritySettingsManagerProps) {
    const { update } = useSession();
    const [is2FAEnabled, setIs2FAEnabled] = useState(initial2FA);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSetup, setShowSetup] = useState(false);
    const [showDisableConfirm, setShowDisableConfirm] = useState(false);

    const handleToggleClick = () => {
        if (is2FAEnabled) {
            setShowDisableConfirm(true);
        } else {
            setShowSetup(true);
        }
    };

    const handleDisable2FA = async () => {
        setIsSubmitting(true);
        try {
            const res = await disable2FA();
            if (res.success) {
                setIs2FAEnabled(false);
                await update({ twoFactorEnabled: false });
                toast.success("Authentification 2FA désactivée");
                setShowDisableConfirm(false);
            }
        } catch (error) {
            toast.error("Erreur technique");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSetupSuccess = async () => {
        setIs2FAEnabled(true);
        await update({ twoFactorEnabled: true });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2FA Configuration Card */}
            <motion.div
                whileHover={{ y: -5 }}
                onClick={handleToggleClick}
                className={cn(
                    "bg-white p-6 rounded-lg border-2 relative overflow-hidden transition-all cursor-pointer shadow-none active:scale-[0.98] group/card",
                    is2FAEnabled ? "border-[#0d2870]" : "border-slate-100 hover:border-[#0d2870]"
                )}
            >
                <div className="flex flex-col h-full relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div className={cn(
                            "w-14 h-14 rounded-lg border flex items-center justify-center transition-all",
                            is2FAEnabled
                                ? "bg-[#0d2870] text-white border-[#0d2870]"
                                : "bg-slate-50 border-slate-100 text-[#0d2870] group-hover/card:bg-[#0d2870] group-hover/card:text-white"
                        )}>
                            <Smartphone className="w-7 h-7" />
                        </div>
                        <Badge className={cn(
                            "text-[9px] font-black px-3 py-1.5 uppercase tracking-[0.1em] rounded shadow-none border-b-2",
                            is2FAEnabled
                                ? "bg-emerald-500 text-white border-emerald-600"
                                : "bg-slate-200 text-slate-600 border-slate-300"
                        )}>
                            {is2FAEnabled ? "PROTECTION ACTIVE" : "NON CONFIGURÉ"}
                        </Badge>
                    </div>

                    <div className="space-y-1 mb-8">
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">SÉCURITÉ MOBILE</p>
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-sm" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase group-hover/card:text-[#0d2870] transition-colors leading-none">
                            DOUBLE FACTEUR (2FA)
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-2">
                            {is2FAEnabled ? "VÉRIFICATION OTP ACTIVÉE" : "RENFORCER LA SÉCURITÉ"}
                        </p>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-end justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">ÉTAT DU SERVICE</p>
                            <p className={cn(
                                "text-2xl font-black tracking-tighter uppercase",
                                is2FAEnabled ? "text-emerald-600" : "text-[#0d2870]"
                            )}>
                                {is2FAEnabled ? "PROTÉGÉ" : "DISPONIBLE"}
                            </p>
                        </div>
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all shadow-none",
                            isSubmitting ? "bg-slate-100 text-slate-400" : is2FAEnabled ? "bg-red-600 text-white hover:bg-red-700" : "bg-slate-900 text-white group-hover/card:bg-[#0d2870]"
                        )}>
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <ChevronRight className="w-6 h-6" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
            </motion.div>

            {/* Password Card */}
            <Link href="/assujetti/securite/mot-de-passe" className="block focus:outline-none focus:ring-0">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-lg border-2 border-slate-100 relative overflow-hidden transition-all cursor-pointer hover:border-[#0d2870] shadow-none active:scale-[0.98] group/card h-full"
                >
                    <div className="flex flex-col h-full relative z-10">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover/card:bg-[#0d2870] group-hover/card:text-white transition-all text-[#0d2870]">
                                <Key className="w-7 h-7" />
                            </div>
                            <Badge className="bg-yellow-400 text-slate-900 border-yellow-500 border-b-2 text-[9px] font-black px-3 py-1.5 uppercase tracking-[0.1em] rounded shadow-none">
                                ACCÈS CRITIQUE
                            </Badge>
                        </div>

                        <div className="space-y-1 mb-8">
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">IDENTIFIANTS</p>
                                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-sm" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase group-hover/card:text-[#0d2870] transition-colors leading-none">
                                MOT DE PASSE
                            </h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-2">
                                GESTION DES IDENTIFIANTS
                            </p>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100 flex items-end justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">ACTION REQUISE</p>
                                <p className="text-2xl font-black text-[#0d2870] tracking-tighter uppercase">
                                    MODIFIER
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center transition-all group-hover/card:bg-red-600 shadow-none">
                                <ChevronRight className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                </motion.div>
            </Link>

            {/* Setup Modal */}
            <Setup2FAModal
                open={showSetup}
                onOpenChange={setShowSetup}
                onSuccess={handleSetupSuccess}
            />

            {/* Disable Confirmation Modal */}
            <Dialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
                <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-white shadow-2xl rounded-3xl">
                    <div className="p-8 space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto text-red-600">
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase mt-4">Désactiver le 2FA ?</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                Votre compte sera moins sécurisé. Cette action est déconseillée.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleDisable2FA}
                                disabled={isSubmitting}
                                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px]"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Oui, désactiver"}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setShowDisableConfirm(false)}
                                className="w-full h-10 text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-[10px]"
                            >
                                Annuler
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
