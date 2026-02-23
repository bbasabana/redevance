"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowRight, RefreshCw, PenSquare, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { processFastRenewal } from "@/app/actions/renouvellement";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RenouvellementPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const currentYear = new Date().getFullYear();

    const handleFastRenewal = async () => {
        setLoading(true);
        try {
            const res = await processFastRenewal();
            if (res.success) {
                toast.success(`Votre déclaration a été renouvelée pour l'année ${currentYear} !`);
                setSuccess(true);
            } else {
                toast.error(res.error || "Une erreur est survenue lors du renouvellement.");
            }
        } catch (error) {
            toast.error("Erreur serveur.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-12">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Félicitations !</h1>
                <p className="text-lg text-slate-600 font-medium">
                    Votre déclaration d'appareils a été renouvelée à l'identique avec succès pour l'exercice {currentYear}.
                    Votre nouvelle Note de Taxation provisoire est prête.
                </p>
                <div className="pt-8">
                    <Link
                        href="/assujetti/dashboard"
                        className="inline-flex h-14 px-8 items-center justify-center rounded-xl bg-[#0d2870] hover:bg-[#081B4B] text-white font-bold transition-all shadow-xl shadow-blue-900/10"
                    >
                        Retourner au Tableau de Bord
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <Link
                    href="/assujetti/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0d2870] transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour au tableau de bord
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Renouvellement Annuel
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    La période réglementaire pour la déclaration de l'exercice {currentYear} est ouverte.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Option 1: Fast Renewal */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-[#001f5c] p-8 rounded-3xl border border-blue-900 text-white shadow-xl relative overflow-hidden flex flex-col justify-between group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-white/20" />

                    <div className="relative z-10 space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                            <RefreshCw className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black mb-3">Renouvellement Rapide</h2>
                            <p className="text-blue-100/80 font-medium leading-relaxed">
                                Votre parc d'appareils et vos informations n'ont pas changé par rapport à l'année précédente ? Reconduisez votre déclaration en un clic.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-10">
                        <Button
                            onClick={handleFastRenewal}
                            disabled={loading}
                            className="w-full h-14 bg-white hover:bg-slate-100 text-[#0d2870] font-bold text-base rounded-xl transition-all shadow-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Renouvellement en cours...
                                </>
                            ) : (
                                <>
                                    Je certifie et reconduis
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                        <p className="text-[10px] text-center text-blue-200 mt-4 opacity-80 uppercase tracking-widest font-bold">
                            Soumis aux conditions générales
                        </p>
                    </div>
                </motion.div>

                {/* Option 2: Modification */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-slate-200 transition-colors"
                >
                    <div className="space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <PenSquare className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-3">Nouvelle Déclaration</h2>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Votre parc d'appareils a évolué (ajouts ou retraits) ? Modifiez votre déclaration avant la génération de votre nouvelle Note de Taxation.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10">
                        <Link
                            href="/assujetti/profil/appareils"
                            className="flex items-center justify-center w-full h-14 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-base rounded-xl transition-all border border-slate-200 shadow-sm"
                        >
                            Modifier mes appareils
                            <ArrowRight className="w-5 h-5 ml-2 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
