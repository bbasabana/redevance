"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function FirstLogin2FAClient() {
    const router = useRouter();

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#0d2870 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-xl relative z-10 px-4"
            >
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Image
                            src="/logos/logo.png"
                            alt="Logo RTNC"
                            width={280}
                            height={80}
                            className="h-16 w-auto"
                        />
                    </Link>
                </div>

                <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="space-y-4 text-center pb-0 pt-8">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
                            <ShieldCheck className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold tracking-tight text-[#0d2870]">
                                Sécurité Requise
                            </CardTitle>
                            <p className="text-sm font-medium text-slate-500">
                                Niveau de Protection : Élevé
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-8 pt-8 px-8 pb-8">
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-center">
                            <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                "En tant qu'Agent, l'accès sécurisé via l'authentification à deux facteurs (**2FA**) est obligatoire pour protéger l'intégrité des opérations."
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div className="flex flex-col items-center text-center space-y-2">
                                <h3 className="text-lg font-bold text-[#0d2870]">Activation Obligatoire</h3>
                                <p className="text-sm text-slate-500">Configurez votre application TOTP avant d'accéder à votre espace.</p>
                            </div>

                            <Button
                                onClick={() => router.push('/panel/setup-2fa')}
                                className="w-full h-14 text-sm font-bold bg-[#0d2870] hover:bg-[#0d2870]/90 text-white rounded-xl shadow-md transition-all"
                            >
                                Démarrer la configuration
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center mt-8 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    Besoin d'aide ? <Link href="#" className="text-amber-600 hover:underline">Support Technique</Link>
                </p>
            </motion.div>
        </div>
    );
}
