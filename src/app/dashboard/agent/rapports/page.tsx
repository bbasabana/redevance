"use client";

import React, { useEffect, useState } from "react";
import { StatCardsGrid } from "@/components/agent/StatCards";
import { RevenueChart, DistributionChart } from "@/components/agent/Charts";
import { getGlobalStats, getMonthlyEvolution, getDistributionByCommune } from "@/lib/analytics/actions";
import { Download, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/utils/export";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { SummaryReportPDF } from "@/components/pdf/SummaryReportPDF";

export default function RapportsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [evolution, setEvolution] = useState<any[]>([]);
    const [distribution, setDistribution] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [s, e, d] = await Promise.all([
                getGlobalStats(),
                getMonthlyEvolution(),
                getDistributionByCommune()
            ]);
            setStats(s);
            setEvolution(e);
            setDistribution(d);
        } catch (error) {
            toast.error("Erreur lors de la récupération des statistiques");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExportCSV = () => {
        if (!stats) return;
        const exportData = [
            { Indicateur: "Total Taxé", Valeur: stats.totalTaxed },
            { Indicateur: "Total Collecté", Valeur: stats.totalCollected },
            { Indicateur: "Taux de Recouvrement", Valeur: stats.collectionRate.toFixed(2) + "%" },
            { Indicateur: "Assujettis Actifs", Valeur: stats.activeAssujettis },
            { Indicateur: "Arriérés", Valeur: stats.totalOverdue },
        ];
        exportToCSV(exportData, `rapport-redevance-${new Date().toISOString().split('T')[0]}.csv`);
        toast.success("Rapport CSV exporté avec succès");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-slate-500 animate-pulse">Chargement des données analytiques...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Rapports & Analytics</h1>
                    <p className="text-slate-500">Vue d'ensemble de la performance et de la collecte</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                        <Download className="w-4 h-4" />
                        Exporter Excel
                    </Button>
                    {stats && (
                        <PDFDownloadLink
                            document={<SummaryReportPDF stats={stats} evolution={evolution} distribution={distribution} />}
                            fileName={`rapport-officiel-${new Date().toISOString().split('T')[0]}.pdf`}
                        >
                            {({ loading: pdfLoading }) => (
                                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" disabled={pdfLoading}>
                                    <FileText className="w-4 h-4" />
                                    {pdfLoading ? "Génération..." : "Rapport PDF"}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    )}
                </div>
            </div>

            {stats && <StatCardsGrid stats={stats} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart data={evolution} />
                </div>
                <div>
                    <DistributionChart data={distribution} />
                </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-center justify-between">
                <div className="space-y-1">
                    <h4 className="font-bold text-indigo-900">Besoin d'un rapport détaillé ?</h4>
                    <p className="text-sm text-indigo-700 max-w-md">
                        Les rapports PDF officiels incluent le détail par agent et par commune pour la direction générale.
                    </p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700">Générer Rapport Annuel</Button>
            </div>
        </div>
    );
}
