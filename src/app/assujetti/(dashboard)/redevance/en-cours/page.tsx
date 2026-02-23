import { auth } from "@/auth";
import { db } from "@/db";
import { assujettis, geographies, locationCategoryEnum } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ArrowLeft, Plus, Receipt } from "lucide-react";
import Link from "next/link";
import { getTaxationNotes, generateNoteQRData } from "@/app/actions/taxation";
import { TaxationNotesList } from "@/components/assujetti/TaxationNotesList";
import { Button } from "@/components/ui/button";

export default async function NoteEnCoursPage() {
    const session = await auth();
    if (!session?.user?.id) return redirect("/panel/signin");

    // 1. Fetch Assujetti Profile
    const [assujetti] = await db
        .select()
        .from(assujettis)
        .where(eq(assujettis.userId, session.user.id))
        .limit(1);

    if (!assujetti) return redirect("/assujetti/dashboard");

    // 2. Fetch All Taxation Notes
    const notesResult = await getTaxationNotes();
    const notes = (notesResult.success && notesResult.data) ? notesResult.data : [];

    // 3. Generate QR Data for all notes
    const qrDataMap: Record<string, string> = {};
    if (notes) {
        for (const note of notes) {
            qrDataMap[note.id] = await generateNoteQRData(note);
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 md:px-0">
            {/* Header Section - High Contrast Technical Look */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-6 border-b-2 border-slate-900/5 pb-8">
                <div className="space-y-4">
                    <Link
                        href="/assujetti/dashboard"
                        className="inline-flex items-center gap-2 text-[11px] font-black text-[#0d2870] hover:text-red-600 uppercase tracking-[0.2em] transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Administration Dashboard
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Mes Notes de Taxation</h1>
                        <p className="text-slate-500 font-bold max-w-xl text-sm leading-relaxed border-l-4 border-yellow-400 pl-4 bg-yellow-400/5 py-2">
                            Historique officiel des redevances certifiées. Téléchargement des documents et régularisation des paiements en attente.
                        </p>
                    </div>
                </div>

                <Link href="/assujetti/dashboard">
                    <Button className="h-10 px-5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black uppercase tracking-[0.1em] text-[10px] gap-2 shadow-none border-none transition-all active:scale-95">
                        <Plus className="w-4 h-4" /> Nouvelle Déclaration
                    </Button>
                </Link>
            </div>

            {/* Main List Area */}
            {notes.length > 0 ? (
                <TaxationNotesList
                    notes={notes as any}
                    assujetti={assujetti}
                    qrDataMap={qrDataMap}
                />
            ) : (
                <div className="p-24 text-center bg-white rounded-lg border-2 border-slate-100 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-lg bg-slate-50 flex items-center justify-center mb-8 border border-slate-100">
                        <Receipt className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Aucun dossier actif</h3>
                    <p className="text-slate-400 mt-3 max-w-sm font-bold">
                        Votre registre de taxation est actuellement vide. Veuillez initier une nouvelle déclaration.
                    </p>
                </div>
            )}
        </div>
    );
}
