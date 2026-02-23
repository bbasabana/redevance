import { auth } from "@/auth";
import { db } from "@/db";
import { declarations, lignesDeclaration, assujettis } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { DeclarationForm } from "@/components/assujetti/declaration-form";
import { redirect } from "next/navigation";

export default async function NewDeclarationPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const currentYear = new Date().getFullYear();

    // 1. Get Assujetti
    const [assujetti] = await db
        .select()
        .from(assujettis)
        .where(eq(assujettis.userId, session.user.id))
        .limit(1);

    if (!assujetti) redirect("/assujetti/dashboard");

    // 2. Get existing declaration for current year
    const [declaration] = await db
        .select()
        .from(declarations)
        .where(and(
            eq(declarations.assujettiId, assujetti.id),
            eq(declarations.exercice, currentYear)
        ))
        .limit(1);

    let initialSelections: any[] = [];

    if (declaration) {
        const lines = await db
            .select()
            .from(lignesDeclaration)
            .where(eq(lignesDeclaration.declarationId, declaration.id));

        initialSelections = lines.map(l => {
            const catId = l.categorieAppareil === "Téléviseurs" ? "tv" :
                l.categorieAppareil === "Radios" ? "radio" : "decodeur";
            return {
                id: l.id,
                category: l.categorieAppareil,
                categoryId: catId,
                count: l.nombre,
                unitPrice: parseFloat(l.tarifUnitaire || "0"),
                subCategory: (l as any).sousCategorie,
                operator: (l as any).operateur,
            };
        });
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <DeclarationForm initialSelections={initialSelections} />
        </div>
    );
}
