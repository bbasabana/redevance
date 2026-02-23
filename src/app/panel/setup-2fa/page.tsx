"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { generateSecret, generateURI } from "otplib";
import { setupTotpAction } from "./actions";

export default function Setup2FAPage() {
    const [code, setCode] = useState("");
    const [secret, setSecret] = useState("");
    const [qrUrl, setQrUrl] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        // Generate a new secret on mount
        const newSecret = generateSecret();
        // Assume user email is 'user@rtnc.cd' for display purposes in authenticator app.
        // In a real app, you'd fetch the user's email to put in the OTPAuth URL.
        const appName = "RTNC Redevance";
        const url = generateURI({
            issuer: appName,
            label: "Moi",
            secret: newSecret,
        });

        setSecret(newSecret);
        setQrUrl(url);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (code.length < 6) {
            toast.error("Veuillez entrer un code valide à 6 chiffres.");
            return;
        }

        startTransition(async () => {
            try {
                const result = await setupTotpAction(code, secret);
                if (result?.error) {
                    toast.error(result.error);
                } else if (result?.redirectUrl) {
                    toast.success("Authentification 2FA activée avec succès !");
                    router.replace(result.redirectUrl);
                }
            } catch (err) {
                toast.error("Une erreur technique s'est produite lors de la configuration.");
            }
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4">
            <Card className="w-full max-w-md border-none shadow-xl">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                            Configurer l'Authentification 2FA
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            Scannez le QR code ci-dessous avec votre application d'authentification (Google Authenticator, Authy, etc.).
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        {qrUrl ? (
                            <QRCodeSVG value={qrUrl} size={200} level="H" />
                        ) : (
                            <div className="h-[200px] w-[200px] flex items-center justify-center bg-slate-100 rounded-lg animate-pulse">
                                <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Ou saisissez cette clé :</span>
                        <p className="font-mono text-sm mt-1 bg-slate-100 py-2 rounded font-medium select-all">
                            {secret || "Chargement..."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Code de vérification</label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="text-center text-3xl tracking-widest h-14 font-mono pb-2"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isPending || code.length < 6 || !secret}
                            className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Activation en cours...
                                </>
                            ) : (
                                <>
                                    Activer le 2FA
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
