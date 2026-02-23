import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function MesNotesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mes Notes de Taxation</h1>
                    <p className="text-slate-500">Consultez et réglez vos avis d'imposition.</p>
                </div>
                <Link href="/assujetti/notes/new">
                    <Button className="bg-primary text-white hover:bg-primary/95">
                        Nouvelle Note de Taxation
                    </Button>
                </Link>
            </div>

            <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Historique des Notes</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input placeholder="Rechercher une note..." className="pl-9 bg-slate-50 border-none" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-lg font-medium text-slate-900">Aucune note de taxation</p>
                        <p className="text-sm text-slate-500 max-w-sm">Vous n'avez pas encore de note de taxation ou d'avis d'imposition à régler.</p>
                    </div>

                    {/* Example of how a loaded state would look:
                    <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Référence</th>
                                    <th className="px-6 py-4 font-medium">Date d'Émission</th>
                                    <th className="px-6 py-4 font-medium">Montant (CDF)</th>
                                    <th className="px-6 py-4 font-medium">Statut</th>
                                    <th className="px-6 py-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">NT-2026-0014</td>
                                    <td className="px-6 py-4 text-slate-500">20 Fév 2026</td>
                                    <td className="px-6 py-4 font-bold text-slate-900">125,000</td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">En attente</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">
                                            <Download className="w-4 h-4 mr-2" />
                                            PDF
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    */}
                </CardContent>
            </Card>
        </div>
    );
}
