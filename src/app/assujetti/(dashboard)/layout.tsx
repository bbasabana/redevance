import { auth } from "@/auth";
import { TwoFactorReminder } from "@/components/assujetti/2fa-reminder";
import { WelcomeNotification } from "@/components/notifications/welcome-notification";
import { Suspense } from "react";
import { db } from "@/db";
import { assujettis, notesTaxation, paiements } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import Image from "next/image";
import { DashboardTopNav } from "@/components/assujetti";

export default async function AssujettiLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const twoFactorEnabled = (session?.user as any)?.twoFactorEnabled || false;

  let typePersonne = "pp";
  let displayName = session?.user?.name || "Assujetti";
  let displayTitle = "Particulier";
  let nif: string | null = null;
  let isEnRegle = false;
  let hasFiscalData = false;
  let classification: string | null = null;

  if (session?.user?.id) {
    const [profile] = await db
      .select({
        typePersonne: assujettis.typePersonne,
        nomRaisonSociale: assujettis.nomRaisonSociale,
        representantLegal: assujettis.representantLegal,
        nif: assujettis.nif,
        statut: assujettis.statut,
        id: assujettis.id,
        sousTypePm: assujettis.sousTypePm,
      })
      .from(assujettis)
      .where(eq(assujettis.userId, session.user.id))
      .limit(1);

    if (!profile) {
      redirect("/api/auth/force-logout?deleted=true");
    }

    typePersonne = profile.typePersonne;
    displayName = profile.nomRaisonSociale || session.user.name || "Assujetti";
    displayTitle = profile.typePersonne === "pm"
      ? (profile.representantLegal || "Directeur Général")
      : "Assujetti";
    nif = profile.nif;

    if (profile.id) {
      const [taxe] = await db
        .select({ total: sql<number>`coalesce(sum(${notesTaxation.montantTotalDu}), 0)` })
        .from(notesTaxation)
        .where(eq(notesTaxation.assujettiId, profile.id));

      const [paye] = await db
        .select({ total: sql<number>`coalesce(sum(${paiements.montant}), 0)` })
        .from(paiements)
        .where(eq(paiements.assujettiId, profile.id));

      const montantDu = Number(taxe?.total) || 0;
      const montantPaye = Number(paye?.total) || 0;

      hasFiscalData = montantDu > 0;
      isEnRegle = montantDu === 0 || montantPaye >= montantDu;
      classification = profile.sousTypePm;
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">

      {/* ─── Top Header ─── */}
      <header className="sticky top-0 z-40 flex-none bg-white border-b border-slate-100 shadow-none">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Image
              src="/logos/logo.png"
              alt="RTNC Logo"
              width={52}
              height={20}
              className="h-auto w-auto"
            />
            <div className="hidden sm:block h-5 w-px bg-slate-200" />
            <span className="hidden sm:block text-[10px] font-black uppercase tracking-[0.15em] text-[#0d2870]">
              Espace Assujetti
            </span>
          </div>

          {/* Nav + Actions */}
          <DashboardTopNav
            userName={displayName}
            userRole={displayTitle}
            nif={nif}
            userInitial={displayName.charAt(0).toUpperCase()}
            typePersonne={typePersonne as "pp" | "pm"}
            isEnRegle={isEnRegle}
            hasFiscalData={hasFiscalData}
            classification={classification}
          />
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <TwoFactorReminder enabled={twoFactorEnabled} />
        <Suspense>
          <WelcomeNotification />
        </Suspense>
        <div className="animate-fade-in">
          {children}
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="flex-none py-4 text-center text-[8px] text-slate-400 font-medium tracking-widest uppercase border-t border-slate-200/50">
        © 2026 RTNC — Système Intégré de Gestion de la Redevance Audiovisuelle
      </footer>
    </main>
  );
}
