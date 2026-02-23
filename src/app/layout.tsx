import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Redevance Audiovisuelle | RTNC",
  description: "Logiciel SaaS de Gestion Intégrée de la Redevance Audiovisuelle",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0F1C3F",
};

import { Providers } from "@/components/providers";

// SyncManager uses Dexie (IndexedDB) which is browser-only — must not SSR
const SyncManager = dynamic(
  () => import("@/components/offline/SyncManager").then((m) => m.SyncManager),
  { ssr: false }
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased")} suppressHydrationWarning>
        <Providers>
          <SyncManager />
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
