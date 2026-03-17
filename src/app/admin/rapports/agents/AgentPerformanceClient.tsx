"use client";

import { useState } from "react";
import { type AgentPerformanceRow, getAgentActivityDetailAction } from "./actions";
import { 
    Users, 
    TrendingUp, 
    Activity, 
    DollarSign, 
    ArrowLeft, 
    ChevronRight, 
    ShieldCheck, 
    Calendar,
    MapPin,
    Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from 'recharts';

interface AgentPerformanceClientProps {
    initialData: AgentPerformanceRow[];
}

export function AgentPerformanceClient({ initialData }: AgentPerformanceClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
    const [agentActivities, setAgentActivities] = useState<any[]>([]);
    const [isLoadingActivities, setIsLoadingActivities] = useState(false);

    const filteredData = initialData.filter(item => 
        item.nomPrenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.identifiantAgent?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewActivity = async (agent: AgentPerformanceRow) => {
        setIsLoadingActivities(true);
        const res = await getAgentActivityDetailAction(agent.id);
        if (res.success) {
            setSelectedAgent(agent);
            setAgentActivities(res.data || []);
        } else {
            toast.error(res.error || "Erreur lors du chargement des activités");
        }
        setIsLoadingActivities(false);
    };

    if (selectedAgent) {
        return (
            <AgentActivityView 
                agent={selectedAgent} 
                activities={agentActivities} 
                onBack={() => setSelectedAgent(null)} 
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard 
                    title="Agents Actifs" 
                    value={initialData.length} 
                    icon={<Users className="w-5 h-5 text-indigo-600" />} 
                    description="Agents effectuant des contrôles"
                />
                <KPICard 
                    title="Total Contrôles" 
                    value={initialData.reduce((acc, curr) => acc + curr.nbControles, 0)} 
                    icon={<Activity className="w-5 h-5 text-blue-600" />} 
                    description="Contrôles terrain validés"
                />
                <KPICard 
                    title="Collecte Générée" 
                    value={`${initialData.reduce((acc, curr) => acc + curr.montantRecouvre, 0).toLocaleString()} $`} 
                    icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} 
                    description="Montant total des amendes collectées"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Performance de la Collecte par Agent ($)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={initialData.slice(0, 8)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="nomPrenom" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fill: '#94a3b8', fontWeight: 600 }}
                                />
                                <YAxis 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(val) => `${val}$`}
                                    tick={{ fill: '#94a3b8', fontWeight: 600 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="montantRecouvre" radius={[4, 4, 0, 0]}>
                                    {initialData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Agent List */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input 
                            placeholder="Rechercher un agent..." 
                            className="pl-10 h-10 border-slate-200 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Commune</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Contrôles</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Montant Généré</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dernière activité</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.map((agent) => (
                                <tr key={agent.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                {agent.nomPrenom.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{agent.nomPrenom}</span>
                                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tight">{agent.identifiantAgent}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="text-xs font-medium">{agent.commune || "—"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                                            {agent.nbControles}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-black text-emerald-600 font-mono">
                                            {agent.montantRecouvre.toLocaleString()}$
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-[11px] font-bold uppercase">
                                                {agent.dernierControle ? new Date(agent.dernierControle).toLocaleDateString('fr-FR') : "—"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="hover:bg-indigo-50 hover:text-indigo-600 rounded-lg group"
                                            onClick={() => handleViewActivity(agent)}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest mr-1">Rapport</span>
                                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description: string }) {
    return (
        <Card className="border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {icon}
            </div>
            <CardContent className="p-5">
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                        {icon}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-0.5">{description}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function AgentActivityView({ agent, activities, onBack }: { agent: AgentPerformanceRow, activities: any[], onBack: () => void }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl border border-slate-100 hover:bg-slate-50">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </Button>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{agent.nomPrenom}</h2>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">{agent.identifiantAgent}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-xs font-black uppercase text-slate-400">Résumé de l'Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ActivityItem label="Nombre de contrôles" value={agent.nbControles} />
                        <ActivityItem label="Total collecté" value={`${agent.montantRecouvre.toLocaleString()}$`} color="text-emerald-600" />
                        <ActivityItem label="Zone d'affectation" value={agent.commune || "Non spécifiée"} />
                        <ActivityItem label="Dernier contrôle" value={agent.dernierControle ? new Date(agent.dernierControle).toLocaleDateString() : "Aucun"} />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase text-slate-900 tracking-widest px-1">Journal des contrôles</h3>
                    <div className="space-y-3">
                        {activities.map((act: any) => (
                            <div key={act.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm border-l-4 border-l-indigo-500">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black uppercase text-slate-900 truncate">{act.assujetti}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                        Ex. {act.exercice} · {new Date(act.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-black text-slate-900">{Number(act.montant).toFixed(0)} $</p>
                                    <span className={cn(
                                        "inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                                        act.statutPaiement === 'paye' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                    )}>
                                        {act.statutPaiement === 'paye' ? "Payé" : "Impayé"}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && (
                            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase">Aucun contrôle enregistré</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ActivityItem({ label, value, color }: { label: string, value: string | number, color?: string }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <span className={cn("text-sm font-black", color || "text-slate-900")}>{value}</span>
        </div>
    );
}
