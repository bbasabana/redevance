"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FirstLogin2FAPage() {
    const router = useRouter();

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Card className="w-full max-w-lg border-none shadow-xl">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                        <ShieldAlert className="h-10 w-10 text-amber-600" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
                            Action Sécurité Requise
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            Ceci est votre première connexion. En tant qu'Agent, vous devez obligatoirement
                            sécuriser votre compte avec l'authentification à deux facteurs (2FA).
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <p className="text-amber-800 text-sm font-medium text-center">
                            L'accès à votre espace vous sera accordé uniquement après cette configuration.
                        </p>
                    </div>

                    <Button
                        onClick={() => router.push('/panel/setup-2fa')}
                        className="w-full h-14 text-lg font-bold bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        Configurer maintenant
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
