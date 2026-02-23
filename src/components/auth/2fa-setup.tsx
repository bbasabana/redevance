"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, QrCode, ClipboardCheck, AlertTriangle, RefreshCw, Key, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export function TwoFactorSetup() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState("");

    const recoveryCodes = [
        "XXXX-XXXX-XXXX",
        "YYYY-YYYY-YYYY",
        "ZZZZ-ZZZZ-ZZZZ",
        "AAAA-AAAA-AAAA",
        "BBBB-BBBB-BBBB",
        "CCCC-CCCC-CCCC",
    ];

    const handleNext = () => setStep((s) => s + 1);

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            handleNext();
            toast.success("Authentification à deux facteurs activée !");
        }, 2000);
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Sécurisez votre compte</CardTitle>
                    <CardDescription>
                        L&apos;authentification à deux facteurs (2FA) est obligatoire pour tous les utilisateurs.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-slate-100 p-8 rounded-2xl flex flex-col items-center border-2 border-dashed border-slate-200">
                                    <div className="w-48 h-48 bg-white rounded-xl shadow-inner flex items-center justify-center mb-4">
                                        <QrCode className="w-32 h-32 text-slate-300" />
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium text-center italic">
                                        Scannez ce QR Code avec Google Authenticator ou une application similaire.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                        <Key className="w-6 h-6 text-primary shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-primary">Clé de configuration</p>
                                            <p className="text-sm font-mono break-all font-semibold">JBSW Y3DP EHPK 3PXP</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="ml-auto" onClick={() => toast.info("Clé copiée")}>
                                            <ClipboardCheck className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <form onSubmit={handleVerify} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Code de vérification (6 chiffres)</Label>
                                            <Input
                                                placeholder="000 000"
                                                className="text-center text-2xl tracking-widest font-bold py-6"
                                                maxLength={6}
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full py-6" disabled={loading}>
                                            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                                            {loading ? "Vérification..." : "Vérifier et Activer"}
                                        </Button>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-4">
                                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-800">Codes de Récupération</h4>
                                        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                            Si vous perdez l&apos;accès à votre application 2FA, ces codes seront le seul moyen de récupérer votre compte.
                                            Enregistrez-les dans un endroit sûr.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-sm uppercase">
                                    {recoveryCodes.map((c) => (
                                        <div key={c} className="bg-white p-2 rounded border border-slate-100 text-center font-bold text-slate-600">
                                            {c}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1 py-6" onClick={() => toast.success("Codes copiés")}>
                                        <ClipboardCheck className="w-4 h-4 mr-2" /> Copier
                                    </Button>
                                    <Button className="flex-1 py-6 font-bold" onClick={handleNext}>
                                        Continuer
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-12"
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">Configuration Terminée</h3>
                                <p className="text-slate-500 mt-2 mb-8">
                                    Votre compte est désormais protégé. Vous allez être redirigé vers votre espace.
                                </p>
                                <Button className="w-full py-6" asChild>
                                    <Link href="/dashboard">Accéder au tableau de bord</Link>
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}
