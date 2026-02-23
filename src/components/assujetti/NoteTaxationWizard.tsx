"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MapPin, ArrowRight, ArrowLeft, CheckCircle, FileText, Calculator, Building2, AlertCircle } from "lucide-react";
import { getProvinces, getChildrenGeographies, calculateTax, saveNoteTaxation } from "@/app/actions/taxation";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function NoteTaxationWizard({ session }: { session: any }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for location
    const [provinces, setProvinces] = useState<any[]>([]);
    const [province, setProvince] = useState("");

    const [villes, setVilles] = useState<any[]>([]);
    const [ville, setVille] = useState("");

    const [communes, setCommunes] = useState<any[]>([]);
    const [commune, setCommune] = useState("");

    const [quartiers, setQuartiers] = useState<any[]>([]);
    const [quartier, setQuartier] = useState("");

    // Entity structure
    const [entityType, setEntityType] = useState("pm"); // pm, pmta, ppta

    // Derived values
    const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
    const [calcError, setCalcError] = useState<string | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // Initial load - Fetch Provinces
    useEffect(() => {
        async function loadProvinces() {
            const res = await getProvinces();
            if (res.success && res.data) {
                setProvinces(res.data);
            }
        }
        loadProvinces();
    }, []);

    // Load Villes when Province changes
    useEffect(() => {
        if (!province) {
            setVilles([]); setVille("");
            return;
        }
        async function load() {
            const res = await getChildrenGeographies(province);
            if (res.success && res.data) {
                setVilles(res.data);
                // Reset children
                setVille(""); setCommunes([]); setCommune(""); setQuartiers([]); setQuartier("");
            }
        }
        load();
    }, [province]);

    // Load Communes when Ville changes
    useEffect(() => {
        if (!ville) {
            setCommunes([]); setCommune("");
            return;
        }
        async function load() {
            const res = await getChildrenGeographies(ville);
            if (res.success && res.data) {
                setCommunes(res.data);
                setCommune(""); setQuartiers([]); setQuartier("");
            }
        }
        load();
    }, [ville]);

    // Load Quartiers when Commune changes
    useEffect(() => {
        if (!commune) {
            setQuartiers([]); setQuartier("");
            return;
        }
        async function load() {
            const res = await getChildrenGeographies(commune);
            if (res.success && res.data) {
                setQuartiers(res.data);
                setQuartier("");
            }
        }
        load();
    }, [commune]);


    // Tax Calculation Effect
    useEffect(() => {
        // We calculate when they reach step 3, so we only need commune/quartier and entityType
        if (step !== 3) return;

        // Find the lowest selected geography level ID
        const selectedGeoId = quartier || commune || ville || province;

        if (!selectedGeoId) return;

        async function doCalculate() {
            setIsCalculating(true);
            const res = await calculateTax({
                geographyId: selectedGeoId,
                entityType: entityType as any
            });
            if (res.success && res.data) {
                setEstimatedPrice(res.data.price);
                setCalcError(null);
            } else {
                setEstimatedPrice(null);
                setCalcError(res.error || "Erreur de calcul");
                console.error(res.error);
            }
            setIsCalculating(false);
        }
        doCalculate();
    }, [step, province, ville, commune, quartier, entityType]);


    const handleNext = () => setStep(s => Math.min(4, s + 1));
    const handlePrev = () => setStep(s => Math.max(1, s - 1));

    const handleSubmit = async () => {
        if (estimatedPrice === null) return;
        setIsSubmitting(true);
        const res = await saveNoteTaxation({
            montantNet: estimatedPrice,
            devise: "USD"
        });

        setIsSubmitting(false);
        if (res.success) {
            toast.success(`Note de taxation ${res.data?.numeroNote} créée avec succès.`);
            router.push('/assujetti/mes-notes');
        } else {
            toast.error(res.error || "Une erreur est survenue");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header Steps */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Nouvelle Note de Taxation</h1>
                    <p className="text-slate-500 text-sm">Étape {step} sur 4</p>
                </div>
                <div className="flex items-center gap-3">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={cn(
                            "w-8 h-1.5 rounded-full transition-all duration-500",
                            step >= s ? "bg-[#0d2870]" : "bg-slate-200"
                        )} />
                    ))}
                </div>
            </div>

            {/* Content Switcher */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 overflow-hidden min-h-[500px] flex flex-col justify-between">
                <div>
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                    <MapPin className="w-6 h-6 text-[#0d2870]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Localisation</h2>
                                    <p className="text-sm text-slate-500">Précisez l'emplacement de l'entité à taxer.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 font-semibold ml-1 text-xs uppercase tracking-wider">Province</Label>
                                        <Select value={province} onValueChange={setProvince}>
                                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-lg focus:ring-[#0d2870]">
                                                <SelectValue placeholder="Sélectionner une province" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {provinces.length > 0 ? (
                                                    provinces.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-xs text-slate-400 text-center italic">Chargement des données...</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {province && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label className="text-slate-600 font-semibold ml-1 text-xs uppercase tracking-wider">Ville / Territoire</Label>
                                            <Select value={ville} onValueChange={setVille}>
                                                <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-lg focus:ring-[#0d2870]">
                                                    <SelectValue placeholder="Sélectionner une ville" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {villes.map(v => (
                                                        <SelectItem key={v.id} value={v.id}>{v.nom}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {ville && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label className="text-slate-600 font-semibold ml-1 text-xs uppercase tracking-wider">Commune</Label>
                                            <Select value={commune} onValueChange={setCommune}>
                                                <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-lg focus:ring-[#0d2870]">
                                                    <SelectValue placeholder="Sélectionner une commune" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {communes.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {commune && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label className="text-slate-600 font-semibold ml-1 text-xs uppercase tracking-wider">Quartier (Optionnel)</Label>
                                            <Select value={quartier} onValueChange={setQuartier}>
                                                <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-lg focus:ring-[#0d2870]">
                                                    <SelectValue placeholder="Sélectionner un quartier" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {quartiers.map(q => (
                                                        <SelectItem key={q.id} value={q.id}>{q.nom}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!province && (
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                                    <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900">Données requises</p>
                                        <p className="text-xs text-amber-700/80">Veuillez sélectionner une province pour commencer.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6 text-[#0d2870]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Catégorie d'Assujetti</h2>
                                    <p className="text-sm text-slate-500">Choisissez la structure qui correspond à votre entité.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { id: "pm", title: "Personne Morale (PM)", desc: "Entreprises, sociétés, ONG sans tiré avantage" },
                                    { id: "pmta", title: "Personne Morale Tirant Avantage (PMTA)", desc: "Hôtels, restaurants, bars, chaînes TV" },
                                    { id: "ppta", title: "Personne Physique Tirant Avantage (PPTA)", desc: "Commerçants individuels, indépendants" },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setEntityType(type.id)}
                                        className={cn(
                                            "group p-6 rounded-xl border-2 text-left flex flex-col gap-4 transition-all duration-300 relative overflow-hidden",
                                            entityType === type.id
                                                ? "border-[#0d2870] bg-indigo-50/30 shadow-lg shadow-indigo-100/50"
                                                : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50"
                                        )}
                                    >
                                        {entityType === type.id && (
                                            <div className="absolute top-0 right-0 p-3">
                                                <CheckCircle className="w-5 h-5 text-[#0d2870]" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors px-2",
                                            entityType === type.id ? "bg-[#0d2870] text-white" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                                        )}>
                                            <Building2 className="w-5 h-5 shrink-0" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className={cn(
                                                "font-bold text-sm transition-colors",
                                                entityType === type.id ? "text-[#0d2870]" : "text-slate-900"
                                            )}>{type.title}</h3>
                                            <p className="text-xs text-slate-500 leading-relaxed">{type.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Calculator className="w-6 h-6 text-[#0d2870]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Estimation de la Redevance</h2>
                                    <p className="text-sm text-slate-500">Montant calculé selon les barèmes officiels.</p>
                                </div>
                            </div>

                            <div className="max-w-md mx-auto">
                                {isCalculating ? (
                                    <Card className="border-none bg-slate-50/50">
                                        <CardContent className="py-12 flex flex-col items-center justify-center gap-4 text-slate-400">
                                            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0d2870] rounded-full animate-spin" />
                                            <p className="text-sm font-bold animate-pulse">Calcul du barème...</p>
                                        </CardContent>
                                    </Card>
                                ) : estimatedPrice !== null ? (
                                    <Card className="border-none bg-[#0d2870] text-white shadow-2xl shadow-indigo-200 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                        <CardContent className="p-10 text-center space-y-6 relative z-10">
                                            <div className="space-y-1">
                                                <p className="text-indigo-200/70 text-xs font-black uppercase tracking-[0.2em]">Montant de la taxe</p>
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-5xl font-black">${estimatedPrice.toFixed(2)}</span>
                                                    <span className="text-xl font-bold text-indigo-300/80 mt-4">USD</span>
                                                </div>
                                            </div>

                                            <Separator className="bg-white/10" />

                                            <div className="flex items-center justify-center gap-3 text-sm text-indigo-100/70">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Conforme aux barèmes de la province</span>
                                            </div>
                                        </CardContent>
                                        <div className="bg-black/10 px-6 py-3 text-center border-t border-white/5">
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Document officiel d'imposition</p>
                                        </div>
                                    </Card>
                                ) : (
                                    <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-xl">
                                        <CardContent className="py-12 text-center space-y-4">
                                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                                                <AlertCircle className="w-6 h-6 text-amber-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-900">Information de taxation indisponible</p>
                                                <p className="text-xs text-slate-500 leading-relaxed px-4">
                                                    {calcError || "Nous n'avons pas pu trouver de règle de taxation pour cette sélection."}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-tighter">Veuillez vérifier vos sélections aux étapes précédentes.</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Récapitulatif & Soumission</h2>
                                    <p className="text-sm text-slate-500">Vérifiez vos informations avant de confirmer.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Emplacement</p>
                                            <p className="text-sm font-bold text-slate-700 whitespace-pre-line leading-relaxed">
                                                {[
                                                    provinces.find(p => p.id === province)?.nom,
                                                    villes.find(v => v.id === ville)?.nom,
                                                    communes.find(c => c.id === commune)?.nom,
                                                    quartier ? quartiers.find(q => q.id === quartier)?.nom : null
                                                ].filter(Boolean).join(" \n ")}
                                            </p>
                                        </div>
                                        <Separator className="bg-slate-200" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catégorie</p>
                                            <p className="text-sm font-bold text-slate-700 uppercase">
                                                {entityType === "pm" ? "Personne Morale" : entityType === "pmta" ? "Personne Morale TA" : "Personne Physique TA"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center">
                                    <Card className="border-none bg-emerald-50 shadow-none rounded-xl overflow-hidden">
                                        <CardContent className="p-8 text-center space-y-2">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Net à Payer</p>
                                            <p className="text-5xl font-black text-emerald-700">${estimatedPrice?.toFixed(2) || '0.00'}</p>
                                            <p className="text-xs font-bold text-emerald-600/70 uppercase">USD</p>
                                        </CardContent>
                                        <div className="bg-emerald-100/50 py-3 text-center">
                                            <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-tighter">Prêt pour soumission</p>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Navigation Footer */}
                <div className="flex justify-between mt-10 border-t border-slate-100 pt-8">
                    <button
                        onClick={handlePrev}
                        disabled={step === 1 || isSubmitting}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Précédent
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            disabled={(step === 1 && !province) || (step === 2 && !entityType) || (step === 3 && estimatedPrice === null)}
                            className="flex items-center gap-2 px-8 py-3 bg-[#0d2870] hover:bg-[#0a1e54] text-white rounded-lg text-sm font-bold transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        >
                            Continuer <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || estimatedPrice === null}
                            className="flex items-center gap-2 px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-xl shadow-emerald-200 hover:shadow-emerald-300 disabled:opacity-50 transform hover:-translate-y-0.5"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Confirmer & Soumettre
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
