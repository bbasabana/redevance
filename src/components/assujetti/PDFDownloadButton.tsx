import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import qrcode from "qrcode";
import { TaxNotePDF } from "./TaxNotePDF";

interface PDFDownloadButtonProps {
    data: any;
    entityName: string;
    className?: string;
}

export default function PDFDownloadButton({ data, entityName, className }: PDFDownloadButtonProps) {
    const [qrImage, setQrImage] = useState<string | null>(null);

    useEffect(() => {
        if (data?.qrData) {
            qrcode.toDataURL(data.qrData, {
                margin: 0,
                scale: 10,
                color: {
                    dark: '#0d2870',
                    light: '#ffffff'
                }
            }).then(setQrImage).catch(err => console.error("QR PDF Error:", err));
        }
    }, [data?.qrData]);

    if (!qrImage && data?.qrData) {
        return (
            <button disabled className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-md text-[9px] font-black uppercase tracking-widest cursor-wait",
                className
            )}>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Préparation QR...
            </button>
        );
    }

    return (
        <PDFDownloadLink
            document={<TaxNotePDF data={data} entityName={entityName} qrImage={qrImage} />}
            fileName={`Note_Taxation_${data.identifiantFiscal}.pdf`}
            className="w-full"
        >
            {/* @ts-ignore */}
            {({ loading }: { loading: boolean }) => (
                <button
                    disabled={loading}
                    className={cn(
                        "flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0d2870] text-white rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-[#0a1e54] shadow-sm transition-all disabled:opacity-50",
                        className
                    )}
                >
                    <Download className="w-3.5 h-3.5" />
                    {loading ? "Chargement..." : "télécharger PDF"}
                </button>
            )}
        </PDFDownloadLink>
    );
}

// Helper to make it work since cn isn't imported
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
