import Link from "next/link";
import { ArrowLeft, ShieldAlert, Key, ShieldCheck, History, Laptop, ChevronRight, Lock } from "lucide-react";
import ChangePasswordForm from "@/components/assujetti/ChangePasswordForm";
import { cn } from "@/lib/utils";

export default function ChangePasswordPage() {
    const sections = [
        { title: "SÉCURITÉ GÉNÉRALE", href: "/assujetti/securite", icon: ShieldCheck, active: false },
        { title: "MODIFIER LE SECRET", href: "/assujetti/securite/mot-de-passe", icon: Lock, active: true },
        { title: "SESSIONS ACTIVES", href: "/assujetti/securite#sessions", icon: Laptop, active: false },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 md:px-0">
            {/* Breadcrumbs & Title */}
            <div className="pt-6 space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#0d2870]/40">
                    <Link href="/assujetti/dashboard" className="hover:text-[#0d2870]">Dashboard</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/assujetti/securite" className="hover:text-[#0d2870]">Sécurité</Link>
                    <ChevronRight className="w-3 h-3 text-yellow-400" />
                    <span className="text-[#0d2870]">Mot de Passe</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Modifier le secret</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Technical Sidebar Menu */}
                <div className="lg:col-span-3 space-y-2">
                    {sections.map((section) => (
                        <Link
                            key={section.href}
                            href={section.href}
                            className={cn(
                                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all group",
                                section.active
                                    ? "bg-[#0d2870] border-[#0d2870] text-white shadow-lg shadow-indigo-900/20"
                                    : "bg-white border-slate-100 text-slate-400 hover:border-[#0d2870] hover:text-[#0d2870]"
                            )}
                        >
                            <section.icon className={cn("w-4 h-4", section.active ? "text-yellow-400" : "text-slate-300 group-hover:text-[#0d2870]")} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{section.title}</span>
                            {section.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />}
                        </Link>
                    ))}

                    <div className="p-4 mt-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-tight">Besoin d'aide ?</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">Contactez le support technique pour toute anomalie.</p>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-9 space-y-8">
                    {/* Form Card */}
                    <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-none relative overflow-hidden min-h-[500px]">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '15px 15px' }} />

                        {/* Card Top Bar */}
                        <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center justify-between px-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#0d2870] flex items-center justify-center text-white shadow-sm">
                                    <Key className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Configuration du Secret</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Mise à jour des accès critiques</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 rounded-full border border-yellow-500/50">
                                <ShieldAlert className="w-3 h-3 text-[#0d2870]" />
                                <span className="text-[9px] font-black text-[#0d2870] uppercase tracking-widest">Niveau Critique</span>
                            </div>
                        </div>

                        <div className="p-10 relative z-10">
                            <ChangePasswordForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper removed as we standardizing layout here

