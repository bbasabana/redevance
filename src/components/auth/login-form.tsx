"use client";

import { useState, useTransition } from "react";
import { motion, Variants } from "framer-motion";
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signInAction } from "@/app/panel/signin/actions";
import { signIn } from "next-auth/react";

export function LoginForm({ hideSignUp = false }: { hideSignUp?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email.trim() || !password.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires.", { className: "text-red-500" });
      return;
    }

    startTransition(async () => {
      try {
        const result = await signInAction(formData);

        if (result?.error) {
          toast.error(result.error, { className: "text-red-500" });
        } else if (result?.redirectUrl) {
          // Trigger NextAuth login to populate the NextAuth session standard used
          // by most server components (auth()).
          await signIn("credentials", {
            email,
            password,
            redirect: false
          });

          // Explicit requirement: replace history to prevent Back button
          // Setting a session storage flag optionally, though middleware should handle this.
          sessionStorage.setItem("auth_in_progress", "true");
          router.replace(result.redirectUrl);
        }
      } catch (err) {
        toast.error("Un problème technique est survenu.", { className: "text-red-500" });
      }
    });
  };

  const isFormValid = true; // Handled natively or check local state if you want real-time validation

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
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

      <Card className="border-none shadow-none bg-white/70 backdrop-blur-xl rounded-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight text-center">Connexion</CardTitle>
          <CardDescription className="text-center text-slate-500">
            Entrez vos identifiants pour accéder à votre espace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="email">Email professionnel</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  name="email"
                  placeholder="nom@exemple.com"
                  type="email"
                  required
                  className="pl-10 py-6 rounded-lg border-slate-200 focus:border-primary focus:ring-primary"
                />
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="/panel/forgot-password"
                  className="text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="pl-10 pr-10 py-6 rounded-lg border-slate-200 focus:border-primary focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className={`w-full py-6 text-lg font-bold rounded-lg shadow-none group transition-all duration-300 ${isPending
                  ? "bg-yellow-400 text-slate-900"
                  : "bg-primary text-white hover:bg-primary/95"
                  }`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-8">
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white/70 backdrop-blur-sm px-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Sécurité Système
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center space-x-2 text-slate-500">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-tight">Accès</span>
                  <span className="text-xs">Chiffré AES-256</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-slate-500">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-tight">Identité</span>
                  <span className="text-xs">2FA Obligatoire</span>
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {!hideSignUp && (
        <motion.p
          variants={itemVariants}
          className="text-center mt-6 text-slate-500 text-sm"
        >
          Vous n'avez pas de compte ?{" "}
          <Link href="/panel/signup" className="text-primary font-bold hover:underline">
            S'inscrire
          </Link>
        </motion.p>
      )}
    </motion.div>
  );
}
