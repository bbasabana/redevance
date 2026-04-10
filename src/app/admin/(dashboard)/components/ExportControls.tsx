"use client";

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { SummaryReportPDF } from '@/components/pdf/SummaryReportPDF';
import { exportToCSV } from '@/lib/utils/export';
import { getReportData } from '@/app/actions/admin-analytics';
import { toast } from 'sonner';

export function ExportControls() {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const prepareData = async () => {
        setLoading(true);
        try {
            const data = await getReportData();
            if (data) {
                setReportData(data);
                return data;
            } else {
                toast.error("Impossible de récupérer les données du rapport");
            }
        } catch (err) {
            toast.error("Erreur lors de la préparation du rapport");
        } finally {
            setLoading(false);
        }
    };

    const handleCSVExport = async () => {
        const data = await prepareData();
        if (data) {
            // Flatten evolution data for CSV
            const csvData = data.evolution.map((e: any) => ({
                "Mois": e.name,
                "Taxe Estimée ($)": e.taxed.toFixed(2),
                "Total Collecté ($)": e.collected.toFixed(2),
                "Taux (%)": ((e.collected / (e.taxed || 1)) * 100).toFixed(1)
            }));
            exportToCSV(csvData, `RTNC_Recettes_Mensuelles_${new Date().getFullYear()}.csv`);
            toast.success("Fichier Excel/CSV généré");
        }
    };

    return (
        <div className="flex items-center gap-3">
            <button 
                onClick={handleCSVExport}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                Exporter Excel
            </button>

            <PDFHandler reportData={reportData} onPrepare={prepareData} />
        </div>
    );
}

function PDFHandler({ reportData, onPrepare }: { reportData: any, onPrepare: () => Promise<any> }) {
    const [preparing, setPreparing] = useState(false);

    if (!reportData) {
        return (
            <button 
                onClick={async () => {
                    setPreparing(true);
                    await onPrepare();
                    setPreparing(false);
                }}
                disabled={preparing}
                className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] rounded-xl text-white text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 group"
            >
                {preparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />}
                Rapport PDF
            </button>
        );
    }

    return (
        <PDFDownloadLink
            document={<SummaryReportPDF stats={reportData.stats} evolution={reportData.evolution} distribution={reportData.distribution} />}
            fileName={`RTNC_Rapport_Strategique_${new Date().getFullYear()}.pdf`}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-xl text-white text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 animate-in fade-in zoom-in duration-300"
        >
            {({ loading }) => (
                <>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Prêt - Télécharger
                </>
            )}
        </PDFDownloadLink>
    );
}
