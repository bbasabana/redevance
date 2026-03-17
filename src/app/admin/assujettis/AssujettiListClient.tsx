"use client";

import { useState } from "react";
import { type AssujettiFinancialRow, getAssujettiDetailsAction } from "./actions";
import { 
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    ArrowUpRight,
    DollarSign,
    MapPin,
    Calendar,
    ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface AssujettiListClientProps {
    initialData: AssujettiFinancialRow[];
}

export function AssujettiListClient({ initialData }: AssujettiListClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAssujetti, setSelectedAssujetti] = useState<any | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const filteredData = initialData.filter(item => 
        item.nomRaisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.identifiantFiscal?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetails = async (id: string) => {
        setIsLoadingDetails(true);
        const res = await getAssujettiDetailsAction(id);
        if (res.success) {
            setSelectedAssujetti(res.data);
        } else {
            toast.error(res.error || "Erreur lors du chargement des détails");
        }
        setIsLoadingDetails(false);
    };

    if (selectedAssujetti) {
        return (
            <AssujettiDetailView 
                data={selectedAssujetti} 
                onBack={() => setSelectedAssujetti(null)} 
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Stats Summary Area */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SummaryCard 
                    title="Total Assujettis" 
                    value={initialData.length} 
                    icon={<MapPin className="text-blue-600" />} 
                    color="bg-blue-50" 
                />
                <SummaryCard 
                    title="Total Recouvré" 
                    value={`${initialData.reduce((acc, curr) => acc + curr.totalPaye, 0).toLocaleString()} $`} 
                    icon={<DollarSign className="text-emerald-600" />} 
                    color="bg-emerald-50" 
                />
                <SummaryCard 
                    title="Total Attendu" 
                    value={`${initialData.reduce((acc, curr) => acc + curr.totalDu, 0).toLocaleString()} $`} 
                    icon={<Clock className="text-amber-600" />} 
                    color="bg-amber-50" 
                />
                <SummaryCard 
                    title="Taux de Conformité" 
                    value={`${((initialData.filter(i => i.totalPaye >= i.totalDu && i.totalDu > 0).length / initialData.length) * 100 || 0).toFixed(1)}%`} 
                    icon={<CheckCircle2 className="text-indigo-600" />} 
                    color="bg-indigo-50" 
                />
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                        placeholder="Rechercher par nom ou identifiant fiscal..." 
                        className="pl-10 border-slate-200 focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filtrer
                </Button>
            </div>

            {/* List Table/Cards */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Identité</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Localisation</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Dû</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Payé</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{row.nomRaisonSociale}</span>
                                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{row.identifiantFiscal || "NON DÉFINI"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3 h-3 text-slate-400" />
                                            <span className="text-sm text-slate-600">{row.commune || "—"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-bold text-slate-600 font-mono">{row.totalDu.toLocaleString()}$</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={cn(
                                            "text-sm font-bold font-mono",
                                            row.totalPaye > 0 ? "text-emerald-600" : "text-slate-400"
                                        )}>
                                            {row.totalPaye.toLocaleString()}$
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge 
                                            totalPaye={row.totalPaye} 
                                            totalDu={row.totalDu} 
                                            statut={row.statut} 
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="hover:bg-primary/5 hover:text-primary"
                                            onClick={() => handleViewDetails(row.id)}
                                        >
                                            <Eye className="w-4 h-4 mr-1.5" />
                                            Détails
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 font-medium">Aucun assujetti trouvé</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
    return (
        <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                    <p className="text-lg font-black text-slate-900 leading-tight">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ totalPaye, totalDu, statut }: { totalPaye: number, totalDu: number, statut: string | null }) {
    if (totalPaye >= totalDu && totalDu > 0) {
        return (
            <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase flex items-center gap-1.5 w-fit">
                <CheckCircle2 className="w-3 h-3" />
                En Règle
            </span>
        );
    }
    if (totalPaye > 0) {
        return (
            <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase flex items-center gap-1.5 w-fit">
                <Clock className="w-3 h-3" />
                Partiel
            </span>
        );
    }
    return (
        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1.5 w-fit">
            <AlertCircle className="w-3 h-3" />
            En attente
        </span>
    );
}

function AssujettiDetailView({ data, onBack }: { data: any, onBack: () => void }) {
    const { assujetti, paiements: history, notes } = data;

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            <Button variant="ghost" onClick={onBack} className="gap-2 mb-2 p-0 hover:bg-transparent text-slate-500">
                <ArrowLeft className="w-4 h-4" />
                Retour à la liste
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info Column */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b border-slate-100">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider h-4 flex items-center">Identification</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <DetailRow label="ID Fiscal" value={assujetti.identifiantFiscal} isMono />
                            <DetailRow label="Raison Sociale" value={assujetti.nomRaisonSociale} />
                            <DetailRow label="NIF" value={assujetti.nif} isMono />
                            <DetailRow label="RCCM" value={assujetti.rccm} isMono />
                            <DetailRow label="Représentant" value={assujetti.representantLegal} />
                            <DetailRow label="Adresse" value={assujetti.adresseSiege} />
                            <DetailRow label="Téléphone" value={assujetti.telephonePrincipal} />
                            <DetailRow label="Email" value={assujetti.email} />
                        </CardContent>
                    </Card>
                </div>

                {/* Financial Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider h-4 flex items-center">Historique de Paiement</CardTitle>
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent className="p-0">
                            {history.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <p>Aucun paiement enregistré pour cet assujetti.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Canal</th>
                                            <th className="px-6 py-3">Référence</th>
                                            <th className="px-6 py-3 text-right">Montant</th>
                                            <th className="px-6 py-3">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {history.map((p: any) => (
                                            <tr key={p.id} className="text-sm">
                                                <td className="px-6 py-4">{new Date(p.datePaiement).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-medium uppercase text-[11px]">{p.canal}</td>
                                                <td className="px-6 py-4 font-mono text-xs">{p.referenceTransaction}</td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-600">{Number(p.montant).toLocaleString()}$</td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                                        p.statut === 'confirme' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                                    )}>
                                                        {p.statut}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider h-4 flex items-center">Notes de Taxation / Dettes</CardTitle>
                            <ArrowUpRight className="w-4 h-4 text-blue-600" />
                        </CardHeader>
                        <CardContent className="p-0">
                            {notes.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <p>Aucune note de taxation émise.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-3">N° Note</th>
                                            <th className="px-6 py-3 text-right">Montant Dû</th>
                                            <th className="px-6 py-3">Exercice</th>
                                            <th className="px-6 py-3">Date émission</th>
                                            <th className="px-6 py-3">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {notes.map((n: any) => (
                                            <tr key={n.id} className="text-sm">
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{n.numeroNote || "—"}</td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-700">{Number(n.montantTotalDu).toLocaleString()}$</td>
                                                <td className="px-6 py-4 italic font-medium">{n.exercice}</td>
                                                <td className="px-6 py-4">{n.dateEmission ? new Date(n.dateEmission).toLocaleDateString() : "—"}</td>
                                                <td className="px-6 py-4 capitalize">{n.statut}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}

function DetailRow({ label, value, isMono }: { label: string, value: string | null, isMono?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className={cn(
                "text-sm font-semibold truncate",
                isMono ? "font-mono" : "text-slate-900"
            )}>
                {value || "—"}
            </p>
        </div>
    );
}
