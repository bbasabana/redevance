import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { User } from "lucide-react";
import { db } from "@/db";
import { assujettis, onboardingProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import dynamic from "next/dynamic";
import { LogoutButton } from "@/components/assujetti/LogoutButton";

const IdentificationWizard = dynamic(() => import("../../../components/assujetti/IdentificationWizard"), { ssr: false });

export default async function IdentificationPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/panel/signin");
    }

    const [assujetti] = await db
        .select()
        .from(assujettis)
        .where(eq(assujettis.userId, session.user.id))
        .limit(1);

    if (!assujetti) {
        redirect("/api/auth/force-logout?deleted=true");
    }

    const [progress] = await db
        .select()
        .from(onboardingProgress)
        .where(eq(onboardingProgress.userId, session.user.id))
        .limit(1);

    return (
        <main className="h-screen flex flex-col bg-slate-50 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden">
            <div className="flex-none pt-4 flex justify-between items-center max-w-lg mx-auto w-full">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-600 truncate max-w-[150px]">
                        {assujetti?.nomRaisonSociale || session.user?.name || "Session"}
                    </span>
                </div>

                <LogoutButton />
            </div>

            <div className="flex-none pt-2 pb-1 text-center">
                <Image
                    src="/logos/logo.png"
                    alt="RTNC Logo"
                    width={60}
                    height={22}
                    className="h-auto w-auto mx-auto mb-1"
                />
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    Identification <span className="text-[#0d2870]">Redevance</span>
                </h1>
            </div>

            <div className="flex-1 min-h-0 w-full max-w-2xl mx-auto pb-2">
                <IdentificationWizard session={session} assujetti={assujetti} progress={progress} />
            </div>

            <footer className="flex-none py-1 text-center text-[8px] text-slate-400 font-medium tracking-widest uppercase">
                © 2026 RTNC - Système Intégré de Gestion
            </footer>
        </main>
    );
}
