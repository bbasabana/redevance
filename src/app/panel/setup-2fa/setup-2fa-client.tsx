"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2, ArrowRight, Download, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { setupTotpAction } from "./actions";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Setup2FAClientProps {
    initialSecret: string;
    initialQrUrl: string;
}

export default function Setup2FAClient({ initialSecret, initialQrUrl }: Setup2FAClientProps) {
    const [code, setCode] = useState("");
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [finalRedirect, setFinalRedirect] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (code.length < 6) {
            toast.error("Veuillez entrer un code valide à 6 chiffres.");
            return;
        }

        startTransition(async () => {
            try {
                const result = await setupTotpAction(code, initialSecret);
                if (result?.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Authentification 2FA activée avec succès !");
                    if (result.recoveryCodes) {
                        setRecoveryCodes(result.recoveryCodes);
                        setFinalRedirect(result.redirectUrl || "/assujetti/dashboard");
                    } else {
                        router.replace(result.redirectUrl || "/assujetti/dashboard");
                    }
                }
            } catch (err) {
                toast.error("Une erreur technique s'est produite lors de la configuration.");
            }
        });
    };

    const downloadRecoveryCodes = () => {
        const content = "CODES DE RÉCUPÉRATION RTNC REDEVANCE\n\n" +
            "Gardez ces codes en sécurité. Ils vous permettent d'accéder à votre compte si vous perdez votre téléphone.\n\n" +
            recoveryCodes.join("\n") +
            "\n\nDate: " + new Date().toLocaleString();

        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "rtnc-recovery-codes.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    if (recoveryCodes.length > 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 relative overflow-hidden px-4 py-8">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#0d2870 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl relative z-10"
                >
                    <Card className="border border-slate-200 shadow-none bg-white rounded-2xl overflow-hidden">
                        <div className="h-2 bg-blue-600 w-full" />
                        <CardHeader className="space-y-4 text-center pb-0 pt-8">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
                                <CheckCircle2 className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold tracking-tight text-[#0d2870] uppercase">
                                    Configuration Réussie
                                </CardTitle>
                                <p className="text-sm font-medium text-slate-500 mt-2">
                                    Votre compte est désormais protégé par l'authentification à deux facteurs.
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-8 px-8 pb-8">
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 space-y-3">
                                <h4 className="flex items-center gap-2 text-[#0d2870] font-bold text-xs tracking-widest uppercase">
                                    <ShieldCheck className="w-4 h-4" />
                                    Codes de Récupération (Usage Unique)
                                </h4>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                    Si vous perdez l'accès à votre application, ces codes sont le **seul moyen** de retrouver votre accès. **Téléchargez-les maintenant et gardez-les en lieu sûr.**
                                </p>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {recoveryCodes.map((c, i) => (
                                        <div key={i} className="bg-white border border-blue-100 rounded-lg py-2 px-3 font-mono text-sm font-bold text-[#0d2870] flex justify-between items-center group shadow-sm">
                                            <span>{c}</span>
                                            <span className="text-[10px] text-slate-300 font-sans">{i + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={downloadRecoveryCodes}
                                    variant="outline"
                                    className="flex-1 h-14 border-2 border-slate-100 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 text-slate-600 rounded-xl"
                                >
                                    <Download className="mr-2 h-4 w-4 text-blue-600" />
                                    Télécharger les codes
                                </Button>
                                <Button
                                    onClick={() => router.replace(finalRedirect)}
                                    className="flex-1 h-14 bg-[#0d2870] text-white font-bold uppercase tracking-widest text-[10px] shadow-lg hover:shadow-blue-900/20 rounded-xl"
                                >
                                    Accéder au tableau de bord
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 relative overflow-hidden px-4 py-8">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#0d2870 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl relative z-10"
            >
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Image
                            src="/logos/logo.png"
                            alt="Logo RTNC"
                            width={280}
                            height={80}
                            className="h-14 w-auto"
                        />
                    </Link>
                </div>

                <Card className="border border-slate-200 shadow-none bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="space-y-4 text-center pb-4 pt-8 border-b border-slate-50 bg-slate-50/30">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
                            <ShieldCheck className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold tracking-tight text-[#0d2870]">
                                Configurer l'Authentification 2FA
                            </CardTitle>
                            <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
                                Scannez le QR code ci-dessous avec votre application d'authentification (Google Authenticator, Authy, etc.).
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-8 px-8 pb-8">
                        <div className="mb-6 h-10 px-4 bg-blue-50/50 rounded-lg border border-blue-100/50 flex items-center justify-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-blue-600" />
                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                                Des codes de récupération seront générés après l'activation.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* QR Code Section */}
                            <div className="space-y-4">
                                <div className="flex justify-center bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    {initialQrUrl ? (
                                        <QRCodeSVG value={initialQrUrl} size={180} level="H" includeMargin={false} />
                                    ) : (
                                        <div className="h-[180px] w-[180px] flex items-center justify-center bg-slate-50 rounded-lg animate-pulse">
                                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded-full inline-block">
                                        Scan Recommandé
                                    </p>
                                </div>
                            </div>

                            {/* Manual Entry & Form Section */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ou saisissez cette clé :</span>
                                    <div className="relative group">
                                        <p className="font-mono text-[11px] bg-blue-50 text-[#0d2870] p-3 rounded-xl font-bold break-all border border-blue-100/50 select-all group-hover:bg-blue-100 transition-colors">
                                            {initialSecret || "Chargement..."}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1 h-8 w-8 text-blue-600 hover:bg-white hover:shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                navigator.clipboard.writeText(initialSecret);
                                                toast.success("Clé copiée !");
                                            }}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code de vérification</label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                            placeholder="000000"
                                            className="text-center text-3xl tracking-[0.3em] h-14 font-bold border-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all rounded-xl"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isPending || code.length < 6 || !initialSecret}
                                        className="w-full h-14 text-sm font-bold bg-[#0d2870] hover:bg-[#0d2870]/90 text-white rounded-xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Validation...
                                            </>
                                        ) : (
                                            <>
                                                Activer le 2FA
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </CardContent>

                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center">
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                            RTNC Digital Identity Security
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
