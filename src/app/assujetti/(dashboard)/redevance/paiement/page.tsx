"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Smartphone, CreditCard, ArrowLeft, ArrowRight, CheckCircle,
    ShieldCheck, Banknote, Loader2, Phone, AlertCircle, Receipt, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getPaymentDetails } from "@/app/actions/taxation";
import { TaxationQRCode } from "@/components/assujetti/TaxationQRCode";
import Image from "next/image";

type PaymentMethod = "mobile_money" | "card" | null;
type MobileProvider = "mpesa" | "airtel" | "orange" | null;
type Step = "method" | "provider" | "details" | "simulation" | "success";

const PROVIDERS = [
    { id: "mpesa", name: "M-Pesa", color: "bg-red-600", lightBg: "bg-red-50", icon: "/images/mpesa.png" },
    { id: "airtel", name: "Airtel Money", color: "bg-red-500", lightBg: "bg-red-50", icon: "/images/airtel.png" },
    { id: "orange", name: "Orange Money", color: "bg-orange-500", lightBg: "bg-orange-50", icon: "/images/orange.png" },
];

export default function PaymentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [step, setStep] = useState<Step>("method");
    const [method, setMethod] = useState<PaymentMethod>(null);
    const [provider, setProvider] = useState<MobileProvider>(null);
    const [phone, setPhone] = useState("");
    const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => {
        getPaymentDetails().then(res => {
            if (res.success) {
                setData(res.data);
            } else {
                toast.error(res.error || "Impossible de charger les détails de paiement");
                router.replace("/assujetti/dashboard");
            }
            setLoading(false);
        });
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#0d2870]" />
            </div>
        );
    }

    const handleNext = () => {
        if (step === "method" && method === "mobile_money") setStep("provider");
        else if (step === "method" && method === "card") toast.info("Paiement par carte bientôt disponible");
        else if (step === "provider") setStep("details");
    };

    const runSimulation = () => {
        if (!phone || phone.length < 9) {
            toast.error("Veuillez saisir un numéro de téléphone valide");
            return;
        }
        setIsSimulating(true);
        setStep("simulation");

        setTimeout(() => {
            setStep("success");
            setIsSimulating(false);
            toast.success("Paiement simulé avec succès !");
        }, 4000);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95 }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">
            {/* Header Section - High Contrast Technical Look */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-6 border-b-2 border-slate-900/5 pb-8">
                <div className="space-y-4">
                    <button
                        onClick={() => router.replace("/assujetti/dashboard")}
                        className="inline-flex items-center gap-2 text-[11px] font-black text-[#0d2870] hover:text-red-600 uppercase tracking-[0.2em] transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Administration Dashboard
                    </button>
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase text-balance">Paiement de la Redevance</h1>
                        <p className="text-slate-500 font-bold max-w-xl text-sm leading-relaxed border-l-4 border-yellow-400 pl-4 bg-yellow-400/5 py-2">
                            République Démocratique du Congo — RTNC. Procédure de règlement sécurisée par chiffrage financier.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-lg border-b-4 border-yellow-400">
                    <ShieldCheck className="w-5 h-5 text-yellow-400" />
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">Canal Sécurisé</p>
                        <p className="text-[10px] font-black text-white/50 uppercase leading-tight mt-1">SSL CERTIFIED 256</p>
                    </div>
                </div>
            </div>

            {/* Note Summary Card - Technical Receipt Style */}
            <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                <div className="bg-white rounded-lg border-2 border-slate-100 shadow-xl overflow-hidden relative group">
                    {/* Technical Grid Decorations */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

                    {/* Top Bar - High Contrast */}
                    <div className="bg-[#0d2870] border-b-4 border-yellow-400 p-6 flex items-center justify-between text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                                <Receipt className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1.5">Note de Perception Officielle</h2>
                                <p className="text-xl font-black text-white tracking-tighter uppercase">N° {data.note.numeroNote}</p>
                            </div>
                        </div>

                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Échéance</span>
                            <span className="text-sm font-black text-white">{new Date(data.note.dateEcheance).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                            {/* Left: Info Grid */}
                            <div className="md:col-span-4 space-y-6">
                                <div className="p-4 bg-slate-50/50 rounded-lg border border-transparent hover:border-[#0d2870]/10 hover:bg-white transition-all">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Assujetti / Redevable</Label>
                                    <p className="text-md font-black text-slate-900 tracking-tight uppercase leading-none">{data.assujetti.nomRaisonSociale}</p>
                                    <p className="text-[10px] font-bold text-[#0d2870] uppercase mt-2">ID FISCAL : {data.assujetti.identifiantFiscal}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50/50 rounded-lg border border-transparent hover:border-[#0d2870]/10 hover:bg-white transition-all">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Année Fiscal</Label>
                                        <p className="text-md font-black text-slate-900 font-mono tracking-tighter">{data.note.exercice}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50/50 rounded-lg border border-transparent hover:border-[#0d2870]/10 hover:bg-white transition-all">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Devise</Label>
                                        <p className="text-md font-black text-slate-900 tracking-tight">USD</p>
                                    </div>
                                </div>
                            </div>

                            {/* Center: QR Code Module */}
                            <div className="md:col-span-3 flex flex-col items-center justify-center py-6 md:py-0 border-y md:border-y-0 md:border-x border-slate-100">
                                <div className="relative group p-4">
                                    <div className="absolute -inset-2 bg-yellow-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                                    <div className="relative p-2 bg-white rounded-xl border-2 border-slate-900 shadow-technical">
                                        <TaxationQRCode data={data.qrData} size={110} />
                                    </div>
                                </div>
                            </div>

                            {/* Right: Amount Display Block */}
                            <div className="md:col-span-5">
                                <div className="bg-[#0d2870] rounded-xl p-8 flex flex-col items-center justify-center text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40 border-b-8 border-yellow-400">
                                    <div className="absolute inset-0 opacity-10 pointer-events-none scale-150 rotate-45" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '15px 15px' }} />

                                    <div className="text-center relative z-10 w-full space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Total Taxe Annuelle</Label>
                                        <div className="text-5xl font-black tracking-tighter leading-none flex items-center justify-center">
                                            {Number(data.note.montantTotalDu).toLocaleString()}
                                            <span className="text-xl font-bold ml-2 text-yellow-400">USD</span>
                                        </div>

                                        <div className="w-full h-px bg-white/10 my-4" />

                                        <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">Montant arrêté à la date du {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Payment Steps Section */}
            <div className="mt-6">
                <AnimatePresence mode="wait">
                    {step === "method" && (
                        <motion.div key="method" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-0.5 flex-1 bg-slate-900/5" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Mode de Paiement</h3>
                                <div className="h-0.5 flex-1 bg-slate-900/5" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setMethod("mobile_money")}
                                    className={cn(
                                        "flex flex-col items-center p-8 rounded-lg border-2 transition-all relative overflow-hidden group h-full",
                                        method === "mobile_money" ? "border-[#0d2870] bg-[#0d2870]/5 shadow-technical" : "border-slate-100 bg-white hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all",
                                        method === "mobile_money" ? "bg-[#0d2870] text-white scale-110" : "bg-slate-50 text-slate-400"
                                    )}>
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Mobile Money</span>
                                    <p className="text-[8px] text-slate-400 font-bold mt-2 uppercase tracking-tight">Débit Immédiat — Push SIM</p>

                                    {method === "mobile_money" && (
                                        <motion.div layoutId="active-check" className="absolute top-2 right-2">
                                            <CheckCircle className="w-4 h-4 text-[#0d2870]" />
                                        </motion.div>
                                    )}
                                </button>

                                <button
                                    onClick={() => setMethod("card")}
                                    className={cn(
                                        "flex flex-col items-center p-8 rounded-lg border-2 transition-all relative overflow-hidden group opacity-60 grayscale cursor-not-allowed",
                                        method === "card" ? "border-[#0d2870] bg-[#0d2870]/5" : "border-slate-100 bg-slate-50/50"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Carte Bancaire</span>
                                    <p className="text-[8px] text-slate-400 font-bold mt-2 uppercase tracking-tight">Visa / Mastercard / Maestro</p>
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-white text-[8px] font-black rounded-bl-lg uppercase tracking-widest">Bientôt</div>
                                </button>
                            </div>

                            <Button
                                disabled={!method}
                                onClick={handleNext}
                                className="w-full h-14 bg-[#0d2870] text-white rounded-lg font-black uppercase tracking-[0.2em] text-[10px] shadow-technical active:scale-[0.98] transition-all border-none"
                            >
                                Passer à l'étape suivante <ArrowRight className="w-4 h-4 ml-3" />
                            </Button>
                        </motion.div>
                    )}

                    {step === "provider" && (
                        <motion.div key="provider" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900/5">
                                <button onClick={() => setStep("method")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors group">
                                    <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-[#0d2870]" />
                                </button>
                                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] text-center flex-1">Sélection de l'Opérateur</h3>
                                <div className="w-9" />
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {PROVIDERS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setProvider(p.id as MobileProvider)}
                                        className={cn(
                                            "flex items-center justify-between p-5 rounded-lg border-2 transition-all relative overflow-hidden group",
                                            provider === p.id ? "border-[#0d2870] bg-[#0d2870]/5 shadow-technical" : "border-slate-100 bg-white hover:border-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-lg bg-white border-2 border-slate-100 p-2 shadow-xs shrink-0 flex items-center justify-center group-hover:border-[#0d2870]/20 transition-colors">
                                                <Image src={p.icon} alt={p.name} width={40} height={40} className="object-contain" />
                                            </div>
                                            <div className="text-left">
                                                <span className="font-black text-slate-900 uppercase tracking-widest text-[11px] block">{p.name} Money</span>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Réseau Certifié DRC</span>
                                            </div>
                                        </div>
                                        {provider === p.id ? (
                                            <div className="w-6 h-6 rounded-full bg-[#0d2870] flex items-center justify-center border-4 border-white shadow-sm animate-in zoom-in-50">
                                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-slate-100" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <Button
                                disabled={!provider}
                                onClick={handleNext}
                                className="w-full h-14 bg-[#0d2870] text-white rounded-lg font-black uppercase tracking-[0.2em] text-[10px] shadow-technical active:scale-[0.98] transition-all border-none"
                            >
                                Confirmer l'opérateur <ArrowRight className="w-4 h-4 ml-3" />
                            </Button>
                        </motion.div>
                    )}

                    {step === "details" && (
                        <motion.div key="details" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900/5">
                                <button onClick={() => setStep("provider")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors group">
                                    <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-[#0d2870]" />
                                </button>
                                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] text-center flex-1">Instructions de Paiement</h3>
                                <div className="w-9" />
                            </div>

                            <div className="bg-white p-8 rounded-lg border-2 border-slate-100 shadow-xl space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Numéro de Téléphone Redevable</Label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0d2870] z-10 transition-transform group-focus-within:scale-110">
                                            <Phone className="w-full h-full" />
                                        </div>
                                        <Input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Ex: 081 234 56 78"
                                            className="h-14 pl-12 bg-slate-50 border-2 border-slate-100 rounded-lg text-lg font-black text-slate-900 placeholder:text-slate-200 ring-offset-0 focus-visible:ring-2 focus-visible:ring-[#0d2870] focus-visible:border-transparent transition-all"
                                        />
                                    </div>
                                    <p className="text-[8px] text-[#0d2870] font-black px-1 uppercase tracking-widest mt-2 flex items-center gap-2">
                                        <AlertCircle className="w-3 h-3" />
                                        Une demande Push SIM sera envoyée instantanément.
                                    </p>
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-100 flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                        <Lock className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none">Paiement Chiffré</p>
                                        <p className="text-[9px] text-emerald-600 font-bold leading-tight uppercase">
                                            Ne communiquez jamais votre code PIN. La validation est strictement locale sur votre carte SIM.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={runSimulation}
                                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black uppercase tracking-[0.2em] text-[10px] shadow-technical active:scale-[0.98] transition-all border-none"
                            >
                                Lancer la demande de paiement <CheckCircle className="w-4 h-4 ml-3" />
                            </Button>
                        </motion.div>
                    )}

                    {step === "simulation" && (
                        <motion.div key="simulation" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center py-12 space-y-10">
                            <div className="relative w-32 h-32 mx-auto">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="64" cy="64" r="60" className="stroke-slate-100 fill-none stroke-[8]" />
                                    <motion.circle
                                        cx="64" cy="64" r="60"
                                        className="stroke-[#0d2870] fill-none stroke-[8]"
                                        initial={{ strokeDasharray: "0, 377" }}
                                        animate={{ strokeDasharray: "350, 377" }}
                                        transition={{ duration: 4, ease: "linear" }}
                                        style={{ strokeLinecap: "square" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Smartphone className="w-10 h-10 text-[#0d2870]" />
                                    </motion.div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0d2870] text-yellow-400 rounded text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                    Synchronisation SIM...
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Attente de Validation</h3>
                                <p className="text-[11px] text-slate-500 font-bold max-w-xs mx-auto uppercase tracking-wide leading-relaxed">
                                    Consultez votre appareil (<span className="text-[#0d2870] font-black">{phone}</span>) et authentifiez la transaction avec votre code PIN personnel.
                                </p>

                                <div className="flex justify-center gap-1.5 pt-6">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ scaleX: [1, 2, 1], opacity: [0.2, 1, 0.2] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                                            className="w-4 h-1 rounded-full bg-[#0d2870]"
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === "success" && (
                        <motion.div key="success" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center py-8 space-y-8">
                            <div className="relative w-24 h-24 mx-auto">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                    className="w-full h-full bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 relative z-10"
                                >
                                    <CheckCircle className="w-12 h-12" />
                                </motion.div>
                                <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-2xl animate-ping" />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Transaction Confirmée</h3>
                                <p className="text-[11px] text-slate-500 font-bold max-w-xs mx-auto uppercase tracking-wide">
                                    Le règlement de votre redevance a été authentifié par les services de la RTNC.
                                </p>

                                <div className="bg-slate-900 rounded-lg p-6 max-w-md mx-auto mt-8 border-b-4 border-yellow-400 space-y-4 relative overflow-hidden text-left">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Receipt className="w-20 h-20 text-white" />
                                    </div>

                                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Référence de Transaction</span>
                                        <span className="text-sm font-black text-white font-mono uppercase tracking-widest">TX-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Montant Acquitté</span>
                                        <span className="text-sm font-black text-yellow-400 uppercase tracking-tight">{Number(data.note.montantTotalDu).toLocaleString()} USD</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Horodatage</span>
                                        <span className="text-sm font-black text-white uppercase tracking-tight">{new Date().toLocaleString('fr-FR')}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => router.replace("/assujetti/dashboard")}
                                className="w-full h-14 mt-8 bg-[#0d2870] text-white rounded-lg font-black uppercase tracking-[0.2em] text-[10px] shadow-technical active:scale-[0.98] transition-all border-none"
                            >
                                Retour au Tableau de Bord <ArrowRight className="w-4 h-4 ml-3" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

