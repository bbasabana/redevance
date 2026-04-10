import { getAdminKpis, getRevenueTimeline, getGeographicPerformance } from "@/app/actions/admin-analytics";
import { 
    TrendingUp, 
    Users, 
    Tv, 
    DollarSign, 
    ArrowUpRight, 
    ArrowDownRight,
    MapPin,
    Radio
} from "lucide-react";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from "recharts";
import { AnalyticsClient } from "./components/AnalyticsClient";
import { ExportControls } from "./components/ExportControls";

export default async function AdminDashboardPage() {
    const [kpis, timeline, geoStats] = await Promise.all([
        getAdminKpis(),
        getRevenueTimeline(),
        getGeographicPerformance()
    ]);

    if (!kpis) return <div>Erreur lors du chargement des données.</div>;

    const COLORS = ['#0f172a', '#eab308', '#6366f1', '#f43f5e'];

    const deviceData = [
        { name: 'TV / Téléviseurs', value: kpis.tvCount },
        { name: 'Radios', value: kpis.radioCount },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Tableau de Bord Stratégique</h1>
                    <p className="text-slate-500 text-lg mt-1 font-medium">Vue d'ensemble de la redevance nationale RTNC</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                        <button className="px-5 py-2.5 rounded-xl bg-[#0f172a] text-white text-sm font-semibold shadow-lg shadow-indigo-100 transition-all hover:bg-slate-800">Vue Globale</button>
                        <button className="px-5 py-2.5 rounded-xl text-slate-500 text-sm font-semibold hover:bg-slate-50">Par Province</button>
                    </div>
                    <ExportControls />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Recettes Encaissées" 
                    value={`${kpis.totalRevenue.toLocaleString()} $`} 
                    icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
                    trend="+12.5%"
                    trendUp={true}
                    footer="Ce mois-ci"
                    color="emerald"
                />
                <KPICard 
                    title="Assujettis Actifs" 
                    value={kpis.totalAssujettis.toString()} 
                    icon={<Users className="w-6 h-6 text-indigo-600" />}
                    trend="+56"
                    trendUp={true}
                    footer="Nouveaux inscrits"
                    color="indigo"
                />
                <KPICard 
                    title="Performance Fiscale" 
                    value={`${kpis.efficiency.toFixed(1)} %`} 
                    icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
                    trend="-2.1%"
                    trendUp={false}
                    footer="Taux d'émission/encaissement"
                    color="amber"
                />
                <KPICard 
                    title="Parc d'Appareils" 
                    value={kpis.totalDevices.toString()} 
                    icon={<Tv className="w-6 h-6 text-slate-600" />}
                    trend="Stable"
                    trendUp={true}
                    footer="TV & Radio recensés"
                    color="slate"
                />
            </div>

            {/* Middle Section: Revenue & Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Timeline */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-[#0f172a]">Flux Financier</h3>
                            <p className="text-sm text-slate-400 font-medium">Évolution des recettes sur l'exercice</p>
                        </div>
                        <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="h-[350px] w-full relative z-10">
                        <AnalyticsClient type="area" data={timeline} color="#6366f1" />
                    </div>
                    <div className="absolute top-0 right-0 -tr-y-12 tr-x-12 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl" />
                </div>

                {/* Device Distribution */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2">Répartition Appareils</h3>
                    <p className="text-sm text-slate-400 font-medium mb-8">Typologie du parc national</p>
                    <div className="h-[250px] w-full">
                        <AnalyticsClient type="pie" data={deviceData} color="#f43f5e" />
                    </div>
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-slate-900" />
                                <span className="text-sm font-semibold text-slate-600">Téléviseurs</span>
                            </div>
                            <span className="font-bold text-slate-900">{kpis.tvCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <span className="text-sm font-semibold text-slate-600">Postes Radio</span>
                            </div>
                            <span className="font-bold text-slate-900">{kpis.radioCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Geographic Performance */}
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-900/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h3 className="text-2xl font-bold">Performance par Circonscription</h3>
                        <p className="text-indigo-300 font-medium mt-1">Top 10 des communes les plus rentables</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 backdrop-blur-md">
                        <MapPin className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">Voir la carte complète</span>
                    </button>
                </div>
                <div className="h-[400px] w-full">
                    <AnalyticsClient type="bar" data={geoStats} color="#eab308" />
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon, trend, trendUp, footer, color }: any) {
    const colorVariants: any = {
        emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
        amber: "bg-amber-50 text-amber-600 ring-amber-100",
        slate: "bg-slate-50 text-slate-600 ring-slate-100",
    };

    return (
        <div className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-lg shadow-slate-200/40 hover:translate-y-[-4px] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className={`p-3.5 rounded-2xl ring-4 ${colorVariants[color]}`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {trend}
                </div>
            </div>
            <h4 className="text-slate-400 text-sm font-bold mb-1 uppercase tracking-tight">{title}</h4>
            <div className="text-2xl font-black text-[#0f172a]">{value}</div>
            <div className="mt-4 pt-4 border-t border-slate-50 text-[11px] text-slate-400 font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                {footer}
            </div>
        </div>
    );
}
