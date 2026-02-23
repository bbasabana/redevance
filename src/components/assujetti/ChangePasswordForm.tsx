"use client";

import { useState } from "react";
import { Lock, ShieldCheck, Key, Save, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { changePassword } from "@/app/actions/securite";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePasswordForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const toggleShow = (key: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Les nouveaux mots de passe ne correspondent pas");
            return;
        }

        if (formData.newPassword.length < 8) {
            toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await changePassword(formData);
            if (res.success) {
                toast.success("Mot de passe mis à jour avec succès");
                setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                toast.error(res.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur technique lors de la mise à jour");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleUpdate} className="space-y-10 group/form mt-2">
            <div className="space-y-8">
                {/* Current Password - Full Width */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d2870]/60">Secret d'Accès Actuel</Label>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Requis pour validation</span>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-[#0d2870] transition-colors">
                            <Lock className="w-4 h-4" />
                        </div>
                        <Input
                            type={showPasswords.current ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            className="bg-slate-50 border-2 border-slate-100/50 h-16 pl-12 pr-14 focus:bg-white focus:border-[#0d2870] focus:ring-0 rounded-2xl font-mono text-xs font-bold transition-all placeholder:text-slate-300 placeholder:uppercase placeholder:text-[9px] placeholder:tracking-[0.2em]"
                            placeholder="*************"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => toggleShow("current")}
                            className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-[#0d2870] transition-colors"
                        >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                    <div className="h-px flex-1 bg-slate-100" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <div className="h-px flex-1 bg-slate-100" />
                </div>

                {/* New Password Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d2870]/60">Nouveau Secret</Label>
                            <span className="w-1 h-1 bg-yellow-400 rounded-full" />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-[#0d2870] transition-colors">
                                <Key className="w-4 h-4" />
                            </div>
                            <Input
                                type={showPasswords.new ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="bg-slate-50 border-2 border-slate-100/50 h-16 pl-12 pr-14 focus:bg-white focus:border-[#0d2870] focus:ring-0 rounded-2xl font-mono text-xs font-bold transition-all placeholder:text-slate-300 placeholder:uppercase placeholder:text-[9px] placeholder:tracking-[0.2em]"
                                placeholder="NOUVEAU_SECRET"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow("new")}
                                className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-[#0d2870] transition-colors"
                            >
                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d2870]/60">Confirmation</Label>
                            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> mismatch
                                </span>
                            )}
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-[#0d2870] transition-colors">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <Input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className={cn(
                                    "bg-slate-50 border-2 h-16 pl-12 pr-14 focus:bg-white focus:ring-0 rounded-2xl font-mono text-xs font-bold transition-all placeholder:text-slate-300 placeholder:uppercase placeholder:text-[9px] placeholder:tracking-[0.2em]",
                                    formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                                        ? "border-red-100 text-red-600 focus:border-red-500"
                                        : "border-slate-100/50 focus:border-[#0d2870]"
                                )}
                                placeholder="CONFIRMATION"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow("confirm")}
                                className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-[#0d2870] transition-colors"
                            >
                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Policy Inline */}
            <div className="bg-[#0d2870]/5 p-6 rounded-2xl border border-[#0d2870]/10 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#0d2870] border border-slate-100 shadow-sm shrink-0">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-[#0d2870] uppercase tracking-[0.2em]">Exigences du Coffre-Fort</h4>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">
                        Minimum 8 caractères. Utilisation de chiffres et symboles recommandée pour une protection optimale du compte fiscal.
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-16 bg-[#0d2870] hover:bg-[#0a1e54] text-white rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] transition-all shadow-xl shadow-indigo-900/10 active:scale-95 disabled:opacity-50 border-none group"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" /> SYNCHRONISATION EN COURS...</span>
                    ) : (
                        <span className="flex items-center gap-3">
                            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Appliquer les nouvelles régulations d'accès
                        </span>
                    )}
                </Button>
            </div>
        </form>
    );
}
