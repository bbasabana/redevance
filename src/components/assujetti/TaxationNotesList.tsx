"use client";

import { useState } from "react";
import {
    FileText,
    Calendar,
    Receipt,
    ChevronRight,
    Search,
    Filter,
    ArrowLeft,
    DownloadCloud,
    Building2,
    MapPin,
    ShieldCheck,
    Lock,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TaxationQRCode } from "@/components/assujetti/TaxationQRCode";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import dynamic from "next/dynamic";

const PDFDownloadButton = dynamic(
    () => import("./PDFDownloadButton"),
    { ssr: false, loading: () => <div className="h-12 w-full bg-slate-100 animate-pulse rounded-lg" /> }
);

interface Note {
    id: string;
    numeroNote: string | null;
    exercice: number;
    montantTotalDu: string;
    statut: string | null;
    dateEmission: string | null;
    dateEcheance: string | null;
    pdfUrl: string | null;
    montantBrut: string;
    montantNet: string;
    montantReduction: string;
    reductionPct: string | null;
    montantPenalites: string;
}

interface TaxationNotesListProps {
    notes: Note[];
    assujetti: any;
    qrDataMap: Record<string, string>;
}

export function TaxationNotesList({ notes, assujetti, qrDataMap }: TaxationNotesListProps) {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [filterYear, setFilterYear] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const years = Array.from(new Set(notes.map(n => n.exercice))).sort((a, b) => b - a);

    const filteredNotes = notes.filter(note => {
        const matchYear = filterYear === "all" || note.exercice.toString() === filterYear;
        const matchStatus = filterStatus === "all" || note.statut === filterStatus;
        return matchYear && matchStatus;
    });

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'USD' }).format(Number(amount));
    };

    const getStatusStyles = (statut: string | null) => {
        switch (statut) {
            case "payee":
                return "bg-emerald-500 text-white border-emerald-600";
            case "en_retard":
                return "bg-red-600 text-white border-red-700";
            case "emise":
                return "bg-yellow-400 text-slate-900 border-yellow-500 font-black";
            default:
                return "bg-slate-200 text-slate-600 border-slate-300";
        }
    };

    const getStatusLabel = (statut: string | null) => {
        switch (statut) {
            case "payee": return "CERTIFIÉE / PAYÉE";
            case "en_retard": return "URGENT / EN RETARD";
            case "emise": return "ATTENTE PAIEMENT";
            case "brouillon": return "BROUILLON";
            default: return statut?.toUpperCase() || "INCONNU";
        }
    };

    return (
        <div className="space-y-8">
            {/* Filters Bar - Professional Blue Look */}
            <div className="bg-[#0d2870] p-4 rounded-xl border-t-4 border-yellow-400 flex flex-wrap items-center gap-4 shadow-none sticky top-4 z-30 px-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-lg border border-white/10 transition-all hover:bg-white/20 group">
                        <Calendar className="w-4 h-4 text-yellow-400" />
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="text-[11px] font-black text-white bg-transparent border-none focus:outline-none focus:ring-0 uppercase tracking-[0.15em] cursor-pointer"
                        >
                            <option value="all" className="bg-[#0d2870]">TOUS LES EXERCICES</option>
                            {years.map(y => (
                                <option key={y} value={y.toString()} className="bg-[#0d2870]">{y}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-lg border border-white/10 transition-all hover:bg-white/20 group">
                        <Filter className="w-4 h-4 text-yellow-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-[11px] font-black text-white bg-transparent border-none focus:outline-none focus:ring-0 uppercase tracking-[0.15em] cursor-pointer"
                        >
                            <option value="all" className="bg-[#0d2870]">TOUTES LES SITUATIONS</option>
                            <option value="payee" className="bg-[#0d2870]">PAYÉES</option>
                            <option value="emise" className="bg-[#0d2870]">ÉMISES</option>
                            <option value="en_retard" className="bg-[#0d2870]">RECORT / RETARD</option>
                        </select>
                    </div>
                </div>

                <div className="hidden md:block ml-auto text-[10px] font-black text-white/60 uppercase tracking-[0.2em] border-l border-white/10 pl-6">
                    ID FISCAL : <span className="text-yellow-400">{assujetti.identifiantFiscal}</span>
                </div>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredNotes.map((note) => (
                        <motion.div
                            key={note.id}
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setSelectedNote(note)}
                            className="bg-white p-6 rounded-lg border-2 border-slate-100 group/card relative overflow-hidden transition-all hover:border-[#0d2870] cursor-pointer shadow-none active:scale-[0.98]"
                        >
                            <div className="flex flex-col h-full relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover/card:bg-[#0d2870] group-hover/card:text-white transition-all text-[#0d2870]">
                                        <Receipt className="w-7 h-7" />
                                    </div>
                                    <Badge className={cn("text-[9px] font-black px-3 py-1.5 uppercase tracking-[0.1em] rounded shadow-none border-b-2", getStatusStyles(note.statut))}>
                                        {getStatusLabel(note.statut)}
                                    </Badge>
                                </div>

                                <div className="space-y-1 mb-8">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">EXERCICE {note.exercice}</p>
                                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-sm" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase group-hover/card:text-[#0d2870] transition-colors leading-none">
                                        NOTE N° {note.id.substring(0, 8).toUpperCase()}
                                    </h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-2">
                                        REF: {note.numeroNote || "PENDING_REGISTRATION"}
                                    </p>
                                </div>

                                <div className="mt-auto pt-6 border-t border-slate-100 flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">MONTANT CERTIFIÉ</p>
                                        <p className="text-2xl font-black text-[#0d2870] tracking-tighter">
                                            {formatCurrency(note.montantTotalDu)}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center transition-all group-hover/card:bg-red-600 shadow-none">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>

                            {/* Technical Grid Overlay Decoration */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Note Details Side-Panel/Modal */}
            <AnimatePresence>
                {selectedNote && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 md:p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedNote(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[998] pointer-events-auto"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 right-0 w-full max-w-md h-screen bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.3)] border-l-4 border-[#0d2870] overflow-hidden z-[999] flex flex-col pointer-events-auto"
                        >
                            {/* Panel Header - Professional Blue Look */}
                            <div className="p-6 flex items-center justify-between bg-[#0d2870] border-b-2 border-yellow-400 shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center border-b-2 border-yellow-600">
                                        <Receipt className="w-5 h-5 text-slate-900" />
                                    </div>
                                    <div>
                                        <h2 className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] leading-none mb-1">Technical Certification</h2>
                                        <p className="text-base font-black text-white tracking-tighter uppercase">Dossier N° {selectedNote.numeroNote || selectedNote.id.substring(0, 8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedNote(null)}
                                    className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-red-600 rounded-md transition-all text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Panel Content - Compact Technical */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                                {/* Status Alert Strip */}
                                <div className={cn("p-4 rounded-lg border flex items-center justify-between", getStatusStyles(selectedNote.statut))}>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">ÉTAT DU REGISTRE</p>
                                        <p className="text-sm font-black uppercase tracking-tight">{getStatusLabel(selectedNote.statut)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">ÉCHÉANCE LIMITE</p>
                                        <p className="text-xs font-black">{selectedNote.dateEcheance ? format(new Date(selectedNote.dateEcheance), 'dd MMMM yyyy', { locale: fr }).toUpperCase() : 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Certification Details Card */}
                                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                                    {/* Security Section - More Compact */}
                                    <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center space-y-4">
                                        <div className="w-full flex justify-center relative">
                                            <div className="absolute top-0 right-0 text-[7px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 px-1.5 py-0.5 rounded">
                                                SECURITY_TOKEN_VERIFIED
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <TaxationQRCode data={qrDataMap[selectedNote.id] || ""} size={100} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Secured by RTNC</p>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">REDEVANCE TOTALE CERTIFIÉE</p>
                                            <p className="text-4xl font-black text-[#0d2870] tracking-tighter">
                                                {formatCurrency(selectedNote.montantTotalDu)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Data Grid - List Style for Width */}
                                    <div className="p-5 space-y-4 text-[11px]">
                                        <div className="flex justify-between items-start py-1 border-b border-slate-50">
                                            <span className="font-black text-slate-400 uppercase tracking-widest text-[8px]">Bénéficiaire</span>
                                            <span className="font-bold text-slate-900 text-right max-w-[200px]">{assujetti.nomRaisonSociale}</span>
                                        </div>
                                        <div className="flex justify-between items-start py-1 border-b border-slate-50">
                                            <span className="font-black text-slate-400 uppercase tracking-widest text-[8px]">Localisation</span>
                                            <span className="font-bold text-slate-700 text-right max-w-[200px]">{assujetti.adresseSiege}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                            <span className="font-black text-slate-400 uppercase tracking-widest text-[8px]">Identifiant Fiscal</span>
                                            <span className="font-black text-slate-900 tracking-tighter uppercase">{assujetti.identifiantFiscal}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="font-black text-slate-400 uppercase tracking-widest text-[8px]">Date Certification</span>
                                            <span className="font-bold text-slate-700">{selectedNote.dateEmission ? format(new Date(selectedNote.dateEmission), 'dd/MM/yyyy') : 'N/A'}</span>
                                        </div>
                                    </div>

                                    {/* Breakdown Section - Dark Blue */}
                                    <div className="bg-[#0d2870] p-5 space-y-3">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.15em] text-white/50">
                                            <span>PRINCIPAL / NET</span>
                                            <span className="text-white">{formatCurrency(selectedNote.montantNet)}</span>
                                        </div>
                                        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                            <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em]">TOTAL GÉNÉRAL DÛ</span>
                                            <span className="text-xl font-black text-white tracking-tighter">{formatCurrency(selectedNote.montantTotalDu)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel Footer - Actions */}
                            <div className="p-6 bg-white border-t border-slate-100 flex flex-col gap-3 shrink-0">
                                <PDFDownloadButton
                                    className="w-full h-12 rounded-lg font-black uppercase tracking-[0.2em] text-[10px] gap-2 shadow-none border-none transition-all"
                                    entityName={assujetti.nomRaisonSociale}
                                    data={{
                                        identifiantFiscal: assujetti.identifiantFiscal,
                                        numeroNote: selectedNote.numeroNote,
                                        exercice: selectedNote.exercice,
                                        montantNet: Number(selectedNote.montantNet),
                                        totalUSD: Number(selectedNote.montantTotalDu),
                                        totalFC: Number(selectedNote.montantTotalDu) * 2850, // Fallback rate
                                        rate: 2850,
                                        representant: assujetti.representantLegal,
                                        adresse: assujetti.adresseSiege,
                                        rccm: assujetti.rccm,
                                        nif: assujetti.nif,
                                        idNat: assujetti.idNat,
                                        sousType: assujetti.sousTypePm || "PM",
                                        location: {
                                            province: "Kinshasa", // Simplified for now as we don't have full breakdown here
                                            ville: "Kinshasa",
                                            commune: "Kinshasa",
                                            quartier: ""
                                        },
                                        items: [
                                            { label: "REDEVANCE AUDIOVISUELLE", qty: 1, pu: Number(selectedNote.montantTotalDu) }
                                        ],
                                        qrData: qrDataMap[selectedNote.id] || ""
                                    }}
                                />
                                {selectedNote.statut !== "payee" && (
                                    <Link href="/assujetti/redevance/paiement" className="block w-full">
                                        <Button
                                            className="w-full h-12 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-[10px] gap-2 shadow-none border-none transition-all"
                                        >
                                            <Receipt className="w-4 h-4" /> RÉGLER LA NOTE
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
