import { auth } from "@/auth";
import { db } from "@/db";
import { assujettis, geographies, appUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { User, Building2, MapPin, Phone, Mail, FileText, ArrowLeft, ShieldCheck, PenSquare, Eye, CloudCheck, Loader2, Navigation } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function ProfilInfosPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const [assujetti] = await db
        .select({
            assujetti: assujettis,
            commune: geographies.nom,
            emailUser: appUsers.email,
        })
        .from(assujettis)
        .leftJoin(geographies, eq(assujettis.communeId, geographies.id))
        .leftJoin(appUsers, eq(assujettis.userId, appUsers.id))
        .where(eq(assujettis.userId, session.user.id))
        .limit(1);

    if (!assujetti) return null;

    const { assujetti: data, commune, emailUser } = assujetti;
    const isPM = data.typePersonne === "pm" || data.typePersonne === "pm_advantage";

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
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase text-balance">Mon Dossier d'Identification</h1>
                        <p className="text-slate-500 font-bold max-w-xl text-sm leading-relaxed border-l-4 border-yellow-400 pl-4 bg-yellow-400/5 py-2">
                            Registre officiel de votre établissement. Toute modification des données légales nécessite une validation par nos services.
                        </p>
                    </div>
                </div>

                <Link href="/assujetti/profil/edit">
                    <Button className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black uppercase tracking-[0.1em] text-[10px] gap-3 shadow-none border-none transition-all active:scale-95">
                        <PenSquare className="w-4 h-4" /> Modifier mes informations
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Fiscal ID Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-[#0d2870] p-8 rounded-lg border-none shadow-xl relative overflow-hidden text-white flex flex-col items-center text-center group">
                        {/* Technical Grid Decorations */}
                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-[40px] tracking-tighter leading-none select-none">RTNC</div>

                        <div className="relative z-10 w-24 h-24 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md mb-6 group-hover:bg-white/20 transition-all">
                            {isPM ? <Building2 className="w-12 h-12 text-yellow-400" /> : <User className="w-12 h-12 text-yellow-400" />}
                        </div>

                        <div className="relative z-10 space-y-2 w-full">
                            <h2 className="text-2xl font-black tracking-tighter uppercase leading-tight line-clamp-2">
                                {data.nomRaisonSociale}
                            </h2>
                            <div className="inline-flex px-3 py-1 rounded bg-yellow-400 text-slate-900 font-black text-[9px] uppercase tracking-widest border-b-2 border-yellow-600">
                                {isPM ? "Personne Morale" : "Personne Physique"}
                            </div>
                        </div>

                        <div className="w-full h-px bg-white/10 my-8 relative z-10" />

                        <div className="relative z-10 w-full space-y-4">
                            <div className="flex justify-between items-center group/item p-3 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Id. Fiscal</span>
                                <span className="text-sm font-black text-yellow-400 tracking-tighter font-mono">{data.identifiantFiscal || "NON_ASSIGNÉ"}</span>
                            </div>
                            <div className="flex justify-between items-center group/item p-3 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">NIF</span>
                                <span className="text-sm font-black text-white tracking-tighter font-mono">{data.nif || "EN_COURS"}</span>
                            </div>
                            <div className="flex justify-between items-center group/item p-3 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">État</span>
                                <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500 rounded font-black text-[8px] uppercase tracking-widest text-white shadow-lg shadow-emerald-900/40">
                                    <ShieldCheck className="w-3 h-3" /> Certifié
                                </div>
                            </div>
                            {data.validationStatus === "pending" && (
                                <div className="flex justify-between items-center group/item p-3 rounded-lg border border-yellow-400/20 bg-yellow-400/5 transition-all">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Révision</span>
                                    <div className="flex items-center gap-2 px-2 py-1 bg-yellow-500 rounded font-black text-[8px] uppercase tracking-widest text-slate-900 shadow-lg shadow-yellow-900/20">
                                        <Loader2 className="w-3 h-3 animate-spin" /> En attente
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Info Box */}
                    <div className="p-6 bg-white rounded-lg border-2 border-slate-100 space-y-4 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Sécurité des données
                        </h4>
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                            Vos données sont protégées par le système de certification de la DGSC. Les modifications impactent vos futures facturations.
                        </p>
                    </div>
                </div>

                {/* Main Details Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Identification Block */}
                    <div className="bg-white rounded-lg border-2 border-slate-100 overflow-hidden relative group">
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                        <div className="bg-[#0d2870] border-b-4 border-yellow-400 p-6 flex items-center justify-between text-white">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-yellow-400" />
                                Détails Juridiques
                            </h3>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {isPM && (
                                <>
                                    <div className="group/field p-4 bg-slate-50/50 rounded-lg border border-transparent hover:border-[#0d2870]/10 hover:bg-white transition-all">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5 text-[#0d2870]" /> RCCM (Commerce)
                                        </p>
                                        <p className="text-sm font-black text-slate-900 font-mono tracking-tighter">{data.rccm || "BROUILLON"}</p>
                                    </div>
                                    <div className="group/field p-4 bg-slate-50/50 rounded-lg border border-transparent hover:border-[#0d2870]/10 hover:bg-white transition-all">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5 text-[#0d2870]" /> ID National
                                        </p>
                                        <p className="text-sm font-black text-slate-900 font-mono tracking-tighter">{data.idNat || "PAS_D'ENTRÉE"}</p>
                                    </div>
                                </>
                            )}
                            <div className="group/field p-4 bg-slate-50/50 rounded-lg border border-transparent hover:border-[#0d2870]/10 hover:bg-white transition-all">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-[#0d2870]" /> Représentant Légal
                                </p>
                                <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{data.representantLegal || data.nomRaisonSociale}</p>
                            </div>
                            <div className="group/field p-4 bg-slate-50/50 rounded-lg border border-transparent hover:border-[#0d2870]/10 hover:bg-white transition-all">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" /> Secteur d'activité
                                </p>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {data.activites && (data.activites as string[]).length > 0 ? (
                                            (data.activites as string[]).map(act => (
                                                <span key={act} className="px-2 py-1 bg-[#0d2870]/10 text-[#0d2870] text-[9px] font-black uppercase rounded border border-[#0d2870]/20">
                                                    {act.replace('_', ' ')}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{data.typeActivite ? data.typeActivite.replace('_', ' ') : "GÉNÉRAL"}</p>
                                        )}
                                    </div>
                                    {data.precisionAutre && (
                                        <div className="p-2 bg-white rounded border border-slate-100 mt-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Détail Autre</p>
                                            <p className="text-[11px] font-bold text-slate-600 leading-tight italic">
                                                {data.precisionAutre}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents Officiels Block */}
                    <div className="bg-white rounded-lg border-2 border-slate-100 overflow-hidden relative group">
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                        <div className="bg-[#0d2870] border-b-4 border-yellow-400 p-6 text-white uppercase font-black text-sm tracking-[0.2em] flex items-center gap-3">
                            <CloudCheck className="w-5 h-5 text-yellow-400" />
                            Pièces Justificatives
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "RCCM (Scanné)", url: data.rccmUrl, id: "rccm" },
                                { label: "Identification Nationale", url: data.idNatUrl, id: "idnat" },
                                { label: "Attestation NIF", url: data.nifUrl, id: "nif" }
                            ].map((doc) => (
                                <div key={doc.id} className={cn(
                                    "p-4 rounded-lg border flex flex-col gap-3 transition-all",
                                    doc.url ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-50/50 border-slate-100 opacity-60"
                                )}>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.label}</p>
                                    <div className="flex items-center justify-between">
                                        {doc.url ? (
                                            <>
                                                <span className="text-[9px] font-black text-emerald-600 uppercase">Document Reçu</span>
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 rounded bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Non Téléversé</span>
                                                <div className="w-8 h-8 rounded bg-slate-200 text-slate-400 flex items-center justify-center cursor-not-allowed">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location & Contact Block */}
                    <div className="bg-white rounded-lg border-2 border-slate-100 overflow-hidden relative group">
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                        <div className="bg-[#0d2870] border-b-4 border-yellow-400 p-6 text-white uppercase font-black text-sm tracking-[0.2em] flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-yellow-400" />
                            Siège & Contact
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-4">
                                    <div className="p-4 bg-slate-50/50 rounded-lg border border-transparent hover:border-[#0d2870]/10 hover:bg-white transition-all">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Adresse du Siège</p>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase tracking-tight italic">
                                            {data.adresseSiege}
                                        </p>
                                    </div>
                                    <div className="group/field p-4 bg-slate-50/50 rounded-lg border border-transparent hover:border-[#0d2870]/10 hover:bg-white transition-all">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-[#0d2870]" /> Circonscription
                                        </p>
                                        <p className="text-sm font-black text-slate-900 uppercase">
                                            COMMUNE DE {commune || "INCONNUE"}
                                        </p>
                                        {data.latitude && data.longitude && (
                                            <div className="mt-3 pt-3 border-t border-slate-200/50">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                    <Navigation className="w-3 h-3 text-emerald-500" /> Position GPS
                                                </p>
                                                <p className="text-[11px] font-bold text-emerald-600 font-mono">
                                                    {Number(data.latitude).toFixed(6)}, {Number(data.longitude).toFixed(6)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="md:w-64 space-y-4">
                                    <div className="group/field p-4 bg-slate-50/50 rounded-lg border border-transparent hover:border-[#0d2870]/10 hover:bg-white transition-all">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-[#0d2870]" /> Email
                                        </p>
                                        <p className="text-sm font-black text-slate-900 overflow-hidden text-ellipsis">{data.email || emailUser}</p>
                                    </div>
                                    <div className="group/field p-4 bg-slate-50/50 rounded-lg border border-transparent hover:border-[#0d2870]/10 hover:bg-white transition-all">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-[#0d2870]" /> Téléphone
                                        </p>
                                        <p className="text-sm font-black text-slate-900">{data.telephonePrincipal || "—"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-red-50 border-2 border-red-100 rounded-lg flex items-start gap-4 shadow-xl shadow-red-900/5">
                        <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center shrink-0 border-b-2 border-red-300">
                            <ShieldCheck className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-red-900 uppercase tracking-tight leading-none mb-2">Notice de modification</h4>
                            <p className="text-[11px] font-bold text-red-700/80 leading-relaxed">
                                Les corrections de NIF, RCCM ou Id. Nat ne sont pas instantanées. Elles nécessitent un scan du document original et une revue manuelle par nos services techniques pour garantir l'intégrité du registre fiscal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
