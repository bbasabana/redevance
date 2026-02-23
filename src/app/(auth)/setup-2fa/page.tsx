"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, QrCode, ClipboardList, CheckCircle2, Copy, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { QRCodeSVG } from "qrcode.react";
import { Separator } from "@/components/ui/separator";
import { getSetup2FAData, verifyAndEnable2FA } from "@/lib/auth/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Setup2FAPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [setupData, setSetupData] = useState<{ secret: string; uri: string } | null>(null);
    const [otpCode, setOtpCode] = useState("");
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getSetup2FAData();
                if (data.alreadyEnabled) {
                    router.replace("/panel/signin");
                    return;
                }
                setSetupData(data as any);
            } catch (err) {
                toast.error("Erreur lors du chargement des données de configuration.");
            }
        };
        loadData();
    }, [router]);

    const handleVerify = async () => {
        if (!setupData || otpCode.length !== 6) return;
        setLoading(true);
        try {
            const result = await verifyAndEnable2FA(setupData.secret, otpCode);
            if (result.success && result.recoveryCodes) {
                setRecoveryCodes(result.recoveryCodes);
                setStep(3);
            } else {
                toast.error("Code invalide. Veuillez réessayer.");
                setOtpCode("");
            }
        } catch (err) {
            toast.error("Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(recoveryCodes.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Codes de récupération copiés !");
    };

    if (!setupData) return null;

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="w-full max-w-xl">
                <div className="flex flex-col items-center mb-8">
                    <Shield className="w-12 h-12 text-primary mb-2" />
                    <h1 className="text-2xl font-bold text-slate-900">Sécurisez votre compte</h1>
                    <p className="text-slate-500 text-center">La double authentification est obligatoire pour tous les utilisateurs</p>
                </div>

                <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-xl">
                    <CardHeader>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">Étape {step} sur 4</span>
                        </div>
                        <CardTitle className="text-xl">
                            {step === 1 && "Scannez le code QR"}
                            {step === 2 && "Vérifiez la configuration"}
                            {step === 3 && "Codes de secours"}
                            {step === 4 && "Configuration terminée"}
                        </CardTitle>
                        <CardDescription>
                            {step === 1 && "Utilisez Google Authenticator ou Authy pour scanner ce code."}
                            {step === 2 && "Entrez le code à 6 chiffres généré par votre application."}
                            {step === 3 && "Enregistrez ces codes dans un endroit sûr. Ils sont votre seul accès en cas de perte de votre téléphone."}
                            {step === 4 && "Votre compte est désormais protégé par la 2FA."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center"
                            >
                                {step === 1 && (
                                    <div className="w-full space-y-6">
                                        <div className="flex justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-inner">
                                            <QRCodeSVG value={setupData.uri} size={200} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Code secret manuel</label>
                                            <div className="flex gap-2">
                                                <code className="flex-1 p-3 bg-slate-100 rounded-lg text-sm font-mono flex items-center justify-center tracking-wider">
                                                    {setupData.secret.match(/.{1,4}/g)?.join(" ")}
                                                </code>
                                            </div>
                                        </div>
                                        <Button className="w-full py-6 rounded-lg" onClick={() => setStep(2)}>
                                            J'ai scanné le code <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="w-full space-y-8 flex flex-col items-center py-4">
                                        <InputOTP
                                            maxLength={6}
                                            value={otpCode}
                                            onChange={setOtpCode}
                                            onComplete={handleVerify}
                                        >
                                            <InputOTPGroup className="gap-2">
                                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                                    <InputOTPSlot
                                                        key={index}
                                                        index={index}
                                                        className="w-12 h-16 text-2xl font-bold border-2 rounded-lg"
                                                    />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                        <div className="w-full flex gap-4">
                                            <Button variant="outline" className="flex-1 py-6 rounded-lg" onClick={() => setStep(1)}>
                                                Retour
                                            </Button>
                                            <Button
                                                className="flex-1 py-6 rounded-lg"
                                                disabled={otpCode.length !== 6 || loading}
                                                onClick={handleVerify}
                                            >
                                                {loading ? "Vérification..." : "Vérifier"}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="w-full space-y-6">
                                        <div className="grid grid-cols-2 gap-2 p-4 bg-slate-100 rounded-xl font-mono text-sm border-2 border-dashed border-slate-300">
                                            {recoveryCodes.map((code, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-400 w-4">{i + 1}.</span>
                                                    <span className="font-bold">{code}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Button variant="outline" className="w-full py-6 rounded-lg border-2" onClick={copyToClipboard}>
                                                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                                {copied ? "Coppied" : "Copier les codes de secours"}
                                            </Button>
                                            <Button className="w-full py-6 rounded-lg" onClick={() => setStep(4)}>
                                                J'ai sauvegardé les codes
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="w-full space-y-8 flex flex-col items-center py-6 text-center">
                                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-bold">Tout est prêt !</h3>
                                            <p className="text-slate-500">Votre accès est maintenant hautement sécurisé.</p>
                                        </div>
                                        <Button className="w-full py-6 rounded-lg bg-green-600 hover:bg-green-700" onClick={() => window.location.replace("/")}>
                                            Continuer
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
