"use client";

import { EdgeStoreProvider } from "@/lib/edgestore";
import { SessionProvider } from "next-auth/react";

// Réduit les appels GET /api/auth/session pour viser P90 < 200ms (pas de refetch toutes les 0s)
const SESSION_REFETCH_INTERVAL = 5 * 60; // 5 min

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider
            refetchInterval={SESSION_REFETCH_INTERVAL}
            refetchOnWindowFocus={false}
        >
            <EdgeStoreProvider>
                {children}
            </EdgeStoreProvider>
        </SessionProvider>
    );
}
