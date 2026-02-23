"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Building2, MapPin, Phone, Mail,
    FileText, Save, ArrowLeft, Loader2,
    Briefcase, ShieldAlert, CloudUpload, FileCheck,
    AlertCircle, Hotel, Utensils, Beer, Smartphone,
    Search, Building, Monitor, CheckCircle, MapPin as MapPinIcon,
    Navigation, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import MapSlideOver from "./MapSlideOver";
import { TechnicalUploader } from "./TechnicalUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateAssujettiProfile } from "@/app/actions/assujetti";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileEditFormProps {
    initialData: any;
}

const activityOptions = [
    { id: "hotel", label: "Hôtel", icon: Hotel },
    { id: "restaurant", label: "Restaurant", icon: Utensils },
    { id: "bar", label: "Bar", icon: Beer },
    { id: "lounge", label: "Lounge Bar", icon: Smartphone },
    { id: "paris_sportifs", label: "Paris Sportifs", icon: Search },
    { id: "guest_house", label: "Guest House", icon: Building },
    { id: "chaine_tv", label: "Chaîne Télé / Radio", icon: Monitor },
    { id: "autre", label: "Autre", icon: CheckCircle },
];

export default function ProfileEditPage({ initialData }: ProfileEditFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        nomRaisonSociale: initialData?.nomRaisonSociale || "",
        nif: initialData?.nif || "",
        rccm: initialData?.rccm || "",
        idNat: initialData?.idNat || "",
        representantLegal: initialData?.representantLegal || "",
        adresseSiege: initialData?.adresseSiege || "",
        typeActivite: initialData?.typeActivite || "autre",
        telephonePrincipal: initialData?.telephonePrincipal || "",
        email: initialData?.email || "",
        nifUrl: initialData?.nifUrl || "",
        rccmUrl: initialData?.rccmUrl || "",
        idNatUrl: initialData?.idNatUrl || "",
        validationStatus: initialData?.validationStatus || "none",
        activities: (initialData?.activites && (initialData.activites as string[]).length > 0)
            ? initialData.activites
            : (initialData?.typeActivite ? [initialData.typeActivite] : []),
        autreActivite: initialData?.precisionAutre || "",
        latitude: initialData?.latitude ? parseFloat(initialData.latitude) : undefined,
        longitude: initialData?.longitude ? parseFloat(initialData.longitude) : undefined,
    });

    const [isMapOpen, setIsMapOpen] = useState(false);

    const isPending = formData.validationStatus === "pending";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleActivity = (id: string) => {
        setFormData(prev => {
            if (id === "autre") {
                return {
                    ...prev,
                    activities: prev.activities.includes("autre") ? [] : ["autre"]
                };
            }

            const current = (prev.activities as string[]).filter(a => a !== "autre");
            if (current.includes(id)) {
                return { ...prev, activities: current.filter(a => a !== id) };
            }

            if (current.length >= 3) {
                toast.error("Maximum 3 activités");
                return prev;
            }

            return { ...prev, activities: [...current, id] };
        });
    };

    const handleMapConfirm = (address: string, lat?: number, lng?: number) => {
        setFormData(prev => ({
            ...prev,
            adresseSiege: address,
            latitude: lat,
            longitude: lng
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = await updateAssujettiProfile(formData);

        if (result.success) {
            toast.success("Profil mis à jour avec succès");
            router.push("/assujetti/profil/infos");
        } else {
            toast.error(result.error || "Erreur lors de la mise à jour");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section - High Contrast Technical Look */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-6 border-b-2 border-slate-900/5 pb-8">
                <div className="space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-[11px] font-black text-[#0d2870] hover:text-red-600 uppercase tracking-[0.2em] transition-all group bg-transparent border-none p-0"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Administration Dashboard
                    </button>
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Mes Informations Fiscales</h1>
                        <p className="text-slate-500 font-bold max-w-xl text-sm leading-relaxed border-l-4 border-yellow-400 pl-4 bg-yellow-400/5 py-2">
                            Mise à jour de votre dossier d'identification. Les modifications des identifiants légaux sont soumises à une revue administrative.
                        </p>
                    </div>
                </div>

                <div className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-l border-slate-100 pl-6 mt-2">
                    Date de modification : <span className="text-slate-900">{new Date().toLocaleDateString('fr-FR')}</span>
                </div>
            </div>

            {isPending && (
                <div className="p-4 bg-yellow-400 border-b-4 border-yellow-600 rounded-lg flex items-start gap-4 shadow-xl animate-pulse">
                    <ShieldAlert className="w-6 h-6 text-slate-900 shrink-0 mt-1" />
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none mb-2">Modification en cours de revue</h4>
                        <p className="text-[11px] font-bold text-slate-900/80 leading-relaxed uppercase">
                            Votre demande de modification des identifiants (NIF/RCCM) est actuellement en attente de validation par nos services techniques. Toute nouvelle modification remplacera la demande précédente.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-2 border-slate-100 shadow-none rounded-lg overflow-hidden relative">
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

                            <CardHeader className="bg-[#0d2870] border-b-4 border-yellow-400 text-white p-6">
                                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Building2 className="w-5 h-5 text-yellow-400" />
                                    Identification & Registre
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="nomRaisonSociale" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom / Raison Sociale</Label>
                                        <Input
                                            id="nomRaisonSociale"
                                            name="nomRaisonSociale"
                                            value={formData.nomRaisonSociale}
                                            onChange={handleChange}
                                            className="h-12 rounded-lg border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#0d2870] transition-all font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secteurs d'Activité (Max 3)</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {activityOptions.map(act => {
                                                const Icon = act.icon;
                                                const isSelected = formData.activities.includes(act.id);
                                                return (
                                                    <button
                                                        key={act.id}
                                                        type="button"
                                                        onClick={() => toggleActivity(act.id)}
                                                        className={cn(
                                                            "flex items-center gap-3 p-3 rounded-xl border-2 transition-all hover:border-[#0d2870]/30 text-left",
                                                            isSelected ? "border-[#0d2870] bg-[#0d2870]/5 text-[#0d2870]" : "border-slate-100 text-slate-600 bg-slate-50/50"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                            isSelected ? "bg-[#0d2870] text-white" : "bg-white text-slate-400 border border-slate-100"
                                                        )}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase leading-tight">{act.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {formData.activities.includes("autre") && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-4 p-4 rounded-xl bg-indigo-50 border-2 border-indigo-100 space-y-2"
                                            >
                                                <Label className="text-[10px] font-black text-[#0d2870] uppercase tracking-widest">Précisez votre activité</Label>
                                                <Input
                                                    name="autreActivite"
                                                    value={formData.autreActivite}
                                                    onChange={handleChange}
                                                    placeholder="Décrivez votre secteur ici..."
                                                    className="h-12 rounded-lg border-2 border-indigo-200 bg-white focus:border-[#0d2870] transition-all font-bold"
                                                />
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nif" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NIF (Identification Fiscale)</Label>
                                        <Input
                                            id="nif"
                                            name="nif"
                                            value={formData.nif}
                                            onChange={handleChange}
                                            className="h-12 rounded-lg border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#0d2870] transition-all font-bold font-mono"
                                            placeholder="Ex: 01-12345-A"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="rccm" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RCSM / RCCM</Label>
                                        <Input
                                            id="rccm"
                                            name="rccm"
                                            value={formData.rccm}
                                            onChange={handleChange}
                                            className="h-12 rounded-lg border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#0d2870] transition-all font-bold font-mono"
                                            placeholder="Ex: CD/KIN/RCCM/..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="idNat" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID National</Label>
                                        <Input
                                            id="idNat"
                                            name="idNat"
                                            value={formData.idNat}
                                            onChange={handleChange}
                                            className="h-12 rounded-lg border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#0d2870] transition-all font-bold font-mono"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="representantLegal" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mandataire / Représentant</Label>
                                        <Input
                                            id="representantLegal"
                                            name="representantLegal"
                                            value={formData.representantLegal}
                                            onChange={handleChange}
                                            className="h-12 rounded-lg border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#0d2870] transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-slate-100 shadow-none rounded-lg overflow-hidden relative">
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

                            <CardHeader className="bg-[#0d2870] border-b-4 border-yellow-400 text-white p-6">
                                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-yellow-400" />
                                    Coordonnées & Siège
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="adresseSiege" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adresse Physique du Siège</Label>
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2870] z-10" />
                                                <Input
                                                    id="adresseSiege"
                                                    name="adresseSiege"
                                                    value={formData.adresseSiege}
                                                    onChange={handleChange}
                                                    className="h-12 pl-10 rounded-lg border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#0d2870] transition-all font-bold"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => setIsMapOpen(true)}
                                                className="h-12 px-6 bg-[#0d2870] hover:bg-slate-900 text-white rounded-lg flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shrink-0"
                                            >
                                                <Navigation className="w-4 h-4" />
                                                Ma Position
                                            </Button>
                                        </div>
                                        {formData.latitude && formData.longitude && (
                                            <p className="text-[10px] font-bold text-emerald-600 ml-1 flex items-center gap-1.5 mt-1 border-l-2 border-emerald-500 pl-2">
                                                <Check className="w-3 h-3" />
                                                Coordonnées enregistrées : {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telephonePrincipal" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Téléphone Contact</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2870]" />
                                            <Input
                                                id="telephonePrincipal"
                                                name="telephonePrincipal"
                                                value={formData.telephonePrincipal}
                                                onChange={handleChange}
                                                className="h-12 pl-10 rounded-lg border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#0d2870] transition-all font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lien de Communication (Email)</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2870]" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="h-12 pl-10 rounded-lg border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#0d2870] transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documents Section */}
                        <Card className="border-2 border-slate-100 shadow-none rounded-lg overflow-hidden relative">
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

                            <CardHeader className="bg-[#0d2870] border-b-4 border-yellow-400 text-white p-6">
                                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                    <CloudUpload className="w-5 h-5 text-yellow-400" />
                                    Documents Justificatifs
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <TechnicalUploader
                                        label="RCCM (Commerce)"
                                        description="Scanner RCCM récent"
                                        initialUrl={formData.rccmUrl}
                                        onUpload={(url) => setFormData(prev => ({ ...prev, rccmUrl: url }))}
                                    />
                                    <TechnicalUploader
                                        label="Identification Nationale"
                                        description="Scanner le document"
                                        initialUrl={formData.idNatUrl}
                                        onUpload={(url) => setFormData(prev => ({ ...prev, idNatUrl: url }))}
                                    />
                                    <TechnicalUploader
                                        label="Attestation NIF"
                                        description="Scanner le document"
                                        initialUrl={formData.nifUrl}
                                        onUpload={(url) => setFormData(prev => ({ ...prev, nifUrl: url }))}
                                    />
                                </div>
                                <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-lg flex gap-3 items-start">
                                    <AlertCircle className="w-4 h-4 text-[#0d2870] shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold text-[#0d2870]/70 leading-relaxed uppercase tracking-tight">
                                        L'upload de ces documents est obligatoire pour toute modification des identifiants fiscaux. Les fichiers doivent être lisibles pour validation.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Actions & Summary */}
                    <div className="space-y-8">
                        <Card className="bg-[#0d2870] text-white rounded-lg border-none shadow-xl overflow-hidden relative">
                            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                            <CardHeader className="relative z-10 border-b border-white/10 pb-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">Actions Administratives</p>
                                <CardTitle className="text-xl font-black uppercase tracking-tighter mt-1">Validation Finale</CardTitle>
                            </CardHeader>

                            <CardContent className="relative z-10 p-6 space-y-6">
                                <div className="p-4 bg-white/10 rounded-lg border border-white/10 flex gap-4">
                                    <ShieldAlert className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white">Sécurité du Registre</p>
                                        <p className="text-[11px] font-bold text-white/70 leading-relaxed">
                                            La modification du NIF ou RCCM nécessite l'upload des documents justificatifs.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !formData.nifUrl || !formData.rccmUrl || !formData.idNatUrl}
                                        className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black uppercase tracking-[0.15em] text-[11px] shadow-none border-none transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Synchronisation...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Mettre à jour le dossier
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="w-full h-12 bg-white/5 hover:bg-white/10 text-white border-white/20 rounded-lg font-black uppercase tracking-[0.15em] text-[10px] transition-all"
                                    >
                                        Annuler la modification
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fiscal Status Card - Technical Look */}
                        <div className="p-6 bg-white rounded-lg border-2 border-slate-100 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border-b-2 border-emerald-200">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Compte vérifié</p>
                                    <p className="text-xs font-black text-slate-900 uppercase">IDENTIFICATION_ACTIVE</p>
                                </div>
                            </div>
                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[100%]" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                                Votre profil est actuellement certifié. Toute modification majeure réinitialisera temporairement ce statut.
                            </p>
                        </div>
                    </div>
                </div>
            </form>

            <MapSlideOver
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                onConfirm={(address, lat, lng) => {
                    setFormData(prev => ({
                        ...prev,
                        adresseSiege: address,
                        latitude: lat,
                        longitude: lng
                    }));
                }}
                initialAddress={formData.adresseSiege}
            />
        </div>
    );
}
