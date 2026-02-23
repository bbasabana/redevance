import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, MessageSquarePlus, Clock } from "lucide-react";

export default function ReclamationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Réclamations & Litiges</h1>
                    <p className="text-slate-500">Suivez l'état de vos demandes et contestations.</p>
                </div>
                <Button className="bg-primary text-white hover:bg-primary/95">
                    <MessageSquarePlus className="w-4 h-4 mr-2" />
                    Nouvelle Réclamation
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-white min-h-[400px]">
                <CardHeader>
                    <CardTitle className="text-lg">Dossiers en cours</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-lg font-medium text-slate-900">Aucune réclamation active</p>
                        <p className="text-sm text-slate-500 max-w-md">
                            Si vous constatez une erreur sur une Note de Taxation, vous pouvez initialiser une procédure de réclamation ici.
                        </p>
                    </div>

                    {/* Example of an active claim state:
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-slate-100 hover:border-primary/20 transition-colors bg-slate-50/50">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">En cours d'analyse</Badge>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Ouvert le 18 Fév 2026
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-slate-900">Contestation Montant - NT-2026-0042</h3>
                                    <p className="text-sm text-slate-500 mt-1">Le nombre de téléviseurs facturé ne correspond pas à la déclaration initiale soumise.</p>
                                </div>
                                <Button variant="ghost" size="sm">Voir détails</Button>
                            </div>
                        </div>
                    </div>
                    */}
                </CardContent>
            </Card>
        </div>
    );
}
