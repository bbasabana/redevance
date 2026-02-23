"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { verifyTotpAction } from "./actions"; // ensure correct path

export default function Verify2FAPage() {
    const [code, setCode] = useState("");
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
                const result = await verifyTotpAction(code);
                if (result?.error) {
                    toast.error(result.error);
                } else if (result?.redirectUrl) {
                    toast.success("Authentification réussie !");
                    router.replace(result.redirectUrl);
                }
            } catch (err) {
                toast.error("Une erreur technique s'est produite.");
            }
        });
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Card className="w-full max-w-md border-none shadow-lg">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Vérification de sécurité</CardTitle>
                    <CardDescription>
                        Entrez le code à 6 chiffres généré par votre application d'authentification.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="text-center text-3xl tracking-widest h-14"
                                autoFocus
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isPending || code.length < 6}
                            className="w-full h-12 text-lg font-bold"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Vérification...
                                </>
                            ) : (
                                <>
                                    Valider
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
