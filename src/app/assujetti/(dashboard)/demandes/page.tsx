import { getDemandesStats } from "@/lib/declarations/actions";
import {
    FileText,
    Plus,
    ChevronRight,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DemandesPage() {
    const result = await getDemandesStats();

    // Si l'utilisateur n'est pas autorisé ou profil non trouvé, on retourne null 
    // ou on pourrait rediriger, mais pour correspondre au code précédent on garde null
    if (!result.success || !result.data) return null;

    const { list, stats } = result.data;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "soumise": return "bg-blue-50 text-blue-700 border-blue-100";
            case "validee": return "bg-green-50 text-green-700 border-green-100";
            case "contestee": return "bg-red-50 text-red-700 border-red-100";
            default: return "bg-slate-50 text-slate-700 border-slate-100";
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mes Demandes</h1>
                    <p className="text-slate-500 mt-1">Gérez et suivez l'état de vos déclarations de récepteurs.</p>
                </div>
                <Link href="/assujetti/demandes/new">
                    <Button className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/10 gap-2 rounded-xl h-12 px-6">
                        <Plus className="w-5 h-5" />
                        Nouvelle Demande
                    </Button>
                </Link>
            </div>

            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-none rounded-3xl bg-indigo-50/50">
                    <CardContent className="p-6 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                            <h3 className="text-[11px] font-bold text-indigo-900/60 uppercase tracking-widest">Total Demandes</h3>
                            <div className="bg-white p-2 rounded-xl">
                                <FileText className="h-4 w-4 text-indigo-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-black mt-3 text-indigo-900">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-none rounded-3xl bg-blue-50/50">
                    <CardContent className="p-6 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                            <h3 className="text-[11px] font-bold text-blue-900/60 uppercase tracking-widest">En Cours</h3>
                            <div className="bg-white p-2 rounded-xl">
                                <Activity className="h-4 w-4 text-blue-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-black mt-3 text-blue-900">{stats.pending}</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-none rounded-3xl bg-green-50/50">
                    <CardContent className="p-6 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                            <h3 className="text-[11px] font-bold text-green-900/60 uppercase tracking-widest">Validées</h3>
                            <div className="bg-white p-2 rounded-xl">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-black mt-3 text-green-900">{stats.validated}</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-none rounded-3xl bg-purple-50/50">
                    <CardContent className="p-6 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                            <h3 className="text-[11px] font-bold text-purple-900/60 uppercase tracking-widest">Appareils Actifs</h3>
                            <div className="bg-white p-2 rounded-xl">
                                <BarChart3 className="h-4 w-4 text-purple-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-black mt-3 text-purple-900">{stats.devices}</p>
                    </CardContent>
                </Card>
            </div>

            {list.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-none p-12 text-center space-y-5">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                        <FileText className="w-10 h-10" />
                    </div>
                    <div className="max-w-sm mx-auto">
                        <h3 className="text-xl font-bold text-slate-900">Aucune déclaration</h3>
                        <p className="text-sm text-slate-500 mt-2">Vous n'avez pas encore soumis de déclaration pour l'exercice en cours.</p>
                    </div>
                    <Link href="/assujetti/demandes/new">
                        <Button className="mt-4 bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-900/10 rounded-xl">Soumettre ma première déclaration</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {list.map((item) => (
                        <Card key={item.id} className="border-none shadow-none rounded-3xl bg-white hover:bg-slate-50/80 transition-colors cursor-pointer overflow-hidden group">
                            <CardContent className="p-0">
                                <Link href={`/assujetti/demandes/${item.id}`} className="flex items-center p-5 gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-bold text-slate-900">DEM-{item.exercice}-{item.id.split('-')[0].toUpperCase()}</span>
                                            <Badge variant="outline" className={getStatusStyle(item.statut || "")}>
                                                {item.statut === "soumise" && <Clock className="w-3 h-3 mr-1" />}
                                                {item.statut === "validee" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                {item.statut === "contestee" && <AlertCircle className="w-3 h-3 mr-1" />}
                                                {item.statut?.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Exercice {item.exercice}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Soumis le {item.createdAt?.toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-slate-400 font-medium">Nombre d'appareils</p>
                                        <p className="text-lg font-bold text-slate-900">{item.totalAppareils}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
