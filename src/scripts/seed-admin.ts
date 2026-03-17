import { db } from "../db/index";
import { adminUsers } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seedAdmin() {
    const adminEmail = "admin@redevance.cd";
    const password = "AdminPassword123!";

    console.log(`Checking for existing admin: ${adminEmail}...`);

    const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, adminEmail)).limit(1);

    if (existing) {
        console.log("Admin already exists. Deleting to recreate...");
        await db.delete(adminUsers).where(eq(adminUsers.email, adminEmail));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newAdmin] = await db.insert(adminUsers).values({
        email: adminEmail,
        passwordHash: passwordHash,
        nomPrenom: "Admin Demo",
        telephone: "+243810000001",
        isActive: true,
        superAdmin: true,
        identificationCompleted: true,
    }).returning();

    console.log(`Admin created with ID: ${newAdmin.id}`);

    console.log("\n==========================================");
    console.log("SUCCESS: Admin Seeded");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${password}`);
    console.log("Access URL: /admin/login (or /xredvance/in/access)");
    console.log("==========================================\n");
}

seedAdmin().catch((err) => {
    console.error("Admin seeding failed:", err);
    process.exit(1);
});
