"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Tv,
    Radio,
    CreditCard,
    ChevronRight,
    ChevronLeft,
    Calculator,
    FileText,
    PenTool,
    Plus,
    Trash2,
    CheckCircle2,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createDeclaration } from "@/lib/declarations/actions";
import { calculateTaxation } from "@/lib/declarations/calcul";

const categories = [
    { id: "tv", label: "Téléviseur", icon: Tv, price: 10 },
    { id: "radio", label: "Poste Radio", icon: Radio, price: 5 },
    { id: "decodeur", label: "Décodeur", icon: CreditCard, price: 15, hasBouquet: true },
];

const bouquets = [
    { id: "canal_evasion", label: "CANAL+ EVASION", operator: "CANAL+" },
    { id: "canal_access", label: "CANAL+ ACCESS", operator: "CANAL+" },
    { id: "dstv_premium", label: "DSTV PREMIUM", operator: "DSTV" },
];

interface DeclarationFormProps {
    initialSelections?: any[];
}

export function DeclarationForm({ initialSelections = [] }: DeclarationFormProps) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selections, setSelections] = useState<any[]>(initialSelections);
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const addDevice = (catId: string) => {
        const cat = categories.find(c => c.id === catId);
        if (!cat) return;

        setSelections([...selections, {
            id: Math.random().toString(36).substr(2, 9),
            category: cat.label,
            categoryId: cat.id,
            count: 1,
            unitPrice: cat.price,
            subCategory: cat.hasBouquet ? bouquets[0].label : undefined,
            operator: cat.hasBouquet ? bouquets[0].operator : undefined,
        }]);
    };

    const removeDevice = (id: string) => {
        setSelections(selections.filter(s => s.id !== id));
    };

    const updateCount = (id: string, count: number) => {
        setSelections(selections.map(s => s.id === id ? { ...s, count: Math.max(1, count) } : s));
    };

    const updateBouquet = (id: string, bouquetLabel: string) => {
        const b = bouquets.find(bq => bq.label === bouquetLabel);
        setSelections(selections.map(s => s.id === id ? { ...s, subCategory: bouquetLabel, operator: b?.operator } : s));
    };

    const results = calculateTaxation(selections);

    const handleSubmit = async () => {
        if (selections.length === 0) {
            toast.error("Veuillez ajouter au moins un appareil.");
            return;
        }

        setLoading(true);
        try {
            const result = await createDeclaration({
                exercice: new Date().getFullYear(),
                devices: selections.map(s => ({
                    category: s.category,
                    subCategory: s.subCategory,
                    operator: s.operator,
                    count: s.count,
                    unitPrice: s.unitPrice,
                })),
                remarques: "Déclaration soumise via le portail assujetti.",
            });

            if (result.success) {
                toast.success("Déclaration soumise avec succès !");
                router.push("/assujetti/declarations");
            } else {
                toast.error("Erreur lors de la soumission de la déclaration.");
            }
        } catch (err) {
            toast.error("Une erreur inattendue est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Nouvelle Déclaration</h1>
                    <p className="text-muted-foreground">Exercice fiscal {new Date().getFullYear()}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium bg-secondary/50 px-4 py-2 rounded-full border">
                    <span className={step >= 0 ? "text-primary" : "text-muted-foreground"}>Équipements</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className={step >= 1 ? "text-primary" : "text-muted-foreground"}>Récapitulatif</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className={step >= 2 ? "text-primary" : "text-muted-foreground"}>Validation</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div
                        key="step0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {categories.map((cat) => (
                                <Card
                                    key={cat.id}
                                    className="cursor-pointer hover:border-primary/50 transition-colors group relative overflow-hidden"
                                    onClick={() => addDevice(cat.id)}
                                >
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="w-4 h-4 text-primary" />
                                    </div>
                                    <CardContent className="pt-6 text-center">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <cat.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="font-bold">{cat.label}</h3>
                                        <p className="text-xs text-muted-foreground">{cat.price}$ / an</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg">Vos équipements sélectionnés</CardTitle>
                                <CardDescription>Détaillez le nombre d'appareils et les types de bouquets</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selections.length === 0 ? (
                                    <div className="py-12 text-center border-2 border-dashed rounded-xl">
                                        <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                                        <p className="text-muted-foreground">Aucun appareil sélectionné</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selections.map((s) => (
                                            <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border group">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border shadow-sm">
                                                    {s.categoryId === "tv" && <Tv className="w-5 h-5 text-slate-600" />}
                                                    {s.categoryId === "radio" && <Radio className="w-5 h-5 text-slate-600" />}
                                                    {s.categoryId === "decodeur" && <CreditCard className="w-5 h-5 text-slate-600" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm">{s.category}</h4>
                                                    {s.categoryId === "decodeur" ? (
                                                        <select
                                                            className="text-xs bg-transparent border-none p-0 focus:ring-0 text-muted-foreground"
                                                            value={s.subCategory}
                                                            onChange={(e) => updateBouquet(s.id, e.target.value)}
                                                        >
                                                            {bouquets.map(b => (
                                                                <option key={b.id} value={b.label}>{b.label}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground">Redevance annuelle standard</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center border rounded-lg bg-white">
                                                        <button
                                                            className="px-2 py-1 hover:text-primary transition-colors"
                                                            onClick={() => updateCount(s.id, s.count - 1)}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-bold border-x h-8 flex items-center justify-center">
                                                            {s.count}
                                                        </span>
                                                        <button
                                                            className="px-2 py-1 hover:text-primary transition-colors"
                                                            onClick={() => updateCount(s.id, s.count + 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeDevice(s.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-between items-center bg-primary/5 p-6 rounded-2xl border border-primary/10">
                            <div>
                                <p className="text-sm font-medium text-primary">Montant Total Estimé</p>
                                <p className="text-2xl font-bold">{results.montantTotalDu}$ <span className="text-sm font-normal text-muted-foreground">USD</span></p>
                            </div>
                            <Button
                                className="px-8 h-12 rounded-xl"
                                disabled={selections.length === 0}
                                onClick={() => setStep(1)}
                            >
                                Continuer <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <Card className="border-none shadow-xl overflow-hidden">
                            <div className="bg-primary p-6 text-white flex justify-between items-end">
                                <div>
                                    <h2 className="text-xl font-bold">Récapitulatif de Taxation</h2>
                                    <p className="text-primary-foreground/70 text-sm">Vérifiez vos informations avant de valider</p>
                                </div>
                                <div className="text-right">
                                    <Calculator className="w-8 h-8 opacity-20 ml-auto mb-2" />
                                    <p className="text-xs uppercase tracking-widest opacity-60">Total à payer</p>
                                    <p className="text-3xl font-bold">{results.montantTotalDu}$</p>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    {selections.map((s, i) => (
                                        <div key={i} className="flex justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                                            <div>
                                                <p className="font-bold">{s.count}x {s.category}</p>
                                                <p className="text-xs text-muted-foreground">{s.subCategory || "Usage standard"}</p>
                                            </div>
                                            <p className="font-medium">{(s.count * s.unitPrice).toFixed(2)}$</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Montant Brut</span>
                                        <span>{results.montantBrut.toFixed(2)}$</span>
                                    </div>
                                    {results.reductionPct > 0 && (
                                        <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                            <span>Réduction ({results.reductionPct}%)</span>
                                            <span>-{results.montantReduction.toFixed(2)}$</span>
                                        </div>
                                    )}
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Net à payer</span>
                                        <span className="text-primary">{results.montantNet.toFixed(2)}$</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800 leading-relaxed">
                                        En validant cette déclaration, vous attestez de l'exactitude des informations fournies.
                                        Une fausse déclaration est passible de pénalités conformément à la législation en vigueur.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1 py-6 rounded-xl" onClick={() => setStep(0)}>
                                        <ChevronLeft className="w-4 h-4 mr-2" /> Modifier
                                    </Button>
                                    <Button
                                        className="flex-1 py-6 rounded-xl bg-primary hover:bg-primary/95 text-white"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? "Chargement..." : "Confirmer la Déclaration"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
