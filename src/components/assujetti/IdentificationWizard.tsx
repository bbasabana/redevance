"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin, Building2, FileText, CheckCircle, ArrowRight, ArrowLeft,
    Calculator, Radio, Tv, Hotel, Utensils, Beer, Monitor,
    Smartphone, Search, Loader2, AlertCircle, Building, Globe, Zap, Map, Banknote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CountUp from "react-countup";
import { getProvinces, getChildrenGeographies, completeIdentification } from "@/app/actions/taxation";
import { saveIdentificationStep } from "@/app/actions/onboarding";
import dynamic from "next/dynamic";
import MapSlideOver from "./MapSlideOver";
import { TaxationQRCode } from "./TaxationQRCode";

const PDFDownloadButton = dynamic(
    () => import("./PDFDownloadButton"),
    { ssr: false, loading: () => <button className="flex items-center gap-2 px-6 py-3 bg-slate-900/50 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-wait">Chargement PDF...</button> }
);



const steps = [
    { id: 1, title: "Localisation", icon: MapPin, desc: "Où se situe votre entité ?" },
    { id: 2, title: "Identification", icon: Building2, desc: "Détails de votre structure" },
    { id: 3, title: "Détention", icon: Radio, desc: "Appareils audiovisuels" },
    { id: 4, title: "Note de Taxation", icon: FileText, desc: "Aperçu de votre redevance" },
];

const activityOptions = [
    { id: "hotel", label: "Hôtel", icon: Hotel },
    { id: "restaurant", label: "Restaurant", icon: Utensils },
    { id: "bar", label: "Bar", icon: Beer },
    { id: "lounge", label: "Lounge Bar", icon: Smartphone },
    { id: "paris_sportifs", label: "Paris Sportifs", icon: Search },
    { id: "flat", label: "Flat / Guest House", icon: Building },
    { id: "chaine_tv", label: "Chaîne Télé / Radio", icon: Monitor },
    { id: "autre", label: "Autre", icon: CheckCircle },
];

export default function IdentificationWizard({ session, assujetti, progress }: { session: any, assujetti?: any, progress?: any }) {
    const router = useRouter();
    const initialStep = progress?.lastStep ? (progress.lastStep >= 3 ? 3 : progress.lastStep + 1) : 1;
    const [step, setStep] = useState(initialStep);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfiguringDashboard, setIsConfiguringDashboard] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);

    const assujettiNif = assujetti?.nif || "";
    const assujettiRccm = assujetti?.rccm || "";
    const assujettiIdNat = assujetti?.idNat || "";

    // --- STEP 1: Localisation ---
    const [provinces, setProvinces] = useState<any[]>([]);
    const [province, setProvince] = useState(progress?.step1Data?.province || "");
    const [villes, setVilles] = useState<any[]>([]);
    const [ville, setVille] = useState(progress?.step1Data?.ville || "");
    const [cites, setCites] = useState<any[]>([]);
    const [cite, setCite] = useState(progress?.step1Data?.cite || "");
    const [communes, setCommunes] = useState<any[]>([]);
    const [commune, setCommune] = useState(progress?.step1Data?.commune || "");
    const [quartiers, setQuartiers] = useState<any[]>([]);
    const [quartier, setQuartier] = useState(progress?.step1Data?.quartier || "");
    const [adressePhysique, setAdressePhysique] = useState(progress?.step1Data?.adressePhysique || assujetti?.adresseSiege || "");
    const [adresseLat, setAdresseLat] = useState<number | undefined>(progress?.step1Data?.adresseLat);
    const [adresseLng, setAdresseLng] = useState<number | undefined>(progress?.step1Data?.adresseLng);

    // Detect if selected province is a ville-province (like Kinshasa)
    // A ville-province has no intermediate VILLE/CITE level — communes load directly from province
    const [isVilleProvince, setIsVilleProvince] = useState(false);

    // --- STEP 2: Identification ---
    const [structure, setStructure] = useState<"societe" | "etablissement" | "asbl" | "autre">(progress?.step2Data?.structure || "societe");
    const [activities, setActivities] = useState<string[]>(progress?.step2Data?.activities || []);
    const [autreActivite, setAutreActivite] = useState(progress?.step2Data?.autreActivite || "");
    const [representant, setRepresentant] = useState(progress?.step2Data?.representant || assujetti?.representantLegal || session.user.nomPrenom || "");
    const [email, setEmail] = useState(progress?.step2Data?.email || assujetti?.email || session.user.email || "");
    const [telephone, setTelephone] = useState(progress?.step2Data?.telephone || assujetti?.telephonePrincipal || session.user.telephone || "");
    const [entityInfo, setEntityInfo] = useState({
        nom: progress?.step2Data?.entityInfo?.nom || assujetti?.nomRaisonSociale || session.user.nomPrenom || "",
        rccm: progress?.step2Data?.entityInfo?.rccm || assujettiRccm,
        numeroImpot: progress?.step2Data?.entityInfo?.numeroImpot || assujettiNif,
        idNat: progress?.step2Data?.entityInfo?.idNat || assujettiIdNat
    });

    const isNifValidFormat = (val: string) => /^[A-Z]\d{7,9}$/.test(val);
    const isRccmValidFormat = (val: string) => /^[A-Z]{2}\/[A-Z0-9\s'’-]+(\/[A-Z0-9\s'’-]+)?\/RCCM:\d{2}-[A-Z]-\d{4,6}$/.test(val);
    const isIdNatValidFormat = (val: string) => /^[0-9]{1,2}-[0-9]{2}-[A-Z]\s?[0-9]{5}\s?[A-Z]$/.test(val);

    // Initial check to see if we should lock fields that came from DB and are valid
    // We only lock if they came from `assujetti` prop AND are valid.
    const [lockedFields, setLockedFields] = useState({
        numeroImpot: !!assujettiNif && isNifValidFormat(assujettiNif),
        rccm: !!assujettiRccm && isRccmValidFormat(assujettiRccm),
        idNat: !!assujettiIdNat && isIdNatValidFormat(assujettiIdNat),
    });

    // --- STEP 3: Détention ---
    const [nbTv, setNbTv] = useState<number>(progress?.step3Data?.nbTv || 0);
    const [nbRadio, setNbRadio] = useState<number>(progress?.step3Data?.nbRadio || 0);

    // --- STEP 4: Note Result ---
    const [previewData, setPreviewData] = useState<any>(null);

    // Initial Load & Anti-Return Lock
    useEffect(() => {
        getProvinces().then(res => {
            if (res.success) setProvinces(res.data || []);
        });

        // Anti-Return Lock (PopState Interception)
        const handlePopState = (e: PopStateEvent) => {
            if (step < 4) {
                // Prevent going back by pushing the same state again
                window.history.pushState(null, "", window.location.href);
                toast.warning("Navigation bloquée", {
                    description: "Veuillez utiliser les boutons 'Précédent' et 'Continuer' du formulaire pour naviguer entre les étapes."
                });
            }
        };

        // Initialize state for 'popstate' to work correctly
        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [step]);

    // Load Villes & Cités based on Province - also detect if ville-province (direct communes)
    useEffect(() => {
        if (province) {
            setVille("");
            setCite("");
            setCommune("");
            setQuartier("");
            setIsVilleProvince(false);
            getChildrenGeographies(province).then(res => {
                if (res.success) {
                    const data = res.data || [];
                    const villeChildren = data.filter(g => g.type === "VILLE");
                    const citeChildren = data.filter(g => g.type === "CITE" || g.type === "TERRITOIRE");
                    const communeChildren = data.filter(g => g.type === "COMMUNE");

                    if (communeChildren.length > 0 && villeChildren.length === 0 && citeChildren.length === 0) {
                        // Ville-province: communes are direct children of province
                        setIsVilleProvince(true);
                        setCommunes(communeChildren);
                    } else {
                        setVilles(villeChildren);
                        setCites(citeChildren);
                    }
                }
            });
        }
    }, [province]);

    // Load Communes based on Ville or Cité
    useEffect(() => {
        const parentId = ville || cite;
        if (parentId) {
            setCommune("");
            getChildrenGeographies(parentId).then(res => {
                if (res.success) setCommunes(res.data || []);
            });
        }
    }, [ville, cite]);

    // Load Quartiers based on Commune
    useEffect(() => {
        if (commune) {
            setQuartier("");
            getChildrenGeographies(commune).then(res => {
                if (res.success) setQuartiers(res.data || []);
            });
        }
    }, [commune]);

    const handlePrev = () => setStep((prev: number) => prev - 1);
    const handleNext = async () => {
        setIsSubmitting(true);
        try {
            if (step === 1) {
                // About to enter Step 2
                // Check if any fields came from DB but had INVALID formats. If so, warn the user they need to correct them.
                const warnings: string[] = [];
                if (assujettiNif && !lockedFields.numeroImpot) warnings.push("Numéro Impôt (NIF)");
                if (assujettiRccm && !lockedFields.rccm) warnings.push("RCCM");
                if (assujettiIdNat && !lockedFields.idNat) warnings.push("ID National (Id. Nat)");

                if (warnings.length > 0) {
                    toast.warning("Corrections requises", {
                        description: `Certaines données de votre compte (${warnings.join(', ')}) étaient mal formatées. Veuillez les corriger.`
                    });
                }

                await saveIdentificationStep(session.user.id, 1, {
                    province, ville, cite, commune, quartier, adressePhysique, adresseLat, adresseLng
                });

            } else if (step === 2) {
                if (activities.length === 0) {
                    toast.error("Veuillez sélectionner au moins une activité.");
                    return;
                }
                if (activities.includes("autre") && !autreActivite.trim()) {
                    toast.error("Veuillez préciser votre activité dans le champ 'Autre'.");
                    return;
                }
                if (!entityInfo.idNat.trim() || !isIdNatValidFormat(entityInfo.idNat)) {
                    toast.error("L'Identification Nationale (Id. Nat) est obligatoire et doit être au format valide.", { className: "text-red-500" });
                    return;
                }
                await saveIdentificationStep(session.user.id, 2, {
                    structure, activities, autreActivite, representant, email, telephone, entityInfo
                });
            } else if (step === 3) {
                await saveIdentificationStep(session.user.id, 3, {
                    nbTv, nbRadio
                });
            }

            setStep((prev: number) => prev + 1);
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde de l'étape.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMapConfirm = (addr: string, lat?: number, lng?: number) => {
        setAdressePhysique(addr);
        if (lat !== undefined) setAdresseLat(lat);
        if (lng !== undefined) setAdresseLng(lng);
        toast.success("Position GPS confirmée !", {
            description: "Votre localisation a été bien enregistrée. Vous pouvez continuer."
        });
    };

    const toggleActivity = (id: string) => {
        setActivities((prev: string[]) => {
            if (prev.includes(id)) return prev.filter(a => a !== id);

            if (id === "autre") {
                // If selecting 'autre', we clear all specific activities
                if (prev.length > 0) {
                    toast.info("L'option 'Autre' a été sélectionnée, les activités spécifiques ont été retirées.");
                }
                return ["autre"];
            } else {
                // If selecting a specific activity, we clear 'autre' if it was selected
                const filtered = prev.filter(a => a !== "autre");
                if (prev.includes("autre")) {
                    toast.info("Une activité spécifique a été choisie, l'option 'Autre' a été retirée.");
                }

                if (filtered.length >= 3) {
                    toast.warning("Maximum 3 activités recommandées");
                    return filtered;
                }
                return [...filtered, id];
            }
        });
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Determine the most specific valid geography ID available
            let finalGeographyId = "";
            if (quartier && quartier !== "indisponible") finalGeographyId = quartier;
            else if (commune && commune !== "indisponible") finalGeographyId = commune;
            else if (cite && cite !== "indisponible") finalGeographyId = cite;
            else if (ville && ville !== "indisponible") finalGeographyId = ville;
            else if (province && province !== "indisponible") finalGeographyId = province;

            const res = await completeIdentification({
                geographyId: finalGeographyId,
                structure,
                activities,
                autreActivite,
                representant,
                nbTv,
                nbRadio,
                numeroImpot: entityInfo.numeroImpot,
                rccm: entityInfo.rccm,
                idNat: entityInfo.idNat,
                adressePhysique,
                email,
                telephone,
            });

            if (res.success && res.data) {
                setPreviewData(res.data);
                // Wait small delay for the powerful animation effect
                setTimeout(() => {
                    setIsSubmitting(false);
                    setStep(4);
                }, 2500); // Slightly longer for the "calculating" feel
            } else {
                if ('alreadyCompleted' in res && res.alreadyCompleted) {
                    toast.info("Identification déjà complétée. Redirection en cours...", { duration: 3000 });
                    setTimeout(() => {
                        window.location.href = "/assujetti/dashboard";
                    }, 1500);
                } else {
                    toast.error(res.error || "Une erreur est survenue lors de la finalisation.");
                    setIsSubmitting(false);
                }
            }
        } catch (error) {
            toast.error("Erreur de connexion.");
            setIsSubmitting(false);
        }
    };

    const handleDashboardRedirect = (path: string) => {
        setIsConfiguringDashboard(true);
        setTimeout(() => {
            router.replace(path);
        }, 1800);
    };

    return (
        <>
            <div className="flex flex-col h-full max-w-4xl mx-auto space-y-2">
                {/* Stepper Header - Hidden on Step 4 */}
                {step < 4 && (
                    <>
                        <div className="flex-none flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto gap-4">
                            {steps.map((s, idx) => (
                                <div key={s.id} className="flex items-center">
                                    <div className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
                                        step >= s.id ? "bg-[#0d2870] text-white" : "bg-slate-200 text-slate-400"
                                    )}>
                                        {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={cn("w-6 h-0.5 mx-1", step > s.id ? "bg-[#0d2870]" : "bg-slate-200")} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="text-center flex-none">
                            <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{steps[step - 1].title}</h2>
                            <p className="hidden sm:block text-[10px] text-slate-500 font-medium">{steps[step - 1].desc}</p>
                        </div>
                    </>
                )}

                {/* Content Area - Scrollable if needed, but intended to be fixed */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {/* STEP 1: LOCALISATION */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Province */}
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Province</Label>
                                            <Select value={province} onValueChange={setProvince}>
                                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-lg text-sm">
                                                    <SelectValue placeholder="Sélectionner une province" />
                                                </SelectTrigger>
                                                <SelectContent position="popper" className="max-h-[300px]">
                                                    {provinces.length > 0 ? (
                                                        provinces.map(p => <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>)
                                                    ) : (
                                                        <SelectItem value="indisponible" className="text-slate-500 italic">Indisponible (à configurer)</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Ville / Cité — hidden for ville-province */}
                                        {!isVilleProvince && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ville</Label>
                                                    <Select
                                                        value={ville}
                                                        onValueChange={(v) => { setVille(v); setCite(""); }}
                                                        disabled={!province || !!cite}
                                                    >
                                                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-lg text-sm">
                                                            <SelectValue placeholder="Ville" />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper" className="max-h-[300px]">
                                                            {villes.length > 0 ? (
                                                                villes.map(v => <SelectItem key={v.id} value={v.id}>{v.nom}</SelectItem>)
                                                            ) : (
                                                                <SelectItem value="indisponible" className="text-slate-500 italic">Indisponible (à configurer)</SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cité / Ter.</Label>
                                                    <Select
                                                        value={cite}
                                                        onValueChange={(v) => { setCite(v); setVille(""); }}
                                                        disabled={!province || !!ville}
                                                    >
                                                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-lg text-sm">
                                                            <SelectValue placeholder="Cité / Terr." />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper" className="max-h-[300px]">
                                                            {cites.length > 0 ? (
                                                                cites.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)
                                                            ) : (
                                                                <SelectItem value="indisponible" className="text-slate-500 italic">Indisponible (à configurer)</SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}

                                        {/* Commune & Quartier */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Commune</Label>
                                                <Select value={commune} onValueChange={setCommune} disabled={!isVilleProvince && !ville && !cite}>
                                                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-lg text-sm">
                                                        <SelectValue placeholder="Sélectionner une commune" />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper" className="max-h-[300px]">
                                                        {communes.length > 0 ? (
                                                            communes.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)
                                                        ) : (
                                                            <SelectItem value="indisponible" className="text-slate-500 italic">Indisponible (à configurer)</SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quartier</Label>
                                                <Select value={quartier} onValueChange={setQuartier} disabled={!commune}>
                                                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-lg text-sm">
                                                        <SelectValue placeholder="Sélectionner un quartier" />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper" className="max-h-[300px]">
                                                        {quartiers.length > 0 ? (
                                                            quartiers.map(q => <SelectItem key={q.id} value={q.id}>{q.nom}</SelectItem>)
                                                        ) : (
                                                            <SelectItem value="indisponible" className="text-slate-500 italic">Indisponible (à configurer)</SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Adresse Physique with Map Button */}
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Adresse Physique Précise</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    placeholder="Ex: 12, av. du Commerce, Quartier..."
                                                    value={adressePhysique}
                                                    onChange={e => setAdressePhysique(e.target.value)}
                                                    className="h-11 bg-slate-50 border-slate-200 rounded-lg text-sm flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setIsMapOpen(true)}
                                                    className="h-11 w-11 shrink-0 rounded-lg bg-[#0d2870]/10 border border-[#0d2870]/20 flex items-center justify-center text-[#0d2870] hover:bg-[#0d2870] hover:text-white transition-all"
                                                    title="Ouvrir la carte"
                                                >
                                                    <Map className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: IDENTIFICATION */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Structure</Label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {["societe", "etablissement", "asbl", "autre"].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setStructure(s as any)}
                                                        className={cn(
                                                            "h-10 border-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all",
                                                            structure === s ? "border-[#0d2870] bg-indigo-50 text-[#0d2870]" : "border-slate-100 text-slate-500 hover:border-slate-200"
                                                        )}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Dénomination / Raison Sociale</Label>
                                                <Input disabled value={entityInfo.nom} className="h-11 bg-slate-100 border-none rounded-xl font-bold text-slate-700 text-sm" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email de Contact</Label>
                                                    <Input placeholder="email@exemple.com" value={email} onChange={e => setEmail(e.target.value)} className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Téléphone Principal</Label>
                                                    <Input placeholder="+243..." value={telephone} onChange={e => setTelephone(e.target.value)} className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom du Représentant / Gérant</Label>
                                                <Input disabled value={representant} className="h-11 bg-slate-100 border-none rounded-xl font-bold text-slate-700 text-sm" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Numéro Impôt (NIF)</Label>
                                                    <Input
                                                        disabled={lockedFields.numeroImpot}
                                                        placeholder="Ex: A1006563"
                                                        value={entityInfo.numeroImpot}
                                                        onChange={e => setEntityInfo({ ...entityInfo, numeroImpot: e.target.value.toUpperCase() })}
                                                        className={cn("h-11 bg-slate-50 border-slate-200 rounded-xl text-sm transition-all",
                                                            lockedFields.numeroImpot && "bg-slate-100 border-none text-slate-700 font-bold",
                                                            entityInfo.numeroImpot && !lockedFields.numeroImpot && !isNifValidFormat(entityInfo.numeroImpot) && "border-red-500 bg-red-50 text-red-900 focus-visible:ring-red-500"
                                                        )}
                                                    />
                                                    {entityInfo.numeroImpot && !lockedFields.numeroImpot && !isNifValidFormat(entityInfo.numeroImpot) && (
                                                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] text-red-500 font-black uppercase tracking-tight ml-1 leading-tight">
                                                            A-Z suivi de 7 à 9 chiffres. Ex: A1006563
                                                        </motion.p>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">RCCM</Label>
                                                    <Input
                                                        disabled={lockedFields.rccm}
                                                        placeholder="Ex: CD/TRICOM/L'SHI/RCCM:14-B-1561"
                                                        value={entityInfo.rccm}
                                                        onChange={e => setEntityInfo({ ...entityInfo, rccm: e.target.value.toUpperCase() })}
                                                        className={cn("h-11 bg-slate-50 border-slate-200 rounded-xl text-sm transition-all",
                                                            lockedFields.rccm && "bg-slate-100 border-none text-slate-700 font-bold",
                                                            entityInfo.rccm && !lockedFields.rccm && !isRccmValidFormat(entityInfo.rccm) && "border-red-500 bg-red-50 text-red-900 focus-visible:ring-red-500"
                                                        )}
                                                    />
                                                    {entityInfo.rccm && !lockedFields.rccm && !isRccmValidFormat(entityInfo.rccm) && (
                                                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] text-red-500 font-black uppercase tracking-tight ml-1 leading-tight">
                                                            Format invalide. Ex: CD/KIN/RCCM:14-B-1561
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic">Identification Nationale (Id. Nat) <span className="text-red-500">*</span></Label>
                                                <Input
                                                    disabled={lockedFields.idNat}
                                                    placeholder="Ex: 6-83-N 85264 K"
                                                    value={entityInfo.idNat}
                                                    onChange={e => setEntityInfo({ ...entityInfo, idNat: e.target.value.toUpperCase() })}
                                                    className={cn("h-11 bg-slate-50 border-slate-200 rounded-xl text-sm transition-all",
                                                        lockedFields.idNat && "bg-slate-100 border-none text-slate-700 font-bold",
                                                        entityInfo.idNat && !lockedFields.idNat && !isIdNatValidFormat(entityInfo.idNat) && "border-red-500 bg-red-50 text-red-900 focus-visible:ring-red-500"
                                                    )}
                                                />
                                                {entityInfo.idNat && !lockedFields.idNat && !isIdNatValidFormat(entityInfo.idNat) && (
                                                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] text-red-500 font-black uppercase tracking-tight ml-1 leading-tight">
                                                        Format invalide. Ex: 6-83-N 85264 K
                                                    </motion.p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Activités Principales (Max 3)</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {activityOptions.map(act => {
                                                const Icon = act.icon;
                                                const isSelected = activities.includes(act.id);
                                                return (
                                                    <button
                                                        key={act.id}
                                                        onClick={() => toggleActivity(act.id)}
                                                        className={cn(
                                                            "flex items-center gap-3 p-2 rounded-xl border-2 transition-all hover:border-slate-300",
                                                            isSelected ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 text-slate-600"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                            isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                                                        )}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase truncate">{act.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {activities.includes("autre") && (
                                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-1.5 p-3 rounded-xl bg-blue-50 border border-blue-100">
                                                <Label className="text-[10px] font-black uppercase text-blue-700 ml-1">Précisez votre activité</Label>
                                                <Input
                                                    placeholder="Décrivez votre activité ici..."
                                                    value={autreActivite}
                                                    onChange={e => setAutreActivite(e.target.value)}
                                                    className="h-10 rounded-xl border-blue-200 bg-white text-sm"
                                                />
                                                <p className="text-[9px] text-blue-600 font-bold italic px-1">Si vous ne trouvez pas votre activité dans la liste, veuillez la préciser ici.</p>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: DÉTENTION */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                                        <div className="group space-y-3 p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 hover:border-[#0d2870]/20 transition-all text-center">
                                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                                <Tv className="w-7 h-7 text-[#0d2870]" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h3 className="font-black text-base text-slate-900 uppercase tracking-tight">Téléviseurs</h3>
                                                <p className="text-xs text-slate-500 font-medium">Nombre de postes TV</p>
                                            </div>
                                            <div className="flex items-center justify-center gap-4 mt-3">
                                                <button onClick={() => setNbTv(Math.max(0, nbTv - 1))} className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-sm">-</button>
                                                <span className="text-3xl font-black text-[#0d2870] min-w-[2.5rem]">{nbTv}</span>
                                                <button onClick={() => setNbTv(nbTv + 1)} className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-sm">+</button>
                                            </div>
                                        </div>

                                        <div className="group space-y-3 p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 hover:border-[#0d2870]/20 transition-all text-center">
                                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                                <Radio className="w-7 h-7 text-[#0d2870]" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h3 className="font-black text-base text-slate-900 uppercase tracking-tight">Radios</h3>
                                                <p className="text-xs text-slate-500 font-medium">Nombre de postes Radio</p>
                                            </div>
                                            <div className="flex items-center justify-center gap-4 mt-3">
                                                <button onClick={() => setNbRadio(Math.max(0, nbRadio - 1))} className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-sm">-</button>
                                                <span className="text-3xl font-black text-[#0d2870] min-w-[2.5rem]">{nbRadio}</span>
                                                <button onClick={() => setNbRadio(nbRadio + 1)} className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-sm">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: NOTE DE TAXATION PREVIEW */}
                            {step === 4 && previewData && (
                                <div className="space-y-3 max-w-4xl mx-auto flex flex-col">
                                    {/* Title row */}
                                    <div className="flex justify-between items-center shrink-0">
                                        <h2 className="text-lg font-black text-slate-900 leading-tight">Aperçu <span className="text-[#0d2870]">Note de Taxation</span></h2>
                                        <Suspense fallback={<div>...</div>}>
                                            <PDFDownloadButton data={previewData} entityName={entityInfo.nom} />
                                        </Suspense>
                                    </div>

                                    {/* ── Compact Summary Card ── */}
                                    <Card className="border border-slate-200 shadow-lg rounded-2xl overflow-hidden bg-white flex flex-col">
                                        {/* Dark header */}
                                        <div className="bg-[#0d2870] p-5 text-white relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                            <div className="relative z-10 flex justify-between items-start">
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-[0.15em] text-indigo-300 mb-1">RTNC — Redevance Audiovisuelle</p>
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 rounded-full border border-emerald-400/30 mb-2">
                                                        <Zap className="w-2.5 h-2.5 text-emerald-400" />
                                                        <span className="text-[8px] font-black uppercase tracking-wider text-emerald-300">ID Fiscal Généré</span>
                                                    </div>
                                                    <p className="text-3xl font-black tracking-tighter">{previewData.identifiantFiscal}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block text-[9px] px-2.5 py-1 bg-emerald-500 rounded-full font-black text-white uppercase mb-2">Enrôlé</span>
                                                    <p className="text-[9px] text-indigo-200">Exercice {new Date().getFullYear()}</p>
                                                    <p className="text-[9px] text-indigo-300 uppercase font-bold">CLASSIFICATION {previewData.sousType}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Summary body */}
                                        <div className="p-5 space-y-4">
                                            {/* Entity row */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Raison Sociale</p>
                                                    <p className="text-sm font-black text-slate-900 truncate">{entityInfo.nom}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Représentant</p>
                                                    <p className="text-sm font-black text-slate-900 truncate">{previewData.representant}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Localisation</p>
                                                    <p className="text-xs font-medium text-slate-600 truncate">
                                                        {[previewData.location.commune, previewData.location.ville, previewData.location.province].filter(Boolean).join(", ")}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Secteur</p>
                                                    <p className="text-xs font-medium text-slate-600 truncate">{activities.map(a => activityOptions.find(o => o.id === a)?.label).join(", ")}</p>
                                                </div>
                                            </div>

                                            {/* Totals */}
                                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total (USD)</p>
                                                    <p className="text-lg font-black text-slate-900">${previewData.totalUSD?.toFixed(2) ?? "—"}</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-[#0d2870]/5 border border-[#0d2870]/10 text-right">
                                                    <p className="text-[8px] font-black text-[#0d2870] uppercase tracking-widest mb-0.5">Total à Payer (FC)</p>
                                                    <p className="text-lg font-black text-[#0d2870]">
                                                        <CountUp end={previewData.totalFC} separator=" " duration={2.5} /> FC
                                                    </p>
                                                </div>
                                            </div>

                                            {/* See more button */}
                                            <button
                                                onClick={() => setDetailOpen(true)}
                                                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest hover:border-[#0d2870] hover:text-[#0d2870] hover:bg-[#0d2870]/5 transition-all flex items-center justify-center gap-2"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Voir le détail complet de la note
                                            </button>
                                        </div>

                                        {/* Footer */}
                                        <div className="bg-emerald-500 p-2 text-center shrink-0">
                                            <p className="text-[8px] font-black text-white uppercase tracking-[0.15em]">Note Certifiée — RTNC RDC</p>
                                        </div>
                                    </Card>

                                    {/* ── Detail Slide-Over ── */}
                                    <AnimatePresence>
                                        {detailOpen && (
                                            <>
                                                {/* Backdrop */}
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    onClick={() => setDetailOpen(false)}
                                                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                                                />
                                                {/* Panel */}
                                                <motion.div
                                                    initial={{ x: "100%" }}
                                                    animate={{ x: 0 }}
                                                    exit={{ x: "100%" }}
                                                    transition={{ type: "spring", damping: 28, stiffness: 280 }}
                                                    className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden"
                                                >
                                                    {/* Panel header */}
                                                    <div className="bg-[#0d2870] p-5 text-white shrink-0">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-300">Note de Taxation Complète</p>
                                                                <p className="text-xl font-black tracking-tight mt-1">{previewData.identifiantFiscal}</p>
                                                            </div>
                                                            <button onClick={() => setDetailOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white text-lg font-bold">×</button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 bg-white/5 rounded-xl p-3 border border-white/10 text-xs">
                                                            <div>
                                                                <p className="text-[7px] text-indigo-300 uppercase font-black tracking-widest mb-0.5">Raison Sociale</p>
                                                                <p className="font-bold truncate">{entityInfo.nom}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[7px] text-indigo-300 uppercase font-black tracking-widest mb-0.5">Représentant</p>
                                                                <p className="font-bold truncate">{previewData.representant}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[7px] text-indigo-300 uppercase font-black tracking-widest mb-0.5">Structure</p>
                                                                <p className="font-bold uppercase">{structure} · {previewData.sousType}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[7px] text-indigo-300 uppercase font-black tracking-widest mb-0.5">Exercice</p>
                                                                <p className="font-bold">{new Date().getFullYear()}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Panel scrollable body */}
                                                    <div className="flex-grow overflow-y-auto p-5 space-y-5">
                                                        {/* Identifiants */}
                                                        <div>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Identifiants Officiels</p>
                                                            <div className="space-y-1.5">
                                                                {[
                                                                    { label: "NIF", value: previewData.nif || entityInfo.numeroImpot || "—" },
                                                                    { label: "RCCM", value: previewData.rccm || entityInfo.rccm || "—" },
                                                                    { label: "Id. Nat.", value: previewData.idNat || entityInfo.idNat || "—" },
                                                                ].map(({ label, value }) => (
                                                                    <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50">
                                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
                                                                        <span className="text-xs font-black text-slate-800 text-right max-w-[60%] break-words">{value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Localisation */}
                                                        <div>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Localisation</p>
                                                            <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs">
                                                                {[
                                                                    { label: "Quartier", value: previewData.location.quartier },
                                                                    { label: "Commune", value: previewData.location.commune },
                                                                    { label: "Ville", value: previewData.location.ville },
                                                                    { label: "Province", value: previewData.location.province },
                                                                    { label: "Adresse", value: previewData.adresse },
                                                                ].filter(r => r.value).map(({ label, value }) => (
                                                                    <div key={label} className="flex gap-3">
                                                                        <span className="text-slate-400 font-bold uppercase text-[9px] w-16 shrink-0">{label}</span>
                                                                        <span className="font-black text-slate-700 leading-tight">{value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Tableau taxation */}
                                                        <div>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Calcul de la Redevance</p>
                                                                {previewData.qrData && <TaxationQRCode data={previewData.qrData} size={40} />}
                                                            </div>
                                                            <div className="border border-slate-100 rounded-xl overflow-hidden">
                                                                <table className="w-full text-xs">
                                                                    <thead className="bg-slate-50">
                                                                        <tr>
                                                                            <th className="text-left px-3 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Élément</th>
                                                                            <th className="text-center px-3 py-2 text-[8px] font-black text-slate-400 uppercase">Qté</th>
                                                                            <th className="text-center px-3 py-2 text-[8px] font-black text-slate-400 uppercase">PU</th>
                                                                            <th className="text-right px-3 py-2 text-[8px] font-black text-slate-400 uppercase">Total</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-50">
                                                                        {previewData.items.map((item: any) => (
                                                                            <tr key={item.label}>
                                                                                <td className="px-3 py-3 font-black text-slate-800 uppercase tracking-tight text-[10px]">{item.label}</td>
                                                                                <td className="px-3 py-3 text-center font-bold text-slate-600">{item.qty}</td>
                                                                                <td className="px-3 py-3 text-center font-bold text-slate-600">${item.pu}</td>
                                                                                <td className="px-3 py-3 text-right font-black text-slate-900">${(item.qty * item.pu).toFixed(2)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>

                                                        {/* Totaux */}
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Taux du Jour</span>
                                                                <span className="text-sm font-black text-slate-800">1 USD = {previewData.rate} FC</span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total USD</span>
                                                                <span className="text-sm font-black text-slate-800">${previewData.totalUSD?.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-4 bg-[#0d2870]/5 rounded-xl border border-[#0d2870]/10">
                                                                <span className="text-[9px] font-black text-[#0d2870] uppercase tracking-widest">Total à Payer</span>
                                                                <span className="text-xl font-black text-[#0d2870]">
                                                                    <CountUp end={previewData.totalFC} separator=" " duration={1.5} /> FC
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Actions rapides in Slide-over */}
                                                        <div className="grid grid-cols-1 gap-2 pt-2">
                                                            <button
                                                                onClick={() => handleDashboardRedirect("/assujetti/redevance/paiement")}
                                                                className="w-full h-11 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                                                            >
                                                                <Banknote className="w-4 h-4" /> Payer ma redevance
                                                            </button>
                                                            <button
                                                                onClick={() => handleDashboardRedirect("/assujetti/dashboard")}
                                                                className="w-full h-11 bg-[#0d2870] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#081B4B] transition-all flex items-center justify-center gap-2 shadow-sm"
                                                            >
                                                                Aller au Tableau de Bord <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="bg-emerald-500 p-3 text-center shrink-0">
                                                        <p className="text-[8px] font-black text-white uppercase tracking-[0.15em]">Note Certifiée par le Système de Redevance RTNC — RDC</p>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}


                        </motion.div>
                    </AnimatePresence >

                    {/* Patienter/Loader Modal */}
                    <AnimatePresence>
                        {
                            (isSubmitting || isConfiguringDashboard) && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d2870]/10 backdrop-blur-xl"
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        className="bg-white p-10 rounded-[30px] shadow-2xl text-center space-y-6 max-w-xs w-full mx-4 border border-slate-100"
                                    >
                                        <div className="relative w-28 h-28 mx-auto">
                                            <svg className="w-full h-full rotate-[-90deg]">
                                                <circle cx="56" cy="56" r="52" className="stroke-slate-100 fill-none stroke-[7]" />
                                                <motion.circle
                                                    cx="56" cy="56" r="52"
                                                    className="stroke-[#0d2870] fill-none stroke-[7]"
                                                    initial={{ strokeDasharray: "0, 326" }}
                                                    animate={{ strokeDasharray: "300, 326" }}
                                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                                    style={{ strokeLinecap: "round" }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Zap className="w-8 h-8 text-[#0d2870] animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Veuillez patienter</h3>
                                            <p className="text-sm text-slate-500 font-medium px-2">
                                                {isConfiguringDashboard
                                                    ? "Nous configurons votre tableau de bord personnel..."
                                                    : "Nous effectuons le calcul de votre redevance annuelle..."
                                                }
                                            </p>
                                            <div className="flex justify-center gap-1 mt-3">
                                                {[0, 1, 2].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                        className="w-1.5 h-1.5 rounded-full bg-[#0d2870]"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )
                        }
                    </AnimatePresence >
                </div >

                {/* Navigation - Compact */}
                {step < 4 ? (
                    <div className="flex-none p-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex-1 h-12 rounded-xl border border-slate-200 font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Retour
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={
                                    isSubmitting ||
                                    (step === 1 && (
                                        !province ||
                                        ((!ville && !cite) && !isVilleProvince) ||
                                        !commune
                                    )) ||
                                    (step === 2 && (
                                        activities.length === 0 ||
                                        (activities.includes("autre") && !autreActivite) ||
                                        (entityInfo.numeroImpot && !lockedFields.numeroImpot && !isNifValidFormat(entityInfo.numeroImpot)) ||
                                        (entityInfo.rccm && !lockedFields.rccm && !isRccmValidFormat(entityInfo.rccm)) ||
                                        (entityInfo.idNat && !lockedFields.idNat && !isIdNatValidFormat(entityInfo.idNat))
                                    ))
                                }
                                className="flex-[2] h-12 bg-[#0d2870] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:shadow-none disabled:bg-slate-200 disabled:text-slate-400"
                            >
                                {isSubmitting && step < 3 ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continuer <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        ) : (
                            <button
                                onClick={handleFinalSubmit}
                                disabled={isSubmitting}
                                className="flex-[2] h-12 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:shadow-none disabled:bg-slate-200 disabled:text-slate-400"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Calculator className="w-4 h-4" /> Terminer</>}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex-none p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={() => handleDashboardRedirect("/assujetti/redevance/paiement")}
                            className="h-12 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10"
                        >
                            <Banknote className="w-4 h-4" /> Payer ma redevance
                        </button>
                        <button
                            onClick={() => handleDashboardRedirect("/assujetti/dashboard")}
                            className="h-12 bg-[#0d2870] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/10"
                        >
                            Payer plus tard <CheckCircle className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div >

            {/* Map Slide-Over */}
            < MapSlideOver
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)
                }
                onConfirm={handleMapConfirm}
                initialAddress={adressePhysique}
                selectedProvinceName={provinces.find(p => p.id === province)?.nom}
            />
        </>
    );
}
