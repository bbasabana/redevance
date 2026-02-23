"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    Tv,
    Radio as RadioIcon,
    Calculator,
    CreditCard,
    ChevronLeft,
    Loader2,
    Signature,
    PenTool,
    Download,
    Smartphone,
    Globe,
    Users,
    MapPin,
    Activity,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    calculateControlAction,
    saveControlAction,
    checkAddressAction
} from "@/app/dashboard/agent/actions";

export type ControlPhase = "identification" | "constat" | "analyse" | "paiement" | "pv" | "success";

interface Assujetti {
    id: string;
    identifiantFiscal: string;
    nomRaisonSociale: string;
    typePersonne: string;
    nif?: string | null;
    rccm?: string | null;
    representantLegal?: string | null;
    adresseSiege?: string;
    nbTvDeclare: number;
    nbRadioDeclare: number;
}

interface FieldControlWorkflowProps {
    assujetti: Assujetti;
    onClose: () => void;
}

const phasesArray: ControlPhase[] = ["identification", "constat", "analyse", "paiement", "pv", "success"];

export function FieldControlWorkflow({ assujetti, onClose }: FieldControlWorkflowProps) {
    const [phase, setPhase] = useState<ControlPhase>("identification");
    const [isPending, startTransition] = useTransition();

    // Server-fetched data
    const [declaredData, setDeclaredData] = useState({
        nbTv: assujetti.nbTvDeclare || 0,
        nbRadio: assujetti.nbRadioDeclare || 0,
        exercice: new Date().getFullYear(),
        tarifUnitaire: 10
    });

    // Constat state
    const [nbTvConstate, setNbTvConstate] = useState(0);
    const [nbRadioConstate, setNbRadioConstate] = useState(0);
    const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
    const [constatData, setConstatData] = useState({
        nomRaisonSociale: "",
        typePersonne: "",
        nif: "",
        rccm: "",
        representantLegal: "",
        adresseSiege: "",
        secteursActivite: [] as string[],
        precisionAutre: "",
        adresseConstatee: "",
    });
    const [isLocating, setIsLocating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleLocate = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGeo({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setIsLocating(false);
                    toast.success("Position enregistrée");
                },
                (error) => {
                    console.error("Locate error:", error);
                    setIsLocating(false);
                    toast.error("Impossible de récupérer la position");
                }
            );
        } else {
            setIsLocating(false);
            toast.error("Géolocalisation non supportée");
        }
    };

    // Initial fetch
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const res = await calculateControlAction(assujetti.id);
            if (res.success && res.data) {
                setDeclaredData({
                    nbTv: res.data.nbTvDeclare,
                    nbRadio: res.data.nbRadioDeclare,
                    exercice: res.data.exercice,
                    tarifUnitaire: Number(res.data.tarifUnitaire) || 10
                });
            } else {
                toast.error("Impossible de récupérer les données précédentes");
            }
            setIsLoading(false);
        };
        fetchData();
    }, [assujetti.id]);

    // Derived values for Analysis
    const ecartTv = nbTvConstate - declaredData.nbTv;
    const ecartRadio = nbRadioConstate - declaredData.nbRadio;

    // Calculated Penalties
    const montantPrincipal = (Math.max(0, ecartTv) + Math.max(0, ecartRadio)) * declaredData.tarifUnitaire;
    const montantPenalite = montantPrincipal * 0.5; // 50% penalty
    const montantTotal = montantPrincipal + montantPenalite;

    const handleSave = async () => {
        setIsLoading(true);
        const res = await saveControlAction({
            assujettiId: assujetti.id,
            nbTvConstate,
            nbRadioConstate,
            nbTvDeclare: declaredData.nbTv,
            nbRadioDeclare: declaredData.nbRadio,
            exercice: declaredData.exercice,
            montantPrincipal,
            montantPenalite,
            montantTotal,
            geolocalisation: geo,
            activitesConstatees: constatData.secteursActivite,
            precisionAutre: constatData.precisionAutre,
            adresseConstatee: constatData.adresseConstatee
        });

        if (res.success) {
            setPhase("success");
        } else {
            toast.error(res.error || "Erreur lors de l'enregistrement");
        }
        setIsLoading(false);
    };

    const nextPhase = () => {
        const phases: ControlPhase[] = ["identification", "constat", "analyse", "paiement", "pv", "success"];
        const currentIndex = phases.indexOf(phase);

        // Skip payment if no discrepancy
        if (phase === "analyse" && montantTotal === 0) {
            setPhase("pv");
            return;
        }

        if (currentIndex < phases.length - 1) {
            setPhase(phases[currentIndex + 1]);
        }
    };

    const prevPhase = () => {
        const phases: ControlPhase[] = ["identification", "constat", "analyse", "paiement", "pv", "success"];
        const currentIndex = phases.indexOf(phase);

        // Skip payment if no discrepancy when going back from PV
        if (phase === "pv" && montantTotal === 0) {
            setPhase("analyse");
            return;
        }

        if (currentIndex > 0) {
            setPhase(phases[currentIndex - 1]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col max-w-[600px] mx-auto overflow-hidden">
            {/* Control Header */}
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4 shrink-0">
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"
                >
                    <X size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase text-[#0d2870] tracking-[0.2em]">Contrôle Terrain</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{assujetti.identifiantFiscal}</span>
                </div>
                <div className="w-10" />
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-100 w-full overflow-hidden">
                <motion.div
                    className="h-full bg-[#0d2870]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(phasesArray.indexOf(phase) + 1) * (100 / phasesArray.length)}%` }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                />
            </div>

            {/* Phase Content */}
            <div className="flex-1 overflow-y-auto p-6 relative">
                {isLoading && phase !== "paiement" && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#0d2870]" size={32} />
                    </div>
                )}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={phase}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="h-full"
                    >
                        {phase === "identification" && (
                            <IdentificationPhase assujetti={assujetti} onNext={nextPhase} />
                        )}
                        {phase === "constat" && (
                            <ConstatPhase
                                tv={nbTvConstate}
                                setTv={setNbTvConstate}
                                radio={nbRadioConstate}
                                setRadio={setNbRadioConstate}
                                data={constatData}
                                setData={(d: any) => setConstatData({ ...constatData, ...d })}
                                geo={geo}
                                setGeo={setGeo}
                                onLocate={handleLocate}
                                isLocating={isLocating}
                                onNext={nextPhase}
                                onBack={prevPhase}
                            />
                        )}
                        {phase === "analyse" && (
                            <AnalysePhase
                                assujetti={{ ...assujetti, nbTvDeclare: declaredData.nbTv, nbRadioDeclare: declaredData.nbRadio }}
                                tvC={nbTvConstate}
                                radioC={nbRadioConstate}
                                constatData={constatData}
                                montantPrincipal={montantPrincipal}
                                montantPenalite={montantPenalite}
                                montantTotal={montantTotal}
                                onNext={nextPhase}
                                onBack={prevPhase}
                            />
                        )}
                        {phase === "paiement" && (
                            <PaiementPhase
                                montant={montantTotal}
                                onNext={nextPhase}
                                onBack={prevPhase}
                            />
                        )}
                        {phase === "pv" && (
                            <PVPhase
                                assujetti={assujetti}
                                onNext={handleSave}
                                onBack={prevPhase}
                                isSaving={isLoading}
                            />
                        )}
                        {phase === "success" && (
                            <SuccessPhase onClose={onClose} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// --- PHASE SUB-COMPONENTS ---

function IdentificationPhase({ assujetti, onNext }: { assujetti: Assujetti, onNext: () => void }) {
    return (
        <div className="space-y-8 flex flex-col h-full">
            <div className="space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-[#0d2870]/5 text-[#0d2870] flex items-center justify-center">
                    <Users size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-8">Identification</h2>
                    <p className="text-sm text-slate-400 font-medium">Vérifiez les informations de l'assujetti avant de commencer le constat.</p>
                </div>
            </div>

            <Card className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#0d2870]">Raison Sociale</p>
                        <p className="text-lg font-black text-slate-900 uppercase leading-tight">{assujetti.nomRaisonSociale}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</p>
                            <p className="text-xs font-bold text-slate-900 uppercase">{assujetti.typePersonne === 'pp' ? 'Personne Physique' : 'Personne Morale'}</p>
                        </div>
                        <div className="space-y-0.5 text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID Fiscal</p>
                            <p className="text-xs font-mono font-bold text-[#0d2870]">{assujetti.identifiantFiscal}</p>
                        </div>
                        {assujetti.nif && (
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">NIF</p>
                                <p className="text-xs font-bold text-slate-900 uppercase">{assujetti.nif}</p>
                            </div>
                        )}
                        {assujetti.rccm && (
                            <div className="space-y-0.5 text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">RCCM</p>
                                <p className="text-xs font-bold text-slate-900 uppercase">{assujetti.rccm}</p>
                            </div>
                        )}
                        {assujetti.representantLegal && (
                            <div className="col-span-2 space-y-0.5 border-t border-slate-50 pt-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Représentant Légal</p>
                                <p className="text-xs font-bold text-slate-900 uppercase">{assujetti.representantLegal}</p>
                            </div>
                        )}
                    </div>
                    <div className="h-px bg-slate-50" />
                    <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase">{assujetti.adresseSiege || "Adresse non renseignée"}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex-1" />

            <button
                onClick={onNext}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
            >
                Confirmer & Commencer le constat
                <ArrowRight size={18} />
            </button>
        </div>
    );
}

function ConstatPhase({ tv, setTv, radio, setRadio, data, setData, geo, setGeo, onLocate, isLocating, onNext, onBack }: {
    tv: number,
    setTv: (v: number) => void,
    radio: number,
    setRadio: (v: number) => void,
    data: any,
    setData: (d: any) => void,
    geo: { lat: number, lng: number } | null,
    setGeo: (g: { lat: number, lng: number } | null) => void,
    onLocate: () => void,
    isLocating: boolean,
    onNext: () => void,
    onBack: () => void
}) {
    const [isManual, setIsManual] = useState(false);

    return (
        <div className="space-y-6 flex flex-col h-full overflow-hidden">
            <div className="space-y-2 shrink-0">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-8">Constat Physique</h2>
                <p className="text-sm text-slate-400 font-medium italic">Saisissez les informations telles que constatées sur place.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar-hide pb-4">
                {/* Sector of Activity */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d2870] italic">Secteurs d'Activité (Max 3)</p>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{data.secteursActivite.length}/3</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {["Hôtel", "Restaurant", "Bar", "Lounge Bar", "Paris Sportifs", "Guest House", "Chaîne Télé / Radio", "Autre"].map((sector) => {
                            const isSelected = data.secteursActivite.includes(sector);
                            return (
                                <button
                                    key={sector}
                                    onClick={() => {
                                        if (isSelected) {
                                            setData({ secteursActivite: data.secteursActivite.filter((s: string) => s !== sector) });
                                        } else if (data.secteursActivite.length < 3) {
                                            setData({ secteursActivite: [...data.secteursActivite, sector] });
                                        } else {
                                            toast.error("Maximum 3 secteurs");
                                        }
                                    }}
                                    className={cn(
                                        "p-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 text-left flex items-center justify-between",
                                        isSelected ? "border-[#0d2870] bg-[#0d2870]/5 text-[#0d2870]" : "border-slate-100 bg-white text-slate-400"
                                    )}
                                >
                                    {sector}
                                    {isSelected && <CheckCircle2 size={12} />}
                                </button>
                            );
                        })}
                    </div>

                    {data.secteursActivite.includes("Autre") && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-1.5"
                        >
                            <label className="text-[9px] font-black uppercase text-slate-400 px-1">Précisez l'activité</label>
                            <Input
                                value={data.precisionAutre}
                                onChange={(e) => setData({ precisionAutre: e.target.value })}
                                placeholder="Détaillez ici..."
                                className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm uppercase"
                            />
                        </motion.div>
                    )}
                </div>

                <div className="h-px bg-slate-100" />

                {/* Identification Verification */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d2870] px-1 italic">Vérification de l'Identité</p>
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-slate-400 px-1">Raison Sociale</label>
                            <Input
                                value={data.nomRaisonSociale}
                                onChange={(e) => setData({ nomRaisonSociale: e.target.value })}
                                placeholder="Nom complet..."
                                className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm uppercase"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 px-1">Type</label>
                                <select
                                    value={data.typePersonne}
                                    onChange={(e) => setData({ typePersonne: e.target.value })}
                                    className="w-full h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm uppercase px-4 outline-none focus:ring-2 focus:ring-[#0d2870]/20"
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="pp">Physique</option>
                                    <option value="pm">Morale</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 px-1">NIF</label>
                                <Input
                                    value={data.nif}
                                    onChange={(e) => setData({ nif: e.target.value })}
                                    placeholder="A0000000X"
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-mono font-bold text-sm uppercase"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 px-1">RCCM</label>
                                <Input
                                    value={data.rccm}
                                    onChange={(e) => setData({ rccm: e.target.value })}
                                    placeholder="CD/..."
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-mono font-bold text-sm uppercase"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 px-1">Représentant</label>
                                <Input
                                    value={data.representantLegal}
                                    onChange={(e) => setData({ representantLegal: e.target.value })}
                                    placeholder="Nom..."
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm uppercase"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-slate-400 px-1">Adresse de Siège</label>
                            <Input
                                value={data.adresseSiege}
                                onChange={(e) => setData({ adresseSiege: e.target.value })}
                                placeholder="N°, Rue, Quartier, Commune..."
                                className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm uppercase"
                            />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Device Count */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d2870] px-1 italic">Nombre d'appareils</p>
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#0d2870] shadow-sm">
                                <Tv size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase text-slate-900">Postes TV</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Postes opérationnels</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setTv(Math.max(0, tv - 1))} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-sm active:scale-90">-</button>
                            <span className="text-2xl font-black text-[#0d2870] min-w-[1.5rem] text-center">{tv}</span>
                            <button onClick={() => setTv(tv + 1)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-sm active:scale-90">+</button>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#0d2870] shadow-sm">
                                <RadioIcon size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase text-slate-900">Postes Radio</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Récepteurs ondes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setRadio(Math.max(0, radio - 1))} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-sm active:scale-90">-</button>
                            <span className="text-2xl font-black text-[#0d2870] min-w-[1.5rem] text-center">{radio}</span>
                            <button onClick={() => setRadio(radio + 1)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-sm active:scale-90">+</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-3xl">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", geo ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-400")}>
                                    <MapPin size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black uppercase text-slate-900">Géolocalisation</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-ellipsis overflow-hidden max-w-[150px]">
                                        {geo ? `${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}` : (data.adresseConstatee || "Non localisé")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsManual(!isManual)}
                                    className={cn(
                                        "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm",
                                        isManual ? "bg-[#0d2870] text-white" : "bg-white border border-slate-200 text-slate-400"
                                    )}
                                >
                                    Saisie Manuelle (Adresse)
                                </button>
                                <button
                                    onClick={onLocate}
                                    disabled={isLocating}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#0d2870] active:scale-95 transition-all shadow-sm flex items-center gap-2"
                                >
                                    {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                                    {geo ? "Actualiser" : "Localiser"}
                                </button>
                            </div>
                        </div>

                        {isManual && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-4"
                            >
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase text-slate-400 px-1">Adresse Réelle (Saisie Manuelle)</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Ex: 123, Avenue du Commerce, Gombe"
                                            className="h-12 rounded-2xl bg-white border-slate-200 font-bold text-xs uppercase"
                                            value={data.adresseConstatee}
                                            onChange={(e) => setData({ adresseConstatee: e.target.value })}
                                        />
                                        <button
                                            onClick={async () => {
                                                if (!data.adresseConstatee) return;
                                                const res = await checkAddressAction(data.adresseConstatee);
                                                if (res.success) {
                                                    if (res.exists) {
                                                        toast.info(`${res.matches.length} assujetti(s) trouvé(s) à cette adresse.`);
                                                    } else {
                                                        toast.success("Aucun assujetti trouvé à cette adresse. Nouvelle localisation.");
                                                    }
                                                }
                                            }}
                                            className="px-4 bg-[#0d2870] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                                        >
                                            Vérifier
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="p-5 bg-amber-50 border border-amber-100 rounded-3xl flex gap-4">
                    <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
                        Assurez-vous de vérifier chaque pièce ou bureau pour un décompte précis. La signature du PV en dépend.
                    </p>
                </div>

                <div className="flex-1" />

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onBack}
                        className="py-5 bg-slate-50 text-slate-400 rounded-[2rem] flex items-center justify-center font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                    >
                        Retour
                    </button>
                    <button
                        onClick={onNext}
                        className="py-5 bg-[#0d2870] text-white rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-[#0d2870]/20 active:scale-95 transition-all"
                    >
                        Analyser
                        <Calculator size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function AnalysePhase({ assujetti, tvC, radioC, constatData, montantPrincipal, montantPenalite, montantTotal, onNext, onBack }: { assujetti: Assujetti, tvC: number, radioC: number, constatData: any, montantPrincipal: number, montantPenalite: number, montantTotal: number, onNext: () => void, onBack: () => void }) {
    const tvDiffer = tvC !== assujetti.nbTvDeclare;
    const radioDiffer = radioC !== assujetti.nbRadioDeclare;

    const idChecks = [
        { label: "Nom/Raison Sociale", constat: constatData.nomRaisonSociale, declare: assujetti.nomRaisonSociale },
        { label: "Type", constat: constatData.typePersonne, declare: assujetti.typePersonne },
        { label: "NIF", constat: constatData.nif, declare: assujetti.nif || "" },
        { label: "RCCM", constat: constatData.rccm, declare: assujetti.rccm || "" },
        { label: "Représentant", constat: constatData.representantLegal, declare: assujetti.representantLegal || "" },
        { label: "Adresse", constat: constatData.adresseSiege, declare: assujetti.adresseSiege || "" },
    ];

    const anyIdDiffer = idChecks.some(c => c.constat?.toUpperCase() !== c.declare?.toUpperCase());
    const isEcart = tvDiffer || radioDiffer || anyIdDiffer;

    return (
        <div className="space-y-5 flex flex-col h-full overflow-hidden">
            <div className="space-y-1.5 shrink-0">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">Analyse des Écarts</h2>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Comparaison constat vs déclarations</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-hide">
                {/* Identification Analysis */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d2870] px-1 italic">Vérification de l'Identité</p>
                    <div className="grid grid-cols-1 gap-2.5">
                        {idChecks.map((check, i) => {
                            const isDiffer = check.constat?.toUpperCase() !== check.declare?.toUpperCase();
                            return (
                                <div key={i} className={cn(
                                    "p-4 rounded-3xl border-2 transition-all space-y-3",
                                    isDiffer ? "bg-red-50 border-red-100" : "bg-white border-slate-50"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{check.label}</p>
                                        {isDiffer ? (
                                            <span className="flex items-center gap-1 text-[8px] font-black uppercase text-red-500 bg-red-100 px-2 py-1 rounded-full">
                                                <AlertTriangle size={8} /> Écart
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-500 bg-emerald-100 px-2 py-1 rounded-full">
                                                <CheckCircle2 size={8} /> Conforme
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="space-y-1">
                                            <p className={cn("text-xs font-black uppercase break-words leading-relaxed", isDiffer ? "text-red-700" : "text-emerald-700")}>
                                                {check.constat || "NON RENSEIGNÉ"}
                                            </p>
                                        </div>
                                        {isDiffer && (
                                            <div className="pt-2 border-t border-red-100/50 flex flex-col gap-1">
                                                <p className="text-[8px] font-black uppercase text-slate-400 italic">Valeur Déclarée</p>
                                                <p className="text-[10px] font-black text-slate-500 uppercase break-words leading-relaxed">{check.declare || "---"}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Equipment Analysis */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d2870] px-1 italic">Détail des Équipements</p>
                    <div className="grid grid-cols-1 gap-2.5">
                        {[
                            {
                                label: "Postes TV",
                                icon: Tv,
                                constat: tvC,
                                declare: assujetti.nbTvDeclare,
                                diff: tvC - assujetti.nbTvDeclare,
                                active: tvDiffer
                            },
                            {
                                label: "Postes Radio",
                                icon: RadioIcon,
                                constat: radioC,
                                declare: assujetti.nbRadioDeclare,
                                diff: radioC - assujetti.nbRadioDeclare,
                                active: radioDiffer
                            }
                        ].map((item, i) => (
                            <div key={i} className={cn(
                                "p-5 rounded-[2.5rem] border-2 transition-all flex items-center justify-between",
                                item.active ? "bg-red-50 border-red-100" : "bg-white border-slate-50"
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", item.active ? "bg-red-600 text-white" : "bg-emerald-600 text-white")}>
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-slate-900">{item.label}</p>
                                        <p className={cn("text-[10px] font-black uppercase tracking-tighter", item.active ? "text-red-500" : "text-emerald-500")}>
                                            Différence: {item.diff > 0 ? `+${item.diff}` : item.diff}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Déclaré</p>
                                        <p className="text-sm font-black text-slate-400">{item.declare}</p>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-200" />
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-[#0d2870] uppercase mb-0.5">Constaté</p>
                                        <p className={cn("text-xl font-black", item.active ? "text-red-600" : "text-emerald-600")}>{item.constat}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial Summary or Conformity */}
                {isEcart ? (
                    <div className="bg-[#0b1b3d] text-white rounded-[3rem] p-7 space-y-6 shadow-2xl shadow-[#0b1b3d]/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <AlertTriangle size={120} />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-red-500">Régularisation requise</h4>
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Écarts constatés lors de la mission</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black uppercase text-slate-400 italic">Pénalité</p>
                                <p className="text-xl font-black text-red-400">+50%</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="bg-white/5 rounded-3xl p-5 space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                    <span className="text-slate-400">Droits Éludés</span>
                                    <span className="text-white">{montantPrincipal.toLocaleString()}$</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                    <span className="text-slate-400">Amende Transactionnelle</span>
                                    <span className="text-red-400">{montantPenalite.toLocaleString()}$</span>
                                </div>
                            </div>

                            <div className="px-5 flex justify-between items-end">
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase text-indigo-300 tracking-widest">Total à payer</p>
                                    <p className="text-[8px] font-bold text-slate-400 italic">Montant toutes taxes incluses</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-black text-white italic tracking-tighter underline underline-offset-8 decoration-indigo-500/50">
                                        {montantTotal.toLocaleString()}$
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-600 text-white rounded-[3rem] p-8 text-center space-y-4 shadow-xl shadow-emerald-500/20">
                        <div className="w-20 h-20 rounded-full bg-white/20 mx-auto flex items-center justify-center backdrop-blur-md">
                            <CheckCircle2 size={40} />
                        </div>
                        <div>
                            <p className="text-xl font-black uppercase tracking-tight">Conformité Totale</p>
                            <p className="text-xs font-bold opacity-80 uppercase tracking-wider mt-2">Aucun écart n'a été relevé</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 shrink-0 mt-4">
                <button
                    onClick={onBack}
                    className="py-5 bg-slate-50 text-slate-400 rounded-[2rem] flex items-center justify-center font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all border border-slate-100"
                >
                    Retour
                </button>
                <button
                    onClick={onNext}
                    className="py-5 bg-[#0d2870] text-white rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-[#0d2870]/20 active:scale-95 transition-all"
                >
                    {isEcart ? "Procéder au paiement" : "Finaliser le contrôle"}
                    <CreditCard size={18} />
                </button>
            </div>
        </div>
    );
}

function PaiementPhase({ montant, onNext, onBack }: { montant: number, onNext: () => void, onBack: () => void }) {
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "pushing" | "verifying" | "paid">("idle");

    const handlePay = () => {
        if (!selectedMethod) return;
        setStatus("pushing");
        setTimeout(() => {
            setStatus("verifying");
            setTimeout(() => {
                setStatus("paid");
                toast.success("Paiement confirmé par l'assujetti");
                setTimeout(onNext, 1500);
            }, 3000);
        }, 2000);
    };

    const methods = [
        { id: "mtn", label: "MTN MoMo", icon: Smartphone, color: "bg-yellow-400 text-slate-900" },
        { id: "airtel", label: "Airtel Money", icon: Smartphone, color: "bg-red-600 text-white" },
        { id: "orange", label: "Orange Money", icon: Smartphone, color: "bg-orange-500 text-white" },
        { id: "bank", label: "Virement / QR", icon: Globe, color: "bg-slate-900 text-white" },
    ];

    if (status !== "idle") {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-100 flex items-center justify-center">
                        {status === "pushing" && <Loader2 size={48} className="animate-spin text-[#0d2870]" />}
                        {status === "verifying" && <Activity size={48} className="animate-bounce text-blue-600" />}
                        {status === "paid" && <CheckCircle2 size={48} className="text-emerald-500" />}
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tight leading-tight">
                        {status === "pushing" && "Envoi du Push..."}
                        {status === "verifying" && "Attente validation..."}
                        {status === "paid" && "Paiement Réussi !"}
                    </h3>
                    <p className="text-sm font-bold text-slate-400 max-w-[200px] mx-auto uppercase">
                        {status === "pushing" && "Une demande de paiement a été envoyée sur le terminal de l'assujetti."}
                        {status === "verifying" && "L'assujetti doit saisir son code secret pour valider la transaction."}
                        {status === "paid" && "Le montant de " + montant + "$ a été crédité au compte RTNC."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col h-full">
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-8">Paiement</h2>
                <p className="text-sm text-slate-400 font-medium">L'assujetti doit régulariser le montant dû immédiatement.</p>
            </div>

            <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex justify-between items-center shadow-xl shadow-slate-900/20">
                <div>
                    <p className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.2em]">Total à régler</p>
                    <p className="text-3xl font-black mt-1">{montant}<span className="text-indigo-400 text-lg ml-1">$</span></p>
                </div>
                <CreditCard size={40} className="text-white opacity-20" />
            </div>

            <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Mode de règlement</p>
                <div className="grid grid-cols-2 gap-3">
                    {methods.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setSelectedMethod(m.id)}
                            className={cn(
                                "p-4 rounded-3xl border-2 flex flex-col gap-3 transition-all active:scale-95",
                                selectedMethod === m.id ? "border-[#0d2870] bg-[#0d2870]/5" : "border-slate-100 bg-white"
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", m.color)}>
                                <m.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tight text-slate-900">{m.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1" />
            <button
                disabled={!selectedMethod}
                onClick={handlePay}
                className="w-full py-5 bg-[#0d2870] text-white rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-[#0d2870]/20 active:scale-95 disabled:opacity-50"
            >
                Envoyer demande de paiement
                <Smartphone size={18} />
            </button>
        </div>
    );
}

function PVPhase({ assujetti, onNext, onBack, isSaving }: { assujetti: Assujetti, onNext: () => void, onBack: () => void, isSaving: boolean }) {
    const [agentSigned, setAgentSigned] = useState(false);
    const [assujettiSigned, setAssujettiSigned] = useState(false);
    const pvRef = `PV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return (
        <div className="space-y-6 flex flex-col h-full overflow-hidden pb-4">
            <div className="space-y-2 shrink-0">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-8">Procès-Verbal</h2>
                <p className="text-sm text-slate-400 font-medium">Validation officielle du constat de terrain.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                {/* Visual PV Card */}
                <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 space-y-6 relative shadow-sm">
                    <div className="absolute top-6 right-6 text-[#0d2870] opacity-[0.03]">
                        <Signature size={120} />
                    </div>

                    <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl p-2 border border-slate-100 overflow-hidden shrink-0">
                            <img src="/logos/logo.png" alt="RTNC" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase text-slate-900 tracking-tight leading-none">RTNC • REDEVANCE</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Procès-Verbal Officiel</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-50/50 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-slate-400 uppercase tracking-widest">Référence</span>
                                <span className="font-black text-[#0d2870]">{pvRef}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-slate-400 uppercase tracking-widest">Assujetti</span>
                                <span className="font-black text-slate-900 truncate max-w-[150px]">{assujetti.nomRaisonSociale}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-slate-400 uppercase tracking-widest">Date</span>
                                <span className="font-black text-slate-900">{new Date().toLocaleDateString('fr-FR')}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#0d2870] px-1">Texte du PV</p>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] leading-relaxed text-slate-600 font-medium italic">
                                "Nous, Agent de la RTNC, dûment mandaté, certifions avoir procédé à la vérification physique des équipements de l'assujetti <b>{assujetti.nomRaisonSociale}</b> (ID: {assujetti.identifiantFiscal}).
                                Le constat effectué ce jour révèle un écart par rapport aux déclarations précédentes. L'assujetti reconnaît la véracité des faits et s'engage à régulariser sa situation conformément aux lois en vigueur."
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Signatures obligatoires</p>

                    <button
                        onClick={() => setAgentSigned(true)}
                        className={cn(
                            "w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all",
                            agentSigned ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-100 text-slate-600"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <PenTool size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Signature Agent</span>
                        </div>
                        {agentSigned ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                    </button>

                    <button
                        onClick={() => setAssujettiSigned(true)}
                        className={cn(
                            "w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all",
                            assujettiSigned ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-100 text-slate-600"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <User size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Signature Assujetti</span>
                        </div>
                        {assujettiSigned ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                    </button>
                </div>
            </div>

            <div className="shrink-0 pt-4 space-y-3">
                <button
                    disabled={!agentSigned || !assujettiSigned}
                    className="w-full py-5 bg-white border-2 border-[#0d2870] text-[#0d2870] rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all disabled:opacity-50"
                >
                    <Download size={18} />
                    Télécharger le PV (PDF)
                </button>
                <button
                    disabled={!agentSigned || !assujettiSigned || isSaving}
                    onClick={onNext}
                    className="w-full py-5 bg-[#0d2870] text-white rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-[#0d2870]/20 active:scale-95 transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    Finaliser la mission
                </button>
            </div>
        </div>
    );
}

function SuccessPhase({ onClose }: { onClose: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="relative">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-32 h-32 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40"
                >
                    <CheckCircle2 size={64} />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-4 border-emerald-500"
                />
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase tracking-tight leading-tight">Mission Terminée</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-[250px] mx-auto">
                        Le contrôle a été enregistré avec succès et le dossier de l'assujetti a été mis à jour.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-[300px] mx-auto pt-4">
                    <div className="p-3 bg-slate-50 rounded-2xl">
                        <p className="text-[8px] font-black text-slate-400 uppercase">PV Généré</p>
                        <p className="text-xs font-black text-slate-900">OUI</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Régularisé</p>
                        <p className="text-xs font-black text-emerald-600">PAYÉ</p>
                    </div>
                </div>
            </div>

            <div className="w-full pt-8">
                <button
                    onClick={onClose}
                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
                >
                    Retour au Dashboard
                </button>
            </div>
        </div>
    );
}
