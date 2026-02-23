import { Badge } from "@/components/ui/badge";
import { ShieldCheck, History, Laptop, MapPin, ExternalLink, Smartphone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import SecuritySettingsManager from "@/components/assujetti/SecuritySettingsManager";
import { getRecentSessions } from "@/app/actions/securite";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

function parseUA(ua: string | null) {
    if (!ua) return { browser: "Appareil Inconnu", os: "OS Inconnu", icon: Smartphone };
    let browser = "Navigateur Inconnu";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";

    let os = "OS Inconnu";
    let icon = Laptop;
    if (ua.includes("Mac OS")) { os = "MacOS"; icon = Laptop; }
    else if (ua.includes("Windows")) { os = "Windows"; icon = Laptop; }
    else if (ua.includes("Linux")) { os = "Linux"; icon = Laptop; }
    else if (ua.includes("Android")) { os = "Android"; icon = Smartphone; }
    else if (ua.includes("iPhone") || ua.includes("iPad")) { os = "iOS"; icon = Smartphone; }

    return { browser, os, icon };
}

export default async function SecuritePage() {
    const session = await auth();
    const twoFactorEnabled = (session?.user as any)?.twoFactorEnabled || false;

    const recentSessionsRes = await getRecentSessions();
    const sessionsList = recentSessionsRes.success && recentSessionsRes.data ? recentSessionsRes.data : [];

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
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Sécurité du Compte</h1>
                        <p className="text-slate-500 font-bold max-w-xl text-sm leading-relaxed border-l-4 border-yellow-400 pl-4 bg-yellow-400/5 py-2">
                            Gestion des accès, authentification double facteur et historique des connexions sécurisées au registre RTNC.
                        </p>
                    </div>
                </div>
            </div>

            {/* Interactive Settings Manager */}
            <SecuritySettingsManager initial2FA={twoFactorEnabled} />

            {/* Connection History Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                            <History className="w-5 h-5 text-[#0d2870]" />
                            Historique des connexions
                        </h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            LOGS DE TRAÇABILITÉ DES ACCÈS
                        </p>
                    </div>
                    <button className="text-[10px] font-black text-[#0d2870] uppercase tracking-[0.2em] px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2 border border-slate-200 shadow-sm active:scale-95">
                        Historique complet
                        <ExternalLink className="w-3 h-3" />
                    </button>
                </div>

                <div className="bg-white rounded-xl border-2 border-slate-100 shadow-none relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

                    {/* Technical Filter Bar equivalent - EXACT MATCH TO TAXATION BAR */}
                    <div className="bg-[#0d2870] p-4 border-t-4 border-yellow-400 flex items-center gap-4 shadow-none relative z-20 px-6">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            SESSIONS ACTIVES & RÉCENTES
                        </span>
                    </div>

                    <div className="divide-y border-slate-100 relative z-10 bg-white">
                        {sessionsList.length === 0 ? (
                            <div className="p-16 text-center flex flex-col items-center">
                                <div className="w-20 h-20 rounded-lg bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
                                    <Laptop className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Aucun Log Enregistré</h3>
                                <p className="text-slate-400 mt-2 text-xs font-bold uppercase tracking-widest">L'historique des connexions est vide.</p>
                            </div>
                        ) : (
                            sessionsList.map((sess, idx) => {
                                const { browser, os, icon: Icon } = parseUA(sess.userAgent);
                                const isCurrent = idx === 0;
                                const timeAgo = sess.createdAt ? formatDistanceToNow(new Date(sess.createdAt), { addSuffix: true, locale: fr }) : "Inconnu";
                                const formattedDate = sess.createdAt ? format(new Date(sess.createdAt), "dd MMM à HH:mm", { locale: fr }) : "Inconnu";

                                return (
                                    <div key={sess.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white hover:bg-slate-50/50 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-[#0d2870]">
                                        <div className="flex items-start gap-5">
                                            <div className={cn(
                                                "w-12 h-12 rounded-lg flex items-center justify-center border shrink-0 transition-all",
                                                isCurrent
                                                    ? "bg-[#0d2870] text-white border-[#0d2870] shadow-sm"
                                                    : "bg-slate-50 text-slate-400 border-slate-200 group-hover:bg-white group-hover:border-slate-300"
                                            )}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{browser} sur {os}</h4>
                                                    {isCurrent && (
                                                        <Badge className="bg-green-500 hover:bg-green-600 text-[9px] font-black uppercase tracking-[0.15em] text-white border-none px-2 py-0.5 h-auto rounded shadow-none">SESSION ACTUELLE</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                                    <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> RDC</span>
                                                    <span>•</span>
                                                    <span>IP : <span className="text-slate-600">{sess.ipAddress || "INCONNUE"}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cn("text-right shrink-0 flex flex-col items-end gap-1.5", !isCurrent && "opacity-70")}>
                                            <p className={cn(
                                                "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded shadow-none",
                                                isCurrent ? "bg-yellow-400 text-[#0d2870]" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {isCurrent ? "EN LIGNE" : "DÉCONNECTÉ"}
                                            </p>
                                            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                                                {isCurrent ? timeAgo : formattedDate}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="p-6 rounded-lg bg-[#0d2870]/5 border-l-4 border-[#0d2870] flex gap-4">
                    <ShieldCheck className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">ALERTE DE SÉCURITÉ</h4>
                        <p className="text-[11px] text-[#0d2870]/70 font-bold leading-relaxed uppercase tracking-widest">
                            SI VOUS NE RECONNAISSEZ PAS L'UNE DE CES ACTIVITÉS, NOUS VOUS RECOMMANDONS DE <Link href="/assujetti/securite/mot-de-passe" className="text-red-600 underline decoration-2 underline-offset-4 hover:text-red-700 transition-colors">CHANGER VOTRE MOT DE PASSE IMMÉDIATEMENT</Link> ET DE CONTACTER LE SUPPORT TECHNIQUE.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
