"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signInAction } from "@/app/panel/signin/actions";
import { signIn } from "next-auth/react";

export function AdminLoginForm() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email.trim() || !password.trim()) {
      toast.error("Identifiants requis");
      return;
    }

    startTransition(async () => {
      try {
        const result = await signInAction(formData);
        if (result?.error) {
          toast.error(result.error);
        } else if (result?.redirectUrl) {
          await signIn("credentials", {
            email,
            password,
            redirect: false
          });
          router.replace(result.redirectUrl);
        }
      } catch (err) {
        toast.error("Erreur de connexion");
      }
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className="border-slate-200 shadow-2xl rounded-2xl overflow-hidden bg-white">
        <div className="bg-slate-900 px-8 py-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight uppercase">Console d&apos;Administration</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Accès sécurisé RTNC</p>
          </div>
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Admin</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    placeholder="admin@redevance.cd"
                    type="email"
                    required
                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mot de passe</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 h-4" /> : <Eye className="h-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 group transition-all duration-300"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  Se connecter à la console
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            <span>© 2026 RTNC - Système de Redevance</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Serveur Sécurisé
            </span>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center mt-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        En cas de problème d&apos;accès, contactez le support IT
      </p>
    </div>
  );
}
