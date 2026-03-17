import { db } from "../db/index";
import { adminUsers } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seedSecondAdmin() {
    const adminEmail = "moussa@redevance.cd";
    const password = "AdminPassword789!";

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
        nomPrenom: "Moussa Diakité",
        telephone: "+243810000002",
        isActive: true,
        superAdmin: true,
        identificationCompleted: true,
    }).returning();

    console.log(`Second admin created with ID: ${newAdmin.id}`);

    console.log("\n==========================================");
    console.log("SUCCESS: Second Admin Seeded");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${password}`);
    console.log("Access URL: /admin/login");
    console.log("==========================================\n");
}

seedSecondAdmin().catch((err) => {
    console.error("Second admin seeding failed:", err);
    process.exit(1);
});
