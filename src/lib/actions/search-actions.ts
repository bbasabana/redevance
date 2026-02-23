"use server";

import { db } from "@/db";
import { declarations, notesTaxation, assujettis } from "@/db/schema";
import { eq, ilike, or, and, sql } from "drizzle-orm";
import { auth } from "@/auth";

export type SearchResult = {
    id: string;
    type: "declaration" | "note";
    title: string;
    subtitle: string;
    status: string;
    date: string;
    href: string;
};

export async function searchItems(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        // Get Assujetti ID
        const [profile] = await db
            .select({ id: assujettis.id })
            .from(assujettis)
            .where(eq(assujettis.userId, session.user.id))
            .limit(1);

        if (!profile) return [];

        const normalizedQuery = `%${query}%`;

        // Search Declarations
        const declResults = await db
            .select({
                id: declarations.id,
                exercice: declarations.exercice,
                statut: declarations.statut,
                createdAt: declarations.createdAt,
            })
            .from(declarations)
            .where(
                and(
                    eq(declarations.assujettiId, profile.id),
                    or(
                        ilike(declarations.id, normalizedQuery),
                        sql`${declarations.exercice}::text ILIKE ${normalizedQuery}`
                    )
                )
            )
            .limit(5);

        // Search Taxation Notes
        const noteResults = await db
            .select({
                id: notesTaxation.id,
                numeroNote: notesTaxation.numeroNote,
                exercice: notesTaxation.exercice,
                statut: notesTaxation.statut,
                createdAt: notesTaxation.createdAt,
            })
            .from(notesTaxation)
            .where(
                and(
                    eq(notesTaxation.assujettiId, profile.id),
                    or(
                        ilike(notesTaxation.numeroNote, normalizedQuery),
                        sql`${notesTaxation.exercice}::text ILIKE ${normalizedQuery}`
                    )
                )
            )
            .limit(5);

        const results: SearchResult[] = [
            ...declResults.map(d => ({
                id: d.id,
                type: "declaration" as const,
                title: `Déclaration #${d.id.split('-')[0].toUpperCase()}`,
                subtitle: `Exercice ${d.exercice}`,
                status: d.statut || "en_attente",
                date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : "N/A",
                href: `/assujetti/demandes/${d.id}`
            })),
            ...noteResults.map(n => ({
                id: n.id,
                type: "note" as const,
                title: `Note #${n.numeroNote || n.id.split('-')[0].toUpperCase()}`,
                subtitle: `Exercice ${n.exercice}`,
                status: n.statut || "emise",
                date: n.createdAt ? new Date(n.createdAt).toLocaleDateString('fr-FR') : "N/A",
                href: `/assujetti/mes-notes/${n.id}`
            }))
        ];

        return results;
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
}
