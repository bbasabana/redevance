import { db } from "@/db";
import { assujettis, paiements, controlesTerrain, appUsers, userRoles, roles } from "@/db/schema";
import { count, sql, eq } from "drizzle-orm";
import { 
    Users, 
    CreditCard, 
    Activity, 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight,
    MapPin,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ShieldCheck, Settings, LayoutDashboard } from "lucide-react";

async function getStats() {
    const [totalAssujettis] = await db.select({ value: count() }).from(assujettis);
    const [totalPaiements] = await db.select({ value: sql<string>`SUM(montant)` }).from(paiements).where(eq(paiements.statut, 'confirme'));
    const [totalControles] = await db.select({ value: count() }).from(controlesTerrain);
    
    // Recent activities
    const recentPaiements = await db.select({
        id: paiements.id,
        montant: paiements.montant,
        date: paiements.datePaiement,
        assujetti: assujettis.nomRaisonSociale,
    })
    .from(paiements)
    .innerJoin(assujettis, eq(paiements.assujettiId, assujettis.id))
    .where(eq(paiements.statut, 'confirme'))
    .orderBy(sql`date_paiement DESC`)
    .limit(5);

    return {
        totalAssujettis: totalAssujettis.value,
        totalPaiements: Number(totalPaiements.value || 0),
        totalControles: totalControles.value,
        recentPaiements,
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vue d&apos;ensemble</h1>
                <p className="text-slate-500 font-medium">Reporting en temps réel de la collecte RTNC.</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardStatCard 
                    title="Assujettis Recensés" 
                    value={stats.totalAssujettis} 
                    icon={<Users className="w-5 h-5 text-blue-600" />} 
                    trend="+12% ce mois"
                    trendUp={true}
                    color="bg-blue-50"
                />
                <DashboardStatCard 
                    title="Collecte Totale ($)" 
                    value={stats.totalPaiements.toLocaleString()} 
                    icon={<CreditCard className="w-5 h-5 text-emerald-600" />} 
                    trend="+24% vs 2024"
                    trendUp={true}
                    color="bg-emerald-50"
                />
                <DashboardStatCard 
                    title="Contrôles Terrain" 
                    value={stats.totalControles} 
                    icon={<Activity className="w-5 h-5 text-indigo-600" />} 
                    trend="Stable"
                    trendUp={null}
                    color="bg-indigo-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Derniers Paiements Confirmés</CardTitle>
                        <Link href="/admin/assujettis" className="text-[10px] font-black uppercase text-primary hover:underline">Voir tout</Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {stats.recentPaiements.map((p) => (
                                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-100 shadow-sm">
                                            $
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 truncate max-w-[180px]">{p.assujetti}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{new Date(p.date || '').toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-emerald-600 font-mono">+{Number(p.montant).toLocaleString()} $</span>
                                </div>
                            ))}
                            {stats.recentPaiements.length === 0 && (
                                <div className="p-8 text-center text-slate-400 italic text-sm">Aucun paiement récent</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* System Alerts / Quick Links */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-widest px-1">Actions Rapides</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <QuickActionLink 
                            title="Valider Contrôles" 
                            href="/admin/controles-a-valider" 
                            icon={<ShieldCheck className="w-5 h-5" />} 
                            color="bg-indigo-600"
                        />
                        <QuickActionLink 
                            title="Liste Assujettis" 
                            href="/admin/assujettis" 
                            icon={<Users className="w-5 h-5" />} 
                            color="bg-blue-600"
                        />
                        <QuickActionLink 
                            title="Rapports Agents" 
                            href="/admin/rapports/agents" 
                            icon={<TrendingUp className="w-5 h-5" />} 
                            color="bg-emerald-600"
                        />
                        <QuickActionLink 
                            title="Paramètres" 
                            href="/admin/parametres" 
                            icon={<Settings className="w-5 h-5" />} 
                            color="bg-slate-600"
                        />
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-indigo-700 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 scale-150 group-hover:scale-125 transition-transform duration-500">
                           <LayoutDashboard className="w-24 h-24" />
                        </div>
                        <h4 className="font-black text-lg mb-1 tracking-tight">Mode Démo Activé</h4>
                        <p className="text-white/80 text-xs mb-4 leading-relaxed">Vous visualisez les données temps-réel de la collecte nationale de la redevance télévision et radio.</p>
                        <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 border-white/10 text-white text-[10px] font-black uppercase tracking-widest">Générer un rapport PDF</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardStatCard({ title, value, icon, trend, trendUp, color }: any) {
    return (
        <Card className="border-slate-200 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl", color)}>
                        {icon}
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-[10px] font-black uppercase",
                            trendUp === true ? "text-emerald-600" : trendUp === false ? "text-rose-600" : "text-slate-400"
                        )}>
                            {trendUp === true ? <ArrowUpRight className="w-3 h-3" /> : trendUp === false ? <ArrowDownRight className="w-3 h-3" /> : null}
                            {trend}
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function QuickActionLink({ title, href, icon, color }: any) {
    return (
        <Link 
            href={href} 
            className="flex flex-col p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
        >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform", color)}>
                {icon}
            </div>
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{title}</span>
        </Link>
    );
}

