import { db } from "@/db";
import { notesTaxation, declarations, assujettis } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PaymentReportForm } from "@/components/assujetti/payment-report-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Calendar, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function NoteDetailPage({ params }: { params: { id: string } }) {
    const [note] = await db.select()
        .from(notesTaxation)
        .where(eq(notesTaxation.id, params.id))
        .limit(1);

    if (!note) notFound();

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Note Details */}
                <div className="flex-1 space-y-6">
                    <Card className="border-none shadow-xl overflow-hidden">
                        <div className="bg-primary p-8 text-white relative">
                            <FileText className="absolute top-4 right-4 w-12 h-12 opacity-10" />
                            <div className="space-y-1">
                                <p className="text-sm uppercase tracking-widest opacity-60">Note de Taxation</p>
                                <h1 className="text-3xl font-bold">{note.numeroNote}</h1>
                            </div>
                            <div className="mt-8 flex gap-6">
                                <div>
                                    <p className="text-xs opacity-60">Émise le</p>
                                    <p className="font-medium">{note.dateEmission || "En attente"}</p>
                                </div>
                                <div>
                                    <p className="text-xs opacity-60">Échéance</p>
                                    <p className="font-medium text-amber-300">{note.dateEcheance || "Non définie"}</p>
                                </div>
                                <div>
                                    <p className="text-xs opacity-60">Statut</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                                        {note.statut}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Résumé</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Montant Brut</span>
                                            <span className="font-medium">{note.montantBrut}$</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-600">
                                            <span className="text-sm">Réduction ({note.reductionPct}%)</span>
                                            <span className="font-medium">-{note.montantReduction}$</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total Net</span>
                                            <span className="text-primary">{note.montantNet}$</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Instructions</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Veuillez effectuer le paiement par l'un des canaux autorisés (Banque ou Mobile Money) en mentionnant le numéro de la note de taxation.
                                        Une fois le paiement effectué, veuillez le signaler via le formulaire ci-contre.
                                    </p>
                                    <Button variant="outline" className="w-full">
                                        <Download className="w-4 h-4 mr-2" /> Télécharger PDF
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-slate-50 border-none">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Temps restant</p>
                                    <p className="text-sm font-bold">30 jours</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-50 border-none">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Devise</p>
                                    <p className="text-sm font-bold">USD (Dollars)</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-50 border-none">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Exercice</p>
                                    <p className="text-sm font-bold">{note.exercice}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right: Payment Form */}
                <div className="w-full md:w-[350px] lg:w-[400px]">
                    <Card className="border-none shadow-2xl sticky top-8">
                        <CardHeader>
                            <CardTitle>Signaler un paiement</CardTitle>
                            <CardDescription>Remplissez ce formulaire après avoir effectué le virement</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PaymentReportForm
                                noteId={note.id}
                                amount={parseFloat(note.montantNet)}
                                noteNumber={note.numeroNote || ""}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
