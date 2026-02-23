import { db } from "../db/index";
import { geographies } from "../db/schema";
import { eq, and } from "drizzle-orm";

async function seedGeographies() {
    console.log("Seeding geographic data...");

    // 1. Create Province
    let [kinshasa] = await db.select().from(geographies).where(and(eq(geographies.nom, "Kinshasa"), eq(geographies.type, "PROVINCE"))).limit(1);
    if (!kinshasa) {
        [kinshasa] = await db.insert(geographies).values({
            nom: "Kinshasa",
            type: "PROVINCE",
            category: "URBAINE",
        }).returning();
        console.log(`Created Province: ${kinshasa.nom}`);
    }

    // 2. Create Ville (Kinshasa is both)
    let [villeKin] = await db.select().from(geographies).where(and(eq(geographies.nom, "Kinshasa"), eq(geographies.type, "VILLE"))).limit(1);
    if (!villeKin) {
        [villeKin] = await db.insert(geographies).values({
            nom: "Kinshasa",
            type: "VILLE",
            parentId: kinshasa.id,
            category: "URBAINE",
        }).returning();
        console.log(`Created Ville: ${villeKin.nom}`);
    }

    // 3. Create Commune (Gombe)
    let [gombe] = await db.select().from(geographies).where(and(eq(geographies.nom, "Gombe"), eq(geographies.type, "COMMUNE"))).limit(1);
    if (!gombe) {
        [gombe] = await db.insert(geographies).values({
            nom: "Gombe",
            type: "COMMUNE",
            parentId: villeKin.id,
            category: "URBAINE",
        }).returning();
        console.log(`Created Commune: ${gombe.nom}`);
    }

    console.log("Geographic data seeded successfully.");
    return { gombeId: gombe.id };
}

seedGeographies().catch((err) => {
    console.error("Geographic seeding failed:", err);
    process.exit(1);
});
