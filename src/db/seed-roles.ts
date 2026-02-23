import { db } from "./index";
import { roles } from "./schema";
import { eq } from "drizzle-orm";

async function seedRoles() {
    const defaultRoles = [
        { name: "particular", description: "Assujetti particulier" },
        { name: "entreprise", description: "Assujetti entreprise" },
        { name: "agent", description: "Agent de terrain / Contrôleur" },
        { name: "admin", description: "Administrateur système" },
    ];

    console.log("Seeding roles...");

    for (const role of defaultRoles) {
        const [existing] = await db.select().from(roles).where(eq(roles.name, role.name)).limit(1);
        if (!existing) {
            await db.insert(roles).values(role);
            console.log(`Role '${role.name}' created.`);
        } else {
            console.log(`Role '${role.name}' already exists.`);
        }
    }

    console.log("Seeding completed.");
}

seedRoles().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
