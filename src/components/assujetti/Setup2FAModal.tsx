"use client";

import { useState, useEffect } from "react";
import {
    ShieldCheck,
    Smartphone,
    Copy,
    Check,
    ChevronRight,
    ArrowLeft,
    Download,
    Loader2,
    AlertCircle
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSetup2FAData, verifyAndEnable2FA } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { QRCodeSVG } from "qrcode.react";

interface Setup2FAModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

type SetupStep = "SCAN" | "VERIFY" | "RECOVERY";

export function Setup2FAModal({ open, onOpenChange, onSuccess }: Setup2FAModalProps) {
    const [step, setStep] = useState<SetupStep>("SCAN");
    const [loading, setLoading] = useState(false);
    const [setupData, setSetupData] = useState<{ secret: string; uri: string } | null>(null);
    const [otp, setOtp] = useState("");
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open && step === "SCAN" && !setupData) {
            loadSetupData();
        }
    }, [open]);

    const loadSetupData = async () => {
        setLoading(true);
        try {
            const data = await getSetup2FAData();
            if (data.alreadyEnabled) {
                toast.error("2FA est déjà activé");
                onOpenChange(false);
                return;
            }
            // @ts-ignore
            setSetupData({ secret: data.secret, uri: data.uri });
        } catch (error) {
            toast.error("Erreur lors de l'initialisation");
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (otp.length !== 6 || !setupData) return;
        setLoading(true);
        try {
            const res = await verifyAndEnable2FA(setupData.secret, otp);
            if (res.success) {
                setRecoveryCodes(res.recoveryCodes || []);
                setStep("RECOVERY");
            } else {
                toast.error("Code invalide, réessayez");
                setOtp("");
            }
        } catch (error) {
            toast.error("Erreur de vérification");
        } finally {
            setLoading(false);
        }
    };

    const copyRecoveryCodes = () => {
        const text = recoveryCodes.join("\n");
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Codes de récupération copiés");
    };

    const downloadRecoveryCodes = () => {
        const text = "CODES DE RÉCUPÉRATION RTNC - NE PAS PARTAGER\n\n" + recoveryCodes.join("\n");
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "codes-recuperation-rtnc.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setStep("SCAN");
        setOtp("");
        setRecoveryCodes([]);
        setSetupData(null);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val && step === "RECOVERY") {
                onSuccess();
                reset();
            }
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-white shadow-2xl rounded-[2rem]">
                <div className="p-8">
                    {/* Progress indicator */}
                    <div className="flex gap-2 mb-8">
                        {(["SCAN", "VERIFY", "RECOVERY"] as SetupStep[]).map((s, i) => (
                            <div
                                key={s}
                                className={cn(
                                    "h-1 rounded-full flex-1 transition-all duration-500",
                                    step === s ? "bg-[#0d2870]" : i < ["SCAN", "VERIFY", "RECOVERY"].indexOf(step) ? "bg-emerald-500" : "bg-slate-100"
                                )}
                            />
                        ))}
                    </div>

                    {step === "SCAN" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center space-y-2">
                                <div className="w-14 h-14 rounded-2xl bg-[#0d2870] flex items-center justify-center mx-auto text-white shadow-lg shadow-indigo-900/20">
                                    <Smartphone className="w-7 h-7" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase mt-4">Scanner le QR Code</h2>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Utilisez une application d'authentification (Google, Authy)
                                </p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-center relative group min-h-[220px]">
                                {loading ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                                ) : setupData ? (
                                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                                        <QRCodeSVG value={setupData.uri} size={150} />
                                    </div>
                                ) : null}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3" />
                                    OU ENTRER LE CODE MANUELLEMENT
                                </p>
                                <code className="block w-full bg-white p-3 rounded-lg text-center font-mono text-xs font-bold text-slate-600 border border-slate-100 break-all select-all lowercase">
                                    {setupData?.secret || "..."}
                                </code>
                            </div>

                            <Button
                                onClick={() => setStep("VERIFY")}
                                className="w-full h-12 bg-[#0d2870] hover:bg-[#0a1e54] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] group"
                                disabled={!setupData || loading}
                            >
                                Continuer vers la vérification
                                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    )}

                    {step === "VERIFY" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center space-y-2">
                                <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center mx-auto text-[#0d2870] shadow-lg shadow-yellow-900/10">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase mt-4">Vérification</h2>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Entrez le code à 6 chiffres affiché sur votre application
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={setOtp}
                                >
                                    <InputOTPGroup className="gap-2">
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <InputOTPSlot
                                                key={index}
                                                index={index}
                                                className="w-11 h-11 text-xl font-black rounded-xl border-2 border-slate-100 data-[active=true]:border-[#0d2870] data-[active=true]:ring-1 data-[active=true]:ring-[#0d2870]"
                                            />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleVerify}
                                    disabled={otp.length !== 6 || loading}
                                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px]"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Vérifier et Activer"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep("SCAN")}
                                    className="w-full h-10 text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Retour au QR Code
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === "RECOVERY" && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto text-white shadow-lg shadow-emerald-900/10">
                                    <Check className="w-7 h-7" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase mt-4">2FA Activée !</h2>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Sauvegardez ces codes de récupération. Ils sont requis si vous perdez l'accès à votre application.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                {recoveryCodes.map((code, i) => (
                                    <div key={i} className="font-mono text-[10px] font-bold text-slate-500 bg-white p-2 rounded-lg border border-slate-100 text-center uppercase">
                                        {code}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={copyRecoveryCodes}
                                    className="flex-1 h-11 rounded-xl border-2 border-slate-100 font-bold uppercase tracking-widest text-[9px] flex items-center gap-2 hover:bg-slate-50"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    Copier
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={downloadRecoveryCodes}
                                    className="flex-1 h-11 rounded-xl border-2 border-slate-100 font-bold uppercase tracking-widest text-[9px] flex items-center gap-2 hover:bg-slate-50"
                                >
                                    <Download className="w-4 h-4" />
                                    Télécharger
                                </Button>
                            </div>

                            <Button
                                onClick={() => {
                                    onSuccess();
                                    onOpenChange(false);
                                    reset();
                                }}
                                className="w-full h-12 bg-[#0d2870] hover:bg-[#0a1e54] text-white rounded-2xl font-black uppercase tracking-widest text-[11px]"
                            >
                                Terminer la configuration
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
