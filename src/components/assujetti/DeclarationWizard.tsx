"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Building2,
    Check,
    ChevronRight,
    ChevronLeft,
    Monitor,
    FileSignature,
    Eye,
    Info,
    Smartphone,
    PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { getCommunes } from "@/lib/actions/commune-actions";
import { submitDeclaration } from "@/lib/actions/declaration-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    { id: 1, title: "Identification", icon: User },
    { id: 2, title: "Appareils", icon: Monitor },
    { id: 3, title: "Documents & Signature", icon: FileSignature },
    { id: 4, title: "Récapitulatif", icon: Eye },
];

const OPERATORS = [
    { id: "canal_tout", name: "CANAL+ TOUT", price: 45 },
    { id: "canal_evasion", name: "CANAL+ ÉVASION", price: 20 },
    { id: "canal_essentiel", name: "CANAL+ ESSENTIEL", price: 10 },
    { id: "canal_access", name: "CANAL+ ACCESS+", price: 27 },
    { id: "easy_tv", name: "EASY-TV", price: 6.5 },
    { id: "startimes_unique", name: "STARTIMES UNIQUE", price: 25 },
    { id: "startimes_classique", name: "STARTIMES CLASSIQUE", price: 20 },
    { id: "startimes_base", name: "STARTIMES DE BASE", price: 12 },
    { id: "startimes_nova", name: "STARTIMES NOVA", price: 5 },
    { id: "dstv_access", name: "DSTV ACCESS (ELLICO)", price: 12 },
    { id: "dstv_family", name: "DSTV FAMILY", price: 26 },
    { id: "dstv_compact_plus", name: "DSTV COMPACT PLUS", price: 68 },
    { id: "dstv_premium", name: "DSTV PREMIUM", price: 105 },
    { id: "bluesat_week", name: "BLUESAT (semaine)", price: 1.75 },
    { id: "bluesat_month", name: "BLUESAT (mois)", price: 4.56 },
    { id: "bluesat_3months", name: "BLUESAT (3 mois)", price: 10.5 },
];

export function DeclarationWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [communes, setCommunes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Form Data
    const [formData, setFormData] = useState({
        // Step 1
        typePersonne: "pp",
        nomRaisonSociale: "",
        nif: "",
        rccm: "",
        adresseSiege: "",
        communeId: "",
        zoneTarifaire: "",
        telephonePrincipal: "",
        telephoneSecondaire: "",
        email: "",
        // Step 2
        exercice: "2025",
        nbTV: 0,
        nbRadio: 0,
        decoders: {} as Record<string, number>,
        totalAppareils: 0,
        montantEstime: 0,
        // Step 3
        remarques: "",
        signature: null as string | null,
    });

    // Load from local storage on mount
    useEffect(() => {
        const savedData = localStorage.getItem("declarationWizardData");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(parsed.formData);
                setCurrentStep(parsed.currentStep || 1);
            } catch (e) {
                console.error("Failed to parse saved declaration data");
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        // Debounce saving slightly or simply save on state change since it's local
        localStorage.setItem("declarationWizardData", JSON.stringify({
            formData,
            currentStep
        }));
    }, [formData, currentStep]);

    const fetchCommunes = async () => {
        const result = await getCommunes();
        if (result.success) {
            setCommunes(result.data || []);
        } else {
            toast.error("Impossible de charger les communes");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCommunes();
    }, []);

    const nextStep = () => {
        if (currentStep === STEPS.length) {
            handleSubmit();
        } else {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        }
    };

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const result = await submitDeclaration(formData);
        if (result.success) {
            localStorage.removeItem("declarationWizardData"); // Clear auto-save
            toast.success(`Votre demande a été soumise avec succès ! Référence: ${result.reference}`);
            router.push("/assujetti/demandes");
        } else {
            toast.error(result.error || "Une erreur est survenue lors de la soumission");
            setIsSubmitting(false);
        }
    };

    const handleCommuneChange = (id: string) => {
        const commune = communes.find(c => c.id === id);
        setFormData({
            ...formData,
            communeId: id,
            zoneTarifaire: commune?.zoneTarifaire || ""
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Progress Bar */}
            <div className="relative flex justify-between">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 -z-10" />
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 -z-10 transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />
                {STEPS.map((step) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;

                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                                    isActive ? "bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-50" :
                                        isCompleted ? "bg-green-500 text-white" : "bg-white border-2 border-slate-200 text-slate-400"
                                )}
                            >
                                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest mt-2",
                                isActive ? "text-indigo-600" : "text-slate-400"
                            )}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl shadow-sm border p-8"
                >
                    {currentStep === 1 && (
                        <Step1Info
                            formData={formData}
                            setFormData={setFormData}
                            communes={communes}
                            handleCommuneChange={handleCommuneChange}
                        />
                    )}
                    {currentStep === 2 && (
                        <Step2Devices
                            formData={formData}
                            setFormData={setFormData}
                        />
                    )}
                    {currentStep === 3 && (
                        <Step3Docs
                            formData={formData}
                            setFormData={setFormData}
                        />
                    )}
                    {currentStep === 4 && (
                        <Step4Review
                            formData={formData}
                            setFormData={setFormData}
                        />
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Retour
                        </Button>
                        <Button
                            onClick={nextStep}
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-8 min-w-[140px]"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : currentStep === STEPS.length ? (
                                "Soumettre"
                            ) : (
                                <>
                                    Suivant
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function Step2Devices({ formData, setFormData }: any) {
    const calculateTotals = (newFormData: any) => {
        let total = Number(newFormData.nbTV) + Number(newFormData.nbRadio);
        let amount = 0;

        // Basic prices (Mocked from standard rates)
        amount += Number(newFormData.nbTV) * 10; // $10 per TV
        amount += Number(newFormData.nbRadio) * 5; // $5 per Radio

        // Decoders are explicitly NOT included in the fee calculation
        // according to the PRD (Annexe 1). They are for information only.

        // Apply 25% discount if total >= 51
        if (total >= 51) {
            amount = amount * 0.75;
        }

        return { total, amount };
    };

    const updateField = (field: string, value: any) => {
        const nextFormData = { ...formData, [field]: value };
        const { total, amount } = calculateTotals(nextFormData);
        setFormData({ ...nextFormData, totalAppareils: total, montantEstime: amount });
    };

    const updateDecoder = (id: string, qty: string) => {
        const nextDecoders = { ...formData.decoders, [id]: Number(qty) };
        const nextFormData = { ...formData, decoders: nextDecoders };
        const { total, amount } = calculateTotals(nextFormData);
        setFormData({ ...nextFormData, totalAppareils: total, montantEstime: amount });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <Monitor className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Étape 2 sur 4 — Vos Appareils</h3>
                    <p className="text-sm text-slate-500">Déclarez vos récepteurs et abonnements.</p>
                </div>
            </div>

            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                SECTION A — Appareils récepteurs (Base du calcul)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label>Exercice concerné *</Label>
                    <Select value={formData.exercice} onValueChange={(v: string) => updateField("exercice", v)}>
                        <SelectTrigger className="rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Nombre de téléviseurs *</Label>
                    <Input
                        type="number"
                        min="0"
                        value={formData.nbTV}
                        onChange={(e) => updateField("nbTV", e.target.value)}
                        className="rounded-xl"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Nombre de postes radio</Label>
                    <Input
                        type="number"
                        min="0"
                        value={formData.nbRadio}
                        onChange={(e) => updateField("nbRadio", e.target.value)}
                        className="rounded-xl"
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <div className="border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-indigo-600" />
                        SECTION B — Décodeurs détenus
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                        Pour mémoire : Ces données ne sont pas incluses dans le calcul de la redevance. Elles sont enregistrées à titre d'information uniquement.
                    </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                        {OPERATORS.map((op) => (
                            <div key={op.id} className="flex items-center justify-between gap-4 py-2 border-b border-indigo-100/50 last:border-0 md:[&:nth-last-child(-n+2)]:border-0 lg:[&:nth-last-child(-n+3)]:border-0">
                                <div className="space-y-0.5 min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">{op.name}</p>
                                    <p className="text-[10px] text-slate-500">Abonnement : {op.price}$ / mois</p>
                                </div>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={formData.decoders[op.id] || ""}
                                    onChange={(e) => updateDecoder(op.id, e.target.value)}
                                    className="w-20 h-8 text-center rounded-lg border-slate-200 focus:ring-indigo-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Card className="bg-slate-900 text-white overflow-hidden border-none shadow-xl">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        <div className="space-y-1">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Appareils (TV + Radio)</p>
                            <p className="text-3xl font-black">{formData.totalAppareils}</p>
                        </div>
                        <div className="w-px h-12 bg-white/10 hidden md:block" />
                        <div className="space-y-1 flex-1">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Montant Estimé</p>
                            <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                <p className="text-3xl font-black text-indigo-400">${formData.montantEstime.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                <p className="text-xs text-slate-500">USD</p>
                            </div>
                            {formData.totalAppareils >= 51 && (
                                <p className="text-[10px] text-green-400 font-bold flex items-center gap-1 justify-center md:justify-start mt-1">
                                    <Check className="w-3 h-3" />
                                    Réduction de 25% appliquée (≥ 51 appareils)
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-white/5 px-4 py-2 rounded-lg max-w-xs">
                            <Info className="w-4 h-4 shrink-0" />
                            <p>Le montant définitif sera fixé par la Direction après validation.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function Step3Docs({ formData, setFormData }: any) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.strokeStyle = "#4f46e5";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
    }, []);

    const startDrawing = (e: any) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            setFormData({ ...formData, signature: canvas.toDataURL() });
        }
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        setFormData({ ...formData, signature: null });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <FileSignature className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Étape 3 sur 4 — Signature & Documents</h3>
                    <p className="text-sm text-slate-500">Signez électroniquement pour valider votre demande.</p>
                </div>
            </div>

            <div className="space-y-4">
                <Label>Documents justificatifs (Optionnel)</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors mb-3">
                        <PlusCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Glissez vos fichiers ici</p>
                    <p className="text-xs text-slate-500 mt-1">Images ou PDF (Max 10MB)</p>
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <Label className="font-bold text-slate-900">Signature électronique *</Label>
                    <Button variant="ghost" size="sm" onClick={clearSignature} className="text-[10px] uppercase tracking-widest font-bold text-red-500">
                        Effacer
                    </Button>
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={200}
                        className="w-full h-40 cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseUp={stopDrawing}
                        onMouseMove={draw}
                        onTouchStart={startDrawing}
                        onTouchEnd={stopDrawing}
                        onTouchMove={draw}
                    />
                </div>
                <p className="text-[10px] text-slate-500 italic">
                    En signant ci-dessus, je certifie l'exactitude des informations fournies.
                </p>
            </div>
        </div>
    );
}

function Step4Review({ formData }: any) {
    const isEntreprise = formData.typePersonne.startsWith("pm");

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <Eye className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Étape 4 sur 4 — Récapitulatif</h3>
                    <p className="text-sm text-slate-500">Vérifiez vos informations avant de soumettre.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Identité</h4>
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                            <p className="text-sm font-bold text-slate-900">{formData.nomRaisonSociale}</p>
                            <p className="text-xs text-slate-500">{isEntreprise ? "Personne Morale" : "Personne Physique"}</p>
                            <p className="text-xs text-slate-500">{formData.email}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Localisation</h4>
                        <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                            <p className="text-sm font-bold text-slate-900">{formData.adresseSiege}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Zone: {formData.zoneTarifaire}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Résumé des Appareils</h4>
                    <div className="bg-slate-900 text-white rounded-xl p-6 space-y-4">
                        <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                            <span className="text-slate-400">Total Appareils (TV + Radio)</span>
                            <span className="font-bold text-lg">{formData.totalAppareils}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3" title="Déclarés à titre informatif uniquement">
                            <span className="text-slate-400">Décodeurs (Pour mémoire)</span>
                            <span className="font-bold text-lg text-slate-300">
                                {Object.values(formData.decoders as Record<string, number>).reduce((a, b) => a + b, 0)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-400 text-xs italic">Montant Estimé</span>
                            <span className="font-black text-2xl text-indigo-400">${formData.montantEstime.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        {formData.totalAppareils >= 51 && (
                            <div className="bg-green-500/10 text-green-400 text-[10px] font-bold p-2 rounded-lg text-center">
                                Réduction 25% incluse
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3">
                <Info className="w-5 h-5 text-orange-500 shrink-0" />
                <p className="text-[11px] text-orange-800 leading-relaxed">
                    <b>Note importante :</b> Cette soumission constitue une déclaration d'engagement.
                    Le montant définitif de votre redevance sera confirmé par un agent de la RTNC après vérification physique ou documentaire.
                    Vous recevrez une notification dès que votre note de taxation sera émise.
                </p>
            </div>
        </div>
    );
}

function Step1Info({ formData, setFormData, communes, handleCommuneChange }: any) {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Étape 1 sur 4 — Vos Informations</h3>
                    <p className="text-sm text-slate-500">Veuillez confirmer vos informations d'identification.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-3">
                    <Label className="text-slate-700">Type de personne *</Label>
                    <RadioGroup
                        value={formData.typePersonne}
                        onValueChange={(v: string) => setFormData({ ...formData, typePersonne: v })}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        {[
                            { id: "pp", label: "PP (Physique)", icon: User },
                            { id: "pm", label: "PM (Morale)", icon: Building2 },
                            { id: "pp_advantage", label: "PP Avantage", icon: User },
                            { id: "pm_advantage", label: "PM Avantage", icon: Building2 },
                        ].map((item) => (
                            <div key={item.id}>
                                <RadioGroupItem value={item.id} id={item.id} className="peer sr-only" />
                                <Label
                                    htmlFor={item.id}
                                    className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 transition-all cursor-pointer"
                                >
                                    <item.icon className="mb-3 w-6 h-6 text-slate-400 peer-data-[state=checked]:text-indigo-600" />
                                    <span className="text-xs font-bold text-center">{item.label}</span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label>Nom complet / Raison sociale *</Label>
                    <Input
                        placeholder="Ex: Jean Dupont ou SARL Meyllos"
                        value={formData.nomRaisonSociale}
                        onChange={(e) => setFormData({ ...formData, nomRaisonSociale: e.target.value })}
                        className="rounded-xl"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Adresse du siège d'activités *</Label>
                    <Input
                        placeholder="Numéro, Rue, Quartier"
                        value={formData.adresseSiege}
                        onChange={(e) => setFormData({ ...formData, adresseSiege: e.target.value })}
                        className="rounded-xl"
                    />
                </div>

                <div className="space-y-2 text-sm">
                    <Label>NIF (Identification Fiscale)</Label>
                    <Input
                        placeholder="Ex: 01-12345-A"
                        value={formData.nif}
                        onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                        className="rounded-xl"
                    />
                </div>

                <div className="space-y-2">
                    <Label>RCCM (Pour les PM)</Label>
                    <Input
                        placeholder="Ex: CD/KIN/RCCM/..."
                        value={formData.rccm}
                        onChange={(e) => setFormData({ ...formData, rccm: e.target.value })}
                        className="rounded-xl"
                        disabled={!formData.typePersonne.startsWith("pm")}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Commune *</Label>
                    <Select onValueChange={handleCommuneChange} value={formData.communeId}>
                        <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Sélectionner une commune" />
                        </SelectTrigger>
                        <SelectContent>
                            {communes.map((c: any) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.nom} ({c.ville})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Zone tarifaire</Label>
                    <div className="h-10 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-bold uppercase text-xs tracking-widest">
                        {formData.zoneTarifaire || "Auto-calculé"}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Téléphone principal *</Label>
                    <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="+243..."
                            value={formData.telephonePrincipal}
                            onChange={(e) => setFormData({ ...formData, telephonePrincipal: e.target.value })}
                            className="pl-10 rounded-xl"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Email de contact</Label>
                    <Input
                        placeholder="contact@exemple.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl"
                    />
                </div>
            </div>
        </div>
    );
}

// End of file
