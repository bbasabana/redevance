"use client";

import { motion } from "framer-motion";
import { Plus, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface NewDemandCardProps {
    totalDemandes: number;
}

export function NewDemandCard({ totalDemandes }: NewDemandCardProps) {
    // Only show if no demands or very few, or always as a CTA?
    // User requested "si il ya pas on affiche aucun" which might mean:
    // "if there are no demands, show this special animated card"
    // But then "on affiche aucun" usually means "show nothing".
    // I'll assume they meant: "If no demands, show this special card, otherwise hide it or show simplified".
    // Actually, usually it's "if no activity, show a big CTA".

    if (totalDemandes > 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-10 border-[6px] border-white shadow-2xl shadow-blue-900/10 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-red-100 transition-colors animate-pulse" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-600/30 animate-bounce">
                    <Plus className="w-10 h-10 text-white" strokeWidth={3} />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Nouvelle Demande</h3>
                    </div>
                    <p className="text-slate-500 font-bold max-w-xs mx-auto leading-relaxed">
                        Vous n&apos;avez pas encore de déclaration active pour 2025. Commencez dès maintenant !
                    </p>
                </div>

                <Link
                    href="/assujetti/demandes/new"
                    className="flex items-center gap-3 px-10 py-5 bg-red-600 rounded-[2rem] text-sm font-black text-white hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95 group/btn"
                >
                    Initialiser ma déclaration
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Animated background lines */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                    d="M0 50 Q 25 25, 50 50 T 100 50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    animate={{ d: ["M0 50 Q 25 75, 50 50 T 100 50", "M0 50 Q 25 25, 50 50 T 100 50"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </svg>
        </motion.div>
    );
}
