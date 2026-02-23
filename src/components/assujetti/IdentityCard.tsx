import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileCheck2, User, Landmark, MapPin } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { assujettis, communes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cn } from "@/lib/utils";
import Link from "next/link";

export async function IdentityCard() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const profileData = await db
        .select({
            assujetti: assujettis,
            commune: communes.nom,
            classification: assujettis.sousTypePm
        })
        .from(assujettis)
        .leftJoin(communes, eq(assujettis.communeId, communes.id))
        .where(eq(assujettis.userId, session.user.id))
        .limit(1);

    if (profileData.length === 0) return null;

    const profile = profileData[0].assujetti;
    const communeNom = profileData[0].commune;

    const isEntreprise = profile.typePersonne?.startsWith("pm") || false;
    const typeLabel = isEntreprise ? "Personne Morale" : "Personne Physique";

    const isActive = profile.statut === "en_regle" || profile.statut === "en_cours";
    const statusLabel = profile.statut === "en_regle" ? "En règle" :
        profile.statut === "en_cours" ? "En cours" : "Nouveau";

    return (
        <div className="bg-white rounded-[2rem] p-8 flex flex-col h-full border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            {/* Decorative background shape */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-50 transition-colors" />

            {/* Header */}
            <div className="flex items-start justify-between mb-8 relative">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Profil Assujetti</h3>
                        {profileData[0].classification && (
                            <span className="px-2 py-0.5 rounded bg-yellow-400 text-[#0d2870] text-[9px] font-black uppercase tracking-widest">
                                {profileData[0].classification}
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">NIF: {profile.nif || "00-0000000-X"}</p>
                </div>
                <div className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                    {statusLabel}
                </div>
            </div>

            {/* Data List */}
            <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <User className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Raison Sociale</p>
                            <p className="text-sm font-black text-slate-900 leading-tight truncate">{profile.nomRaisonSociale || session.user.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <Landmark className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Identification RCCM</p>
                            <p className="text-sm font-black text-slate-900 leading-tight truncate uppercase">{profile.rccm || "Non renseigné"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <MapPin className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Adresse du Siège</p>
                            <p className="text-sm font-black text-slate-900 leading-tight truncate">
                                {communeNom}, {profile.adresseSiege || "R.D.C"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Link Footer */}
            <div className="mt-8 pt-6 border-t border-slate-50">
                <Link
                    href="/assujetti/profil"
                    className="flex items-center justify-between group/link"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#003d7b] group-hover/link:underline">
                        Accéder au profil complet
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover/link:text-[#003d7b] group-hover/link:translate-x-1 transition-all" />
                </Link>
            </div>
        </div>
    );
}
