"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building, MapPin, Lock, ChevronRight, ChevronLeft, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { registerUser } from "@/lib/auth/register-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

const steps = [
    { id: "type", title: "Type de Compte", icon: User },
    { id: "info", title: "Informations", icon: Building },
    { id: "contact", title: "Coordonnées", icon: MapPin },
    { id: "security", title: "Sécurité", icon: Lock },
];

export function RegisterForm() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [accountType, setAccountType] = useState<"particulier" | "entreprise">("particulier");
    const router = useRouter();

    // Form data state
    const [formData, setFormData] = useState({
        // Common
        email: "",
        password: "",
        telephone: "",
        adresse: "",
        commune: "",
        nif: "",
        // Individual specific
        nomComplet: "",
        // Enterprise specific
        raisonSociale: "",
        rccm: "",
        representantLegal: "",
    });

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep = () => {
        switch (step) {
            case 0: // Type Selection
                return true;
            case 1: // Informations
                const nifRegex = /^[A-Z0-9]{5,15}$/;
                const rccmRegex = /^[A-Z0-9\s'.:\/-]{5,40}$/;

                if (accountType === "particulier") {
                    if (formData.nif.trim() && !nifRegex.test(formData.nif)) {
                        toast.error("Format Numéro Impôt (NIF) invalide. Ex: A1006563", { className: "text-red-500" });
                        return false;
                    }
                    if (!formData.nomComplet.trim()) {
                        toast.error("Veuillez entrer votre nom complet.", { className: "text-red-500" });
                        return false;
                    }
                } else {
                    if (!formData.nif.trim() || !nifRegex.test(formData.nif)) {
                        toast.error("Format Numéro Impôt (NIF) invalide. Ex: A1006563", { className: "text-red-500" });
                        return false;
                    }
                    if (!formData.raisonSociale.trim()) {
                        toast.error("Veuillez entrer la raison sociale de l'entreprise.", { className: "text-red-500" });
                        return false;
                    }
                    if (!formData.rccm.trim() || !rccmRegex.test(formData.rccm)) {
                        toast.error("Format RCCM invalide. Ex: CD/TRICOM/L'SHI/RCCM:14-B-1561", { className: "text-red-500" });
                        return false;
                    }
                    if (!formData.representantLegal.trim()) {
                        toast.error("Veuillez entrer le nom du représentant légal.", { className: "text-red-500" });
                        return false;
                    }
                }
                return true;
            case 2: // Coordonnées
                if (!formData.telephone.trim()) {
                    toast.error("Veuillez entrer un numéro de téléphone.", { className: "text-red-500" });
                    return false;
                }
                if (!formData.adresse.trim()) {
                    toast.error("Veuillez entrer une adresse.", { className: "text-red-500" });
                    return false;
                }
                if (!formData.commune.trim()) {
                    toast.error("Veuillez sélectionner une commune.", { className: "text-red-500" });
                    return false;
                }
                return true;
            case 3: // Sécurité
                if (!formData.email.trim()) {
                    toast.error("Veuillez entrer un email professionnel.", { className: "text-red-500" });
                    return false;
                }
                if (formData.password.length < 8) {
                    toast.error("Le mot de passe doit comporter au moins 8 caractères.", { className: "text-red-500" });
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep((s) => Math.min(s + 1, steps.length - 1));
        }
    };

    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < steps.length - 1) {
            nextStep();
        } else {
            if (!validateStep()) return;
            setLoading(true);
            try {
                const result = await registerUser({
                    email: formData.email,
                    password: formData.password,
                    nomPrenom: accountType === "particulier" ? formData.nomComplet : (formData.representantLegal || formData.raisonSociale || ""),
                    telephone: formData.telephone,
                    adresseSiege: formData.adresse,
                    commune: formData.commune,
                    accountType,
                    nif: formData.nif,
                    raisonSociale: formData.raisonSociale,
                    rccm: formData.rccm,
                    representantLegal: formData.representantLegal,
                });

                if (result.success) {
                    console.log("Registration successful for:", formData.email);
                    toast.success("Compte créé avec succès ! Redirection en cours...");

                    // Auto-login (sets NextAuth cookie, our custom JWT is already set by registerUser)
                    console.log("Attempting auto-login...");
                    const loginResult = await signIn("credentials", {
                        email: formData.email,
                        password: formData.password,
                        redirect: false,
                    });

                    console.log("Auto-login Result:", loginResult);

                    if (loginResult?.ok) {
                        console.log("Redirecting to identification wizard");
                        router.replace("/assujetti/identification");
                    } else {
                        console.warn("Auto-login failed after registration, redirecting to signin");
                        router.replace("/panel/signin");
                    }
                } else {
                    if (result.error === "EMAIL_ALREADY_EXISTS") {
                        toast.error("Cet email est déjà utilisé.", { className: "text-red-500" });
                    } else {
                        toast.error("Une erreur est survenue lors de l'inscription.", { className: "text-red-500" });
                    }
                }
            } catch (err) {
                toast.error("Une erreur inattendue est survenue.", { className: "text-red-500" });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="w-full max-w-2xl px-2 sm:px-4">
            {/* Progress Bar - More compact on mobile */}
            <div className="mb-8 sm:mb-12 relative flex justify-between px-2 sm:px-4">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200/60 -translate-y-1/2 z-0" />
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-700 ease-in-out"
                    style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                />
                {steps.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = i <= step;
                    return (
                        <div key={s.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                                    isActive
                                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/25 scale-110 sm:scale-100"
                                        : "bg-white border-slate-200 text-slate-300 sm:text-slate-400"
                                )}
                            >
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className={cn(
                                "absolute top-10 sm:top-12 text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.1em] sm:tracking-widest whitespace-nowrap transition-colors duration-500 hidden xs:block",
                                isActive ? "text-primary opacity-100" : "text-slate-400 opacity-60"
                            )}>
                                {s.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            <Card className="border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] bg-white/60 backdrop-blur-2xl rounded-2xl overflow-hidden transition-all duration-500">
                <CardHeader className="py-4 px-6 sm:py-6 sm:px-8 border-b border-slate-100/50">
                    <CardTitle className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{steps[step].title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500 font-medium">
                        {step === 0 ? "Choisissez votre mode d'identification" : "Remplissez les informations ci-dessous"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {step === 0 && (
                                    <div className="grid grid-cols-2 gap-3 sm:gap-6">
                                        <button
                                            type="button"
                                            onClick={() => setAccountType("particulier")}
                                            className={cn(
                                                "flex flex-col items-center p-5 sm:p-8 rounded-2xl border-2 transition-all relative group overflow-hidden",
                                                accountType === "particulier"
                                                    ? "border-primary bg-primary/[0.03] text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                                    : "border-slate-100 bg-white hover:border-primary/30 text-slate-400"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity",
                                                accountType === "particulier" && "opacity-100"
                                            )} />
                                            {accountType === "particulier" && (
                                                <div className="absolute top-3 right-3 text-primary z-10">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div className={cn(
                                                "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 z-10",
                                                accountType === "particulier" ? "bg-primary text-white scale-110 shadow-lg" : "bg-slate-50 text-slate-300"
                                            )}>
                                                <User className="w-6 h-6 sm:w-8 h-8" />
                                            </div>
                                            <span className="font-black text-sm sm:text-lg z-10 tracking-tight">Particulier</span>
                                            <p className="text-[10px] sm:text-xs text-center mt-1 sm:mt-2 opacity-60 font-medium px-2 z-10 leading-tight">Compte personnel pour citoyens</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAccountType("entreprise")}
                                            className={cn(
                                                "flex flex-col items-center p-5 sm:p-8 rounded-2xl border-2 transition-all relative group overflow-hidden",
                                                accountType === "entreprise"
                                                    ? "border-primary bg-primary/[0.03] text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                                    : "border-slate-100 bg-white hover:border-primary/30 text-slate-400"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity",
                                                accountType === "entreprise" && "opacity-100"
                                            )} />
                                            {accountType === "entreprise" && (
                                                <div className="absolute top-3 right-3 text-primary z-10">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div className={cn(
                                                "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 z-10",
                                                accountType === "entreprise" ? "bg-primary text-white scale-110 shadow-lg" : "bg-slate-50 text-slate-300"
                                            )}>
                                                <Building className="w-6 h-6 sm:w-8 h-8" />
                                            </div>
                                            <span className="font-black text-sm sm:text-lg z-10 tracking-tight">Entreprise</span>
                                            <p className="text-[10px] sm:text-xs text-center mt-1 sm:mt-2 opacity-60 font-medium px-2 z-10 leading-tight">Compte pour entités morales</p>
                                        </button>
                                    </div>
                                )}

                                {step === 1 && (
                                    <div className="space-y-4">
                                        {accountType === "particulier" ? (
                                            <>
                                                <div className="space-y-1.5">
                                                    <Label className="text-slate-700 font-bold ml-1 text-xs uppercase tracking-wider">Nom complet</Label>
                                                    <Input
                                                        placeholder="Ex: Jean Mukendi"
                                                        value={formData.nomComplet}
                                                        onChange={(e) => updateFormData("nomComplet", e.target.value)}
                                                        className="h-11 sm:h-12 bg-white/50 border-slate-200 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-1.5 pt-2">
                                                    <div className="flex items-center justify-between px-1">
                                                        <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">NIF <span className="text-slate-400 font-medium italic normal-case lowercase ml-1">(Optionnel)</span></Label>
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-black uppercase border border-blue-100">IMPÔT</span>
                                                    </div>
                                                    <Input
                                                        placeholder="A1006563"
                                                        value={formData.nif}
                                                        onChange={(e) => updateFormData("nif", e.target.value)}
                                                        className="h-11 sm:h-12 bg-white/50 border-slate-200 focus:border-primary/50 focus:ring-primary/20 transition-all font-mono text-xs rounded-xl"
                                                    />
                                                    <p className="text-[10px] text-slate-400 font-medium px-2 italic">Format: A0000000</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="space-y-1.5">
                                                    <Label className="text-slate-700 font-bold ml-1 text-xs uppercase tracking-wider">Raison Sociale</Label>
                                                    <Input
                                                        placeholder="Ex: SARL Ma Boutique"
                                                        value={formData.raisonSociale}
                                                        onChange={(e) => updateFormData("raisonSociale", e.target.value)}
                                                        className="h-11 sm:h-12 bg-white/50 border-slate-200 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between px-1">
                                                            <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">RCCM</Label>
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-black uppercase border border-indigo-100 text-[8px]">REGISTRE</span>
                                                        </div>
                                                        <Input
                                                            placeholder="CD/TRICOM/L'SHI/RCCM:14-B-1561"
                                                            value={formData.rccm}
                                                            onChange={(e) => updateFormData("rccm", e.target.value)}
                                                            className="h-11 sm:h-12 bg-white/50 border-slate-200 focus:border-primary/50 focus:ring-primary/20 transition-all font-mono text-xs rounded-xl"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between px-1">
                                                            <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">NIF</Label>
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-black uppercase border border-blue-100 text-[8px]">IMPÔT</span>
                                                        </div>
                                                        <Input
                                                            placeholder="A1006563"
                                                            value={formData.nif}
                                                            onChange={(e) => updateFormData("nif", e.target.value)}
                                                            className="h-11 sm:h-12 bg-white/50 border-slate-200 focus:border-primary/50 focus:ring-primary/20 transition-all font-mono text-xs rounded-xl"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 pt-2">
                                                    <Label className="text-slate-700 font-bold ml-1 text-xs uppercase tracking-wider italic">Représentant légal <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        placeholder="Nom complet du gérant"
                                                        value={formData.representantLegal}
                                                        onChange={(e) => updateFormData("representantLegal", e.target.value)}
                                                        className="h-11 sm:h-12 bg-white/50 border-slate-200 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Adresse physique</Label>
                                            <Input
                                                placeholder="Ex: 123 Blvd du 30 Juin"
                                                value={formData.adresse}
                                                onChange={(e) => updateFormData("adresse", e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Commune</Label>
                                                <Input
                                                    placeholder="Ex: Gombe"
                                                    value={formData.commune}
                                                    onChange={(e) => updateFormData("commune", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Téléphone</Label>
                                                <Input
                                                    placeholder="+243"
                                                    value={formData.telephone}
                                                    onChange={(e) => updateFormData("telephone", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                placeholder="email@exemple.com"
                                                value={formData.email}
                                                onChange={(e) => updateFormData("email", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mot de passe</Label>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Minimum 8 caractères"
                                                    value={formData.password}
                                                    onChange={(e) => updateFormData("password", e.target.value)}
                                                    required
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-400">
                                                Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Finalization Modal */}
                        <AnimatePresence>
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md px-4"
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 20 }}
                                        className="bg-white border text-center shadow-2xl rounded-2xl p-10 max-w-sm w-full space-y-6"
                                    >
                                        <div className="relative w-24 h-24 mx-auto">
                                            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                                            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-primary animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <CardTitle className="text-2xl font-bold">Un instant...</CardTitle>
                                            <CardDescription className="text-slate-500 text-base leading-relaxed">
                                                Veuillez patienter car nous préparons votre dashboard premium.
                                            </CardDescription>
                                        </div>
                                        <div className="flex justify-center gap-1">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                    className="w-2 h-2 rounded-full bg-primary"
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-6">
                            {step > 0 && (
                                <Button type="button" variant="outline" className="flex-1 py-5 sm:py-6 rounded-xl border-slate-200 hover:bg-slate-50 transition-all font-bold text-slate-600" onClick={prevStep}>
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Retour
                                </Button>
                            )}
                            <Button type="submit" className="flex-1 py-5 sm:py-6 rounded-xl bg-primary hover:bg-primary/95 text-white font-black shadow-lg shadow-primary/25 transition-all active:scale-[0.98]" disabled={loading}>
                                {step === steps.length - 1 ? (loading ? "Création..." : "Finaliser") : "Continuer"}
                                {step < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>
                    </form>

                    {step === 0 && (
                        <p className="mt-8 text-center text-sm text-slate-500">
                            Déjà inscrit ? <Link href="/panel/signin" className="text-primary font-bold hover:underline">Se connecter</Link>
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
