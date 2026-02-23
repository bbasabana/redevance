"use client";

import React from "react";
import { WifiOff, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100"
            >
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <WifiOff className="w-10 h-10" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Vous êtes hors-ligne</h1>
                <p className="text-slate-500 mb-8">
                    Il semble que vous n'ayez plus de connexion internet. L'application a sauvegardé vos données locales.
                    Vous pouvez continuer à naviguer sur les pages déjà mises en cache.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full py-6 bg-amber-600 hover:bg-amber-700 gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Réessayer la connexion
                    </Button>

                    <Link href="/" className="block">
                        <Button variant="outline" className="w-full py-6">
                            <Home className="w-4 h-4 mr-2" />
                            Retour vers le Dashboard
                        </Button>
                    </Link>
                </div>
            </motion.div>

            <p className="mt-8 text-slate-400 text-sm">
                Redevance Audiovisuelle RTNC • Mode PWA
            </p>
        </div>
    );
}
