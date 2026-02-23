import { auth } from "@/auth";
import { db } from "@/db";
import { assujettis, declarations, lignesDeclaration } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Tv, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DeviceManager from "@/components/assujetti/DeviceManager";

export default async function ProfilAppareilsPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const [assujetti] = await db
        .select()
        .from(assujettis)
        .where(eq(assujettis.userId, session.user.id))
        .limit(1);

    if (!assujetti) return null;

    // Fetch latest declaration
    const [latestDeclaration] = await db
        .select()
        .from(declarations)
        .where(eq(declarations.assujettiId, assujetti.id))
        .orderBy(desc(declarations.exercice), desc(declarations.createdAt))
        .limit(1);

    let initialTv = 0;
    let initialRadio = 0;

    if (latestDeclaration) {
        const lignes = await db
            .select()
            .from(lignesDeclaration)
            .where(eq(lignesDeclaration.declarationId, latestDeclaration.id));

        const tvLine = lignes.find(l => l.categorieAppareil === "Téléviseurs");
        const radioLine = lignes.find(l => l.categorieAppareil === "Radios");

        initialTv = tvLine?.nombre || 0;
        initialRadio = radioLine?.nombre || 0;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header - Technical Style */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b-2 border-slate-100">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Link href="/assujetti/dashboard" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0d2870] hover:bg-white transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d2870]/50 leading-none">Gestion du Parc</p>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mt-1">
                                Appareils Déclarés
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-5 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border-b-4 border-emerald-200">
                    <ShieldCheck className="w-6 h-6" />
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">Statut du Parc</p>
                        <p className="text-sm font-black uppercase mt-1">Vérifié & Certifié</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Device Management Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-8 bg-white rounded-3xl border-2 border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

                        <div className="relative z-10 space-y-8">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mise à jour des quantités</h2>
                                <p className="text-sm text-slate-500 font-medium">Ajustez le nombre de vos appareils pour l'exercice {new Date().getFullYear()}.</p>
                            </div>

                            <DeviceManager initialTv={initialTv} initialRadio={initialRadio} />
                        </div>
                    </div>
                </div>

                {/* Right: Technical Info / Summary */}
                <div className="space-y-6">
                    <div className="p-6 bg-[#0d2870] text-white rounded-3xl relative overflow-hidden shadow-xl">
                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                        <div className="relative z-10 space-y-6">
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 mb-1">Résumé Fiscal</p>
                                <h3 className="text-lg font-black uppercase">Note de Taxation</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                    <p className="text-[10px] font-black uppercase text-white/40 mb-1">Total Appareils</p>
                                    <p className="text-4xl font-black">{initialTv + initialRadio}</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-white/50 uppercase tracking-wider">Référence</span>
                                        <span className="font-black font-mono">{assujetti.identifiantFiscal || "—"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-white/50 uppercase tracking-wider">Exercice</span>
                                        <span className="font-black">{new Date().getFullYear()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 italic font-black text-xs">i</div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Information Administrative</h4>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                            "Toute modification de votre parc d'appareils entraîne une mise à jour immédiate de vos obligations fiscales. La Note de Taxation pour l'exercice en cours sera recalculée en conséquence."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
