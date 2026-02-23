"use client";

import { useState } from "react";
import { Tv, Radio, Save, Loader2, Info, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { updateDeviceCounts } from "@/app/actions/declaration";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DeviceManagerProps {
    initialTv: number;
    initialRadio: number;
}

export default function DeviceManager({ initialTv, initialRadio }: DeviceManagerProps) {
    const [nbTv, setNbTv] = useState(initialTv);
    const [nbRadio, setNbRadio] = useState(initialRadio);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasChanged = nbTv !== initialTv || nbRadio !== initialRadio;

    const handleUpdate = async () => {
        if (!hasChanged) return;

        setIsSubmitting(true);
        try {
            const res = await updateDeviceCounts({ nbTv, nbRadio });
            if (res.success) {
                toast.success("Parc d'appareils mis à jour avec succès");
            } else {
                toast.error(res.error || "Erreur lors de la mise à jour");
            }
        } catch (error) {
            toast.error("Une erreur inattendue est survenue");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TV Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className={cn(
                        "group space-y-4 p-8 rounded-3xl border-2 transition-all text-center relative overflow-hidden",
                        nbTv > 0 ? "bg-[#0d2870]/5 border-[#0d2870]/20" : "bg-slate-50 border-slate-100"
                    )}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#0d2870]/5 rounded-full -mr-12 -mt-12 blur-2xl" />

                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm transition-transform group-hover:scale-110",
                        nbTv > 0 ? "bg-[#0d2870] text-white" : "bg-white text-slate-400"
                    )}>
                        <Tv className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">Téléviseurs</h3>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Postes TV raccordés</p>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <button
                            onClick={() => setNbTv(Math.max(0, nbTv - 1))}
                            className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-xl hover:bg-slate-50 transition-colors"
                        >
                            -
                        </button>
                        <span className="text-4xl font-black text-[#0d2870] min-w-[3rem] tabular-nums">
                            {nbTv}
                        </span>
                        <button
                            onClick={() => setNbTv(nbTv + 1)}
                            className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-xl hover:bg-slate-50 transition-colors"
                        >
                            +
                        </button>
                    </div>
                </motion.div>

                {/* Radio Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className={cn(
                        "group space-y-4 p-8 rounded-3xl border-2 transition-all text-center relative overflow-hidden",
                        nbRadio > 0 ? "bg-[#0d2870]/5 border-[#0d2870]/20" : "bg-slate-50 border-slate-100"
                    )}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#0d2870]/5 rounded-full -mr-12 -mt-12 blur-2xl" />

                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm transition-transform group-hover:scale-110",
                        nbRadio > 0 ? "bg-[#0d2870] text-white" : "bg-white text-slate-400"
                    )}>
                        <Radio className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">Radios</h3>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Récepteurs enregistrés</p>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <button
                            onClick={() => setNbRadio(Math.max(0, nbRadio - 1))}
                            className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-xl hover:bg-slate-50 transition-colors"
                        >
                            -
                        </button>
                        <span className="text-4xl font-black text-[#0d2870] min-w-[3rem] tabular-nums">
                            {nbRadio}
                        </span>
                        <button
                            onClick={() => setNbRadio(nbRadio + 1)}
                            className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-xl hover:bg-slate-50 transition-colors"
                        >
                            +
                        </button>
                    </div>
                    {nbTv > 0 && nbRadio > 0 && (
                        <p className="absolute bottom-3 left-0 right-0 text-[8px] font-black text-[#0d2870]/40 uppercase tracking-widest">
                            Base informative (TV prioritaire)
                        </p>
                    )}
                </motion.div>
            </div>

            {/* Warning / Info */}
            <div className="bg-blue-50/50 border-2 border-dashed border-blue-200 p-6 rounded-2xl flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm shrink-0">
                    <Info className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-[#0d2870] uppercase tracking-widest">Règles de taxation</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Conformément à la réglementation, la redevance est calculée sur le poste dominant. Si vous possédez des téléviseurs, les radios sont enregistrées à titre d'inventaire mais ne sont pas facturées en supplément.
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                    onClick={handleUpdate}
                    disabled={isSubmitting || !hasChanged}
                    className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-lg shadow-red-900/10 active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Synchronisation...</span>
                    ) : (
                        <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Mettre à jour mon parc</span>
                    )}
                </Button>
            </div>

            {!hasChanged && (
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Aucune modification détectée</p>
                </div>
            )}
        </div>
    );
}
