"use client";

import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Receipt, Loader2 } from "lucide-react";
import qrcode from "qrcode";
import { QuittancePDF } from "./QuittancePDF";
import { cn } from "@/lib/utils";

interface QuittanceDownloadButtonProps {
    payment: any;
    assujetti: any;
    note: any;
    className?: string;
}

export default function QuittanceDownloadButton({ payment, assujetti, note, className }: QuittanceDownloadButtonProps) {
    const [qrImage, setQrImage] = useState<string | null>(null);

    useEffect(() => {
        // Generate a verification string for the receipt
        const qrContent = `QUITTANCE:RTNC:${payment.id}:${payment.montant}:${payment.referenceTransaction}`;
        qrcode.toDataURL(qrContent, {
            margin: 0,
            scale: 10,
            color: {
                dark: '#0d2870',
                light: '#ffffff'
            }
        }).then(setQrImage).catch(err => console.error("QR Receipt Error:", err));
    }, [payment.id]);

    const receiptData = {
        nif: assujetti.numeroImpot,
        rccm: assujetti.rccm,
        idNat: assujetti.idNat,
        assujettiNom: assujetti.nomRaisonSociale,
        noteNumero: note.numeroNote || "PENDING",
        paiementId: payment.id,
        montantPaye: Number(payment.montant),
        devise: payment.devise || "USD",
        canal: payment.canal,
        reference: payment.referenceTransaction,
        datePaiement: new Date(payment.datePaiement).toLocaleDateString("fr-FR"),
        soldeRestant: Number(note.solde),
        exercice: note.exercice
    };

    return (
        <PDFDownloadLink
            document={<QuittancePDF data={receiptData} qrImage={qrImage} />}
            fileName={`Quittance_${payment.referenceTransaction || payment.id.substring(0,8)}.pdf`}
            className="shrink-0"
        >
            {/* @ts-ignore */}
            {({ loading }: { loading: boolean }) => (
                <button
                    disabled={loading || !qrImage}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all disabled:opacity-50",
                        className
                    )}
                    title="Télécharger la quittance"
                >
                    {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Receipt className="w-3.5 h-3.5" />
                    )}
                    {loading ? "Calcul..." : "Quittance"}
                </button>
            )}
        </PDFDownloadLink>
    );
}
