"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    CreditCard,
    Smartphone,
    Building2,
    ChevronRight,
    Upload,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { recordPayment } from "@/lib/payments/actions";
import { useRouter } from "next/navigation";

interface PaymentReportFormProps {
    noteId: string;
    amount: number;
    noteNumber: string;
}

export function PaymentReportForm({ noteId, amount, noteNumber }: PaymentReportFormProps) {
    const [loading, setLoading] = useState(false);
    const [canal, setCanal] = useState<any>("banque");
    const [formData, setFormData] = useState({
        reference: "",
        datePaiement: new Date().toISOString().split("T")[0],
        preuveUrl: "",
    });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await recordPayment({
                noteTaxationId: noteId,
                montant: amount,
                canal,
                referenceTransaction: formData.reference,
                datePaiement: formData.datePaiement,
                preuveUrl: "https://example.com/mock-receipt.jpg", // Placeholder for actual upload logic
            });

            if (result.success) {
                toast.success("Paiement signalé avec succès ! Il sera validé par un agent sous peu.");
                router.push("/assujetti/mes-notes");
            } else {
                toast.error("Erreur lors de l'enregistrement du paiement.");
            }
        } catch (err) {
            toast.error("Une erreur inattendue est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { id: "banque", label: "Virement Bancaire", icon: Building2 },
                    { id: "mtn_money", label: "MTN Money", icon: Smartphone },
                    { id: "airtel_money", label: "Airtel Money", icon: Smartphone },
                    { id: "orange_money", label: "Orange Money", icon: Smartphone },
                ].map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setCanal(item.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${canal === item.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-100 bg-white hover:border-primary/50 text-slate-400"
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-bold text-sm">{item.label}</span>
                        {canal === item.id && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                    </button>
                ))}
            </div>

            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Référence de la transaction</Label>
                        <Input
                            placeholder="N° Bordereau ou ID Transaction"
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Date du paiement</Label>
                        <div className="relative">
                            <Input
                                type="date"
                                value={formData.datePaiement}
                                onChange={(e) => setFormData({ ...formData, datePaiement: e.target.value })}
                                required
                            />
                            <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Preuve de paiement (Photo/PDF)</Label>
                    <div className="border-2 border-dashed rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group">
                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2 group-hover:text-primary transition-colors" />
                        <p className="text-sm text-slate-500 font-medium">Cliquez pour téléverser votre preuve</p>
                        <p className="text-xs text-slate-400 mt-1">JPG, PNG ou PDF (max 10MB)</p>
                    </div>
                </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary/80 leading-relaxed">
                    Votre paiement sera examiné manuellement par nos services. Veillez à ce que la référence corresponde exactement à celle figurant sur votre preuve de paiement.
                </p>
            </div>

            <Button
                type="submit"
                className="w-full py-6 rounded-xl bg-primary hover:bg-primary/95 text-white text-lg font-bold shadow-lg shadow-primary/20"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Traitement...
                    </>
                ) : (
                    <>
                        Confirmer le Paiement de {amount}$
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                )}
            </Button>
        </form>
    );
}
