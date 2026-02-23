import { db } from "../db/index";
import { appUsers, roles, userRoles, geographies } from "../db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seedAgent() {
    const agentEmail = "agent@redevance.cd";
    const password = "Password123!";

    console.log(`Checking for existing agent: ${agentEmail}...`);

    const [existing] = await db.select().from(appUsers).where(eq(appUsers.email, agentEmail)).limit(1);

    if (existing) {
        console.log("Agent already exists. Deleting to recreate...");
        await db.delete(appUsers).where(eq(appUsers.email, agentEmail));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [gombe] = await db.select().from(geographies).where(and(eq(geographies.nom, "Gombe"), eq(geographies.type, "COMMUNE"))).limit(1);

    if (!gombe) {
        console.error("Commune 'Gombe' not found. Please run seed-geographies.ts first.");
        return;
    }

    const [newAgent] = await db.insert(appUsers).values({
        email: agentEmail,
        passwordHash: passwordHash,
        nomPrenom: "Agent de Test",
        telephone: "+243810000000",
        isActive: true,
        mustSetup2Fa: true,
        twoFactorEnabled: false,
        identificationCompleted: true,
        identifiantAgent: "RTNC-AG-243", // Consistent with Dashboard UI
        assignedCommuneId: gombe.id,
    }).returning();

    console.log(`Agent created with ID: ${newAgent.id}`);

    // Assign 'agent' role
    const [agentRole] = await db.select().from(roles).where(eq(roles.name, "agent")).limit(1);

    if (agentRole) {
        await db.insert(userRoles).values({
            userId: newAgent.id,
            roleId: agentRole.id,
        });
        console.log("Role 'agent' assigned successfully.");
    } else {
        console.error("Role 'agent' not found in database. Please run seed-roles.ts first.");
    }

    console.log("\n==========================================");
    console.log("SUCCESS: Agent Seeded");
    console.log(`Email: ${agentEmail}`);
    console.log(`Password: ${password}`);
    console.log("==========================================\n");
}

seedAgent().catch((err) => {
    console.error("Agent seeding failed:", err);
    process.exit(1);
});
