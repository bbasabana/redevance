"use client";

import { useState } from "react";
import { type AssujettiFinancialRow, getAssujettiDetailsAction } from "./actions";
import { confirmPayment } from "@/app/actions/payments";
import { useRouter } from "next/navigation";
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
    ArrowLeft,
    Monitor,
    Radio,
    FileText,
    Receipt,
    Wallet,
    Info,
    Loader2,
    ShieldCheck,
    History
} from "lucide-react";
import dynamic from "next/dynamic";

const QuittanceDownloadButton = dynamic(() => import("@/components/assujetti/QuittanceDownloadButton"), { ssr: false });
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
    if (totalPaye > 0 || totalDu > 0) {
        return (
            <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase flex items-center gap-1.5 w-fit">
                <Clock className="w-3 h-3" />
                {totalPaye > 0 ? "Partiel" : "Redevable"}
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
    const router = useRouter();
    const { assujetti, paiements: history, notes, declarations } = data;
    const [isConfirming, setIsConfirming] = useState<string | null>(null);

    const handleConfirm = async (paymentId: string) => {
        setIsConfirming(paymentId);
        try {
            const res = await confirmPayment(paymentId);
            if (res.success) {
                toast.success("Paiement confirmé avec succès");
                onBack(); // Simple Refresh by closing view
            } else {
                toast.error(res.error || "Erreur lors de la confirmation");
            }
        } catch (error) {
            toast.error("Erreur de connexion");
        } finally {
            setIsConfirming(null);
        }
    };

    const totalDue = notes.reduce((acc: number, curr: any) => acc + Number(curr.montantTotalDu), 0);
    const totalPaid = history.reduce((acc: number, curr: any) => acc + Number(curr.montant), 0);
    const balance = totalDue - totalPaid;

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 pb-12"
        >
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack} className="gap-2 p-0 hover:bg-transparent text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la liste
                </Button>
                <div className="flex items-center gap-3">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 font-bold uppercase text-[10px] tracking-widest">Générer Certificat</Button>
                    <Button variant="outline" size="sm" className="font-bold uppercase text-[10px] tracking-widest">Imprimer Relevé</Button>
                </div>
            </div>

            {/* Powerful Recap Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RecapCard 
                    title="Montant Total Taxé" 
                    value={`${totalDue.toLocaleString()} $`} 
                    icon={<Receipt className="w-5 h-5" />} 
                    color="text-indigo-600"
                    bgColor="bg-indigo-50"
                />
                <RecapCard 
                    title="Montant Total Payé" 
                    value={`${totalPaid.toLocaleString()} $`} 
                    icon={<Wallet className="w-5 h-5" />} 
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                />
                <RecapCard 
                    title="Reste à Payer" 
                    value={`${balance.toLocaleString()} $`} 
                    icon={<AlertCircle className="w-5 h-5" />} 
                    color={balance > 0 ? "text-rose-600" : "text-emerald-600"}
                    bgColor={balance > 0 ? "bg-rose-50" : "bg-emerald-50"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Profile Section */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-4">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Profil Assujetti
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <DetailRow label="ID Fiscal" value={assujetti.identifiantFiscal} isMono />
                            <DetailRow label="Nom / Raison Sociale" value={assujetti.nomRaisonSociale} className="text-lg font-black text-slate-900" />
                            <div className="grid grid-cols-2 gap-4">
                                <DetailRow label="NIF" value={assujetti.nif} isMono />
                                <DetailRow label="RCCM" value={assujetti.rccm} isMono />
                            </div>
                            <DetailRow label="Type" value={assujetti.typePersonne === 'pp' ? 'Particulier' : 'Entreprise'} />
                            <DetailRow label="Représentant" value={assujetti.representantLegal} />
                            <DetailRow label="Adresse" value={assujetti.adresseSiege} />
                            <DetailRow label="Contact" value={`${assujetti.telephonePrincipal || ''} ${assujetti.email ? '· ' + assujetti.email : ''}`} />
                        </CardContent>
                    </Card>

                    {/* Quick Stats Column */}
                    <Card className="shadow-sm border-slate-200 rounded-2xl bg-slate-900 text-white p-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Statut de Conformité</h4>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center text-xl font-black",
                                balance <= 0 ? "bg-emerald-500" : "bg-amber-500"
                            )}>
                                {balance <= 0 ? "A" : "B"}
                            </div>
                            <div>
                                <p className="font-bold text-lg">{balance <= 0 ? "En Règle" : "Partiellement Mis à Jour"}</p>
                                <p className="text-xs text-slate-400">Dernière mise à jour : {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                            <div 
                                className="bg-emerald-500 h-full transition-all" 
                                style={{ width: `${Math.min((totalPaid / (totalDue || 1)) * 100, 100)}%` }} 
                            />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 text-right uppercase tracking-tighter">
                           Progression Paiement : {((totalPaid / (totalDue || 1)) * 100).toFixed(0)}%
                        </p>
                    </Card>
                </div>

                {/* Main Content Sections */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Declarations (Powerful detail) */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-black uppercase text-slate-900 tracking-widest flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-600" />
                                Historique des Déclarations
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{declarations.length} total</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {declarations.map((d: any) => (
                                <Card key={d.id} className="border-slate-200 shadow-sm overflow-hidden hover:border-indigo-200 transition-colors">
                                    <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">Ex. {d.exercice}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(d.dateDeclaration).toLocaleDateString()}</span>
                                        </div>
                                        <StatusBadgeDetailed status={d.statut} />
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
                                            {d.lignes.map((l: any) => (
                                                <div key={l.id} className="p-4 flex flex-col items-center justify-center text-center">
                                                    {l.categorieAppareil.toLowerCase().includes('tv') ? <Monitor className="w-4 h-4 text-slate-400 mb-1" /> : <Radio className="w-4 h-4 text-slate-400 mb-1" />}
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{l.categorieAppareil}</span>
                                                    <span className="text-xl font-black text-slate-900 leading-none">{l.nombre}</span>
                                                </div>
                                            ))}
                                            <div className="p-4 flex flex-col items-center justify-center text-center bg-indigo-50/30">
                                                <DollarSign className="w-4 h-4 text-indigo-600 mb-1" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Montant Estimé</span>
                                                <span className="text-xl font-black text-indigo-600 leading-none">{d.lignes.reduce((acc: number, curr: any) => acc + Number(curr.montantLigne), 0).toLocaleString()}$</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {declarations.length === 0 && (
                                <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-2xl italic text-slate-400 text-sm">
                                    Aucune déclaration disponible.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Unified Payments & Notes Ledger */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-black uppercase text-slate-900 tracking-widest flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-emerald-600" />
                                Journal Financier Elaboré
                            </h3>
                        </div>
                        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Exercice</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / Opération</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Détails / Réf</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Montant</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {/* Simplified Ledger combining notes and payments */}
                                        {nodesToHistory(notes, history).map((item, idx) => (
                                            <tr key={idx} className={cn(
                                                "hover:bg-slate-50/50 transition-colors",
                                                item.type === 'note' ? "bg-slate-50/30" : ""
                                            )}>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-900">{new Date(item.date).toLocaleDateString()}</span>
                                                        <span className="text-[10px] font-mono font-bold text-indigo-500">EX. {item.exercice}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                                                            item.type === 'note' ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-600"
                                                        )}>
                                                            {item.type === 'note' ? <Receipt className="w-3.5 h-3.5" /> : <Wallet className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <span className="text-[11px] font-black uppercase text-slate-700">
                                                            {item.type === 'note' ? 'Taxation' : `Paiement ${item.canal}`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px] block">{item.ref || '—'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className={cn(
                                                            "text-sm font-black font-mono",
                                                            item.type === 'note' ? "text-slate-900" : "text-emerald-600"
                                                        )}>
                                                            {item.type === 'note' ? '-' : '+'}{Number(item.montant).toLocaleString()}$
                                                        </span>
                                                        {item.type === 'paiement' && item.statut === 'en_attente' && (
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                className="mt-2 h-7 px-2 text-[8px] font-black uppercase border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                                onClick={() => handleConfirm(item.id)}
                                                                disabled={isConfirming === item.id}
                                                            >
                                                                {isConfirming === item.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ShieldCheck className="w-3 h-3 mr-1" />}
                                                                Valider
                                                            </Button>
                                                        )}
                                                        {item.type === 'paiement' && item.statut === 'confirme' && (
                                                            <div className="flex flex-col items-end gap-1 mt-1">
                                                                <span className="text-[8px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                                                                    <CheckCircle2 className="w-2 h-2" /> Confirmé
                                                                </span>
                                                                <QuittanceDownloadButton 
                                                                    payment={item.sourcePayment}
                                                                    assujetti={assujetti}
                                                                    note={item.sourceNote}
                                                                    className="h-6 px-1.5 py-0"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </section>
                </div>
            </div>
        </motion.div>
    );
}

// Helper to merge and sort notes and payments chronologically
function nodesToHistory(notes: any[], payments: any[]) {
    const history: any[] = [];
    notes.forEach(n => history.push({ 
        date: n.dateEmission || n.createdAt, 
        exercice: n.exercice, 
        type: 'note', 
        montant: n.montantTotalDu, 
        ref: n.numeroNote,
        canal: null,
        sourceNote: n
    }));
    payments.forEach(p => {
        const relatedNote = notes.find(n => n.id === p.noteTaxationId);
        history.push({ 
            id: p.id,
            date: p.datePaiement, 
            exercice: relatedNote?.exercice || null, 
            type: 'paiement', 
            montant: p.montant, 
            ref: p.referenceTransaction,
            canal: p.canal,
            statut: p.statut,
            sourcePayment: p,
            sourceNote: relatedNote
        });
    });
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function StatusBadgeDetailed({ status }: { status: string }) {
    const config: any = {
        validee: { label: "Validée", class: "bg-emerald-50 text-emerald-600 border-emerald-100" },
        soumise: { label: "Soumise", class: "bg-blue-50 text-blue-600 border-blue-100" },
        brouillon: { label: "Brouillon", class: "bg-slate-100 text-slate-500 border-slate-200" },
    };
    const s = config[status] || { label: status, class: "bg-slate-100" };
    return (
        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase border", s.class)}>
            {s.label}
        </span>
    );
}

function RecapCard({ title, value, icon, color, bgColor }: any) {
    return (
        <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                    <p className={cn("text-2xl font-black tracking-tight", color)}>{value}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bgColor, color)}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}

function DetailRow({ label, value, isMono, className }: { label: string, value: string | null, isMono?: boolean, className?: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className={cn(
                "font-bold leading-tight",
                isMono ? "font-mono text-xs" : "text-sm",
                className || "text-slate-800"
            )}>
                {value || "—"}
            </p>
        </div>
    );
}
