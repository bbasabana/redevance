"use client";

import { useState, useTransition } from "react";
import { motion, Variants } from "framer-motion";
import { Shield, Mail, Key, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { requestPasswordReset } from "@/app/actions/auth-reset";

export default function ForgotPasswordPage() {
    const [isPending, startTransition] = useTransition();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [message, setMessage] = useState("");

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const identifier = formData.get("identifier") as string;

        if (!identifier.trim()) {
            toast.error("Veuillez entrer votre email ou votre numéro de téléphone.", { className: "text-red-500" });
            return;
        }

        startTransition(async () => {
            try {
                const result = await requestPasswordReset(identifier);
                if (result.success) {
                    setIsSubmitted(true);
                    setMessage(result.message || "");
                    toast.success("Demande envoyée !");
                } else {
                    toast.error(result.error || "Une erreur est survenue.", { className: "text-red-500" });
                }
            } catch (err) {
                toast.error("Un problème technique est survenu. Veuillez réessayer.", { className: "text-red-500" });
            }
        });
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-64 -mt-32" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -ml-64 -mb-32" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md relative z-10"
            >
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Image
                            src="/logos/logo.png"
                            alt="Logo RTNC Redevance"
                            width={280}
                            height={80}
                            className="h-16 w-auto"
                        />
                    </Link>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl rounded-2xl">
                    {!isSubmitted ? (
                        <>
                            <CardHeader className="space-y-1 text-center pb-2">
                                <CardTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase">Mot de passe oublié</CardTitle>
                                <CardDescription className="text-slate-500 text-sm px-4">
                                    Entrez votre adresse email ou votre numéro de téléphone pour recevoir les instructions de réinitialisation.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="identifier" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Identifiant</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="identifier"
                                                name="identifier"
                                                placeholder="email@exemple.com ou +243..."
                                                className="pl-10 h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 bg-white/50"
                                                disabled={isPending}
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={isPending}
                                            className="w-full h-12 text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary hover:bg-primary/95 text-white"
                                        >
                                            {isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Traitement...
                                                </>
                                            ) : (
                                                <>
                                                    Envoyer les instructions
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </form>

                                <motion.div variants={itemVariants} className="text-center pt-2">
                                    <Link
                                        href="/panel/signin"
                                        className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-primary transition-colors"
                                    >
                                        <ArrowLeft className="mr-2 h-3 w-3" />
                                        Retour à la connexion
                                    </Link>
                                </motion.div>
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="py-12 space-y-6 text-center">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
                            >
                                <CheckCircle2 className="w-10 h-10" />
                            </motion.div>
                            
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase">Demande Reçue</h3>
                                <p className="text-slate-500 text-sm leading-relaxed px-4">
                                    {message}
                                </p>
                            </div>

                            <div className="pt-4">
                                <Link href="/panel/signin">
                                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-black uppercase tracking-widest text-xs hover:bg-slate-50">
                                        RETOURNER À LA CONNEXION
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Secure footer info */}
                <motion.div 
                    variants={itemVariants}
                    className="mt-8 flex justify-center items-center gap-6 text-slate-400"
                >
                    <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        <span className="text-[10px] uppercase font-bold tracking-tighter">Sécurisé</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Key className="w-3 h-3" />
                        <span className="text-[10px] uppercase font-bold tracking-tighter">AES-256</span>
                    </div>
                </motion.div>
            </motion.div>
        </main>
    );
}
