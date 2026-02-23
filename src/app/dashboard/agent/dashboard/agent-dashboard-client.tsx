"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    Search,
    ClipboardList,
    User,
    Bell,
    ChevronRight,
    Plus,
    Activity,
    CheckCircle2,
    Clock,
    DollarSign,
    LogOut,
    ShieldCheck,
    MapPin,
    AlertCircle,
    ArrowRight,
    Loader2,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileBottomNav, AgentTab } from "@/components/agent/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { searchAssujettiAction } from "../actions";
import { toast } from "sonner";
import { clearSession } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { FieldControlWorkflow } from "@/components/agent/FieldControlWorkflow";
import { useEffect, useState as useReactState } from "react";
import { getAgentDashboardStats } from "../actions";

interface AgentDashboardClientProps {
    agentId: string;
    communeName: string;
}

export default function AgentDashboardClient({ agentId, communeName }: AgentDashboardClientProps) {
    const [activeTab, setActiveTab] = useState<AgentTab>("home");
    const [isPending, startTransition] = useTransition();
    const [activeControlAssujetti, setActiveControlAssujetti] = useState<any | null>(null);
    const [stats, setStats] = useState<{
        dailyCount: number;
        monthlyTotal: number;
        recentActivities: {
            id: string;
            assujettiName: string;
            assujettiId: string | null;
            date: Date | null;
            amount: number;
            status: string;
        }[];
    } | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            const res = await getAgentDashboardStats();
            if (res.success && res.data) {
                setStats(res.data);
            }
            setIsLoadingStats(false);
        };
        fetchStats();
    }, []);

    const handleLogout = async () => {
        await clearSession();
        toast.success("Déconnexion réussie");
        router.push("/panel/signin");
    };

    return (
        <div className="flex flex-col h-full">
            {/* Control Workflow Overlay */}
            <AnimatePresence>
                {activeControlAssujetti && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[100]"
                    >
                        <FieldControlWorkflow
                            assujetti={{
                                id: activeControlAssujetti.id,
                                identifiantFiscal: activeControlAssujetti.identifiantFiscal,
                                nomRaisonSociale: activeControlAssujetti.nomRaisonSociale,
                                typePersonne: activeControlAssujetti.typePersonne,
                                nif: activeControlAssujetti.nif,
                                rccm: activeControlAssujetti.rccm,
                                representantLegal: activeControlAssujetti.representantLegal,
                                adresseSiege: activeControlAssujetti.adresseSiege,
                                nbTvDeclare: activeControlAssujetti.nbTvDeclare || 0,
                                nbRadioDeclare: activeControlAssujetti.nbRadioDeclare || 0,
                            }}
                            onClose={() => setActiveControlAssujetti(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area with Transitions */}
            <div className="flex-1 pb-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {activeTab === "home" && (
                            <HomeTab
                                agentId={agentId}
                                communeName={communeName}
                                stats={stats}
                                isLoading={isLoadingStats}
                                onStartSearch={() => setActiveTab("search")}
                                onQuickControl={() => setActiveTab("search")}
                                onRefresh={async () => {
                                    const res = await getAgentDashboardStats();
                                    if (res.success && res.data) setStats(res.data);
                                }}
                            />
                        )}
                        {activeTab === "search" && (
                            <SearchTab onSelectAssujetti={setActiveControlAssujetti} />
                        )}
                        {activeTab === "reports" && (
                            <ReportsTab />
                        )}
                        {activeTab === "profile" && (
                            <ProfileTab agentId={agentId} communeName={communeName} onLogout={handleLogout} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}

// --- SUB-COMPONENTS FOR TABS ---

function HomeTab({
    agentId,
    communeName,
    stats,
    isLoading,
    onStartSearch,
    onQuickControl,
    onRefresh
}: {
    agentId: string,
    communeName: string,
    stats: {
        dailyCount: number;
        monthlyTotal: number;
        recentActivities: {
            id: string;
            assujettiName: string;
            assujettiId: string | null;
            date: Date | null;
            amount: number;
            status: string;
        }[];
    } | null,
    isLoading: boolean,
    onStartSearch: () => void,
    onQuickControl: () => void,
    onRefresh: () => Promise<void>
}) {
    return (
        <div className="space-y-6 pt-2">
            {/* Welcome Section */}
            <div className="px-1 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Bonjour, Agent</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                        <MapPin size={10} className="text-[#0d2870]" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{communeName}</span>
                    </div>
                </div>
                <button
                    onClick={() => onRefresh()}
                    className={cn(
                        "w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-95 transition-all",
                        isLoading && "animate-spin"
                    )}
                >
                    <Activity size={14} />
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="border-none bg-[#0d2870] text-white overflow-hidden relative shadow-lg shadow-[#0d2870]/20">
                    <div className="absolute -right-2 -bottom-2 opacity-10">
                        <CheckCircle2 size={64} />
                    </div>
                    <CardContent className="p-4">
                        <p className="text-[9px] font-black opacity-70 uppercase tracking-widest">Contrôles (J)</p>
                        <p className="text-2xl font-black mt-1">{isLoading ? "..." : stats?.dailyCount || 0}</p>
                    </CardContent>
                </Card>
                <Card className="border-none bg-emerald-500 text-white overflow-hidden relative shadow-lg shadow-emerald-500/20">
                    <div className="absolute -right-2 -bottom-2 opacity-10">
                        <DollarSign size={64} />
                    </div>
                    <CardContent className="p-4">
                        <p className="text-[9px] font-black opacity-70 uppercase tracking-widest">Collecté (M)</p>
                        <p className="text-2xl font-black mt-1">
                            {isLoading ? "..." : `${stats?.monthlyTotal?.toLocaleString()}$`}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Derniers contrôles</h3>
                    <button className="text-[10px] font-black text-[#0d2870] uppercase">Voir tout</button>
                </div>

                <div className="space-y-2">
                    {isLoading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-16 w-full bg-slate-50 animate-pulse rounded-2xl" />
                        ))
                    ) : stats && stats.recentActivities.length > 0 ? (
                        stats.recentActivities.map((r: any) => (
                            <div key={r.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl group active:bg-slate-50 transition-all border-l-4 border-l-[#0d2870]">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#0d2870]">
                                    <Activity size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black uppercase tracking-tight text-slate-900 truncate">{r.assujettiName}</p>
                                    <p className="text-[9px] font-bold text-slate-400">
                                        {r.date ? new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Date inconnue'}
                                    </p>
                                </div>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase",
                                    r.status === 'PAYÉ' ? "bg-emerald-50 text-emerald-600" :
                                        r.status === 'CONFORME' ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                                )}>
                                    {r.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <Activity size={24} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-[10px] font-black uppercase text-slate-400">Aucun contrôle récent</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
                <button
                    onClick={onQuickControl}
                    className="w-full py-5 bg-[#0d2870] text-white rounded-3xl flex items-center justify-center gap-3 shadow-2xl shadow-[#0d2870]/30 active:scale-95 transition-all outline-none ring-offset-2 focus:ring-2 focus:ring-[#0d2870]"
                >
                    <Plus size={20} className="stroke-[3px]" />
                    <span className="font-black uppercase tracking-[0.15em] text-xs">Effectuer un contrôle</span>
                </button>
            </div>
        </div>
    );
}

function SearchTab({ onSelectAssujetti }: { onSelectAssujetti: (a: any) => void }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        startTransition(async () => {
            const res = await searchAssujettiAction(query);
            if (res.success) {
                setResults(res.data || []);
                if (res.data?.length === 0) {
                    toast.info("Aucun assujetti trouvé");
                }
            } else {
                toast.error(res.error || "Erreur lors de la recherche");
            }
            setIsSearching(false);
        });
    };

    return (
        <div className="space-y-6 pt-4">
            <div className="px-1">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recherche</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Identification par ID Fiscal</p>
            </div>

            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {isSearching ? <Loader2 size={18} className="animate-spin text-[#0d2870]" /> : <Search size={18} />}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Ex: ABC1234D"
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#0d2870] focus:bg-white focus:border-transparent transition-all outline-none"
                    autoFocus
                />
            </div>

            <AnimatePresence mode="wait">
                {results.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{results.length} Résultat(s) trouvé(s)</p>
                        {results.map((r) => (
                            <div key={r.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-3xl group active:bg-slate-50 transition-all shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-[#0d2870]/5 flex items-center justify-center text-[#0d2870]">
                                    <Search size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black uppercase tracking-tight text-slate-900 truncate">{r.nomRaisonSociale}</p>
                                    <p className="text-[10px] font-mono font-bold text-[#0d2870] uppercase">{r.identifiantFiscal}</p>
                                </div>
                                <button
                                    onClick={() => onSelectAssujetti(r)}
                                    className="w-10 h-10 rounded-xl bg-[#0d2870] flex items-center justify-center text-white shadow-lg shadow-[#0d2870]/20 active:scale-90 transition-all"
                                    title="Confirmer & Authentifier"
                                >
                                    <ShieldCheck size={18} />
                                </button>
                            </div>
                        ))}
                    </motion.div>
                ) : !isSearching && query === "" && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                            <Search size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase text-slate-400">En attente de saisie</p>
                            <p className="text-xs text-slate-400">Saisissez au moins 3 caractères</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ReportsTab() {
    return (
        <div className="space-y-6 pt-4">
            <div className="px-1">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight tracking-tighter">Activité</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Historique & Rapports</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <button className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl shadow-sm active:bg-slate-50 transition-all text-left">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase text-slate-900">Historique complet</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Tous vos contrôles terrain</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                </button>
                <button className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl shadow-sm active:bg-slate-50 transition-all text-left">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase text-slate-900">Synthèse journalière</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Rapport financier (J)</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                </button>
            </div>

            <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center space-y-2 grayscale opacity-50">
                <Activity size={24} className="text-slate-300" />
                <p className="text-[10px] font-black uppercase text-slate-400">Statistiques avancées bientôt disponibles</p>
            </div>
        </div>
    );
}

function ProfileTab({ agentId, communeName, onLogout }: { agentId: string, communeName: string, onLogout: () => void }) {
    return (
        <div className="space-y-6 pt-4">
            <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#0d2870] rounded-full blur-3xl opacity-50" />
                <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
                        <User size={40} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-300">Agent de Terrain</p>
                        <h3 className="text-2xl font-black uppercase tracking-tight mt-1">#{agentId}</h3>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{communeName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-1 px-1">
                <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all text-left">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="w-5 h-5 text-slate-400" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">Sécurité & 2FA</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all text-left">
                    <div className="flex items-center gap-4">
                        <AlertCircle className="w-5 h-5 text-slate-400" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">Aide & Support</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                </button>
                <div className="h-px bg-slate-100 my-2" />
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 p-4 hover:bg-red-50 text-red-600 rounded-2xl transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Déconnexion</span>
                </button>
            </div>

            <div className="text-center pt-8">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">v1.2.0 • RTNC MOBILE APP</p>
            </div>
        </div>
    );
}
