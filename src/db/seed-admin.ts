import { db } from "./index";
import { adminUsers } from "./schema";
import bcrypt from "bcryptjs";

async function seedAdmin() {
    console.log("🌱 Seeding admin user...");

    const email = "admin@redevance.cd";
    const password = "Admin@2026!";
    const passwordHash = await bcrypt.hash(password, 10);

    try {
        await db.insert(adminUsers).values({
            email,
            passwordHash,
            nomPrenom: "Admin System",
            isActive: true,
            superAdmin: true,
        });

        console.log("✅ Admin user seeded successfully!");
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log("⚠️ Please change the password after your first login.");
    } catch (error) {
        console.error("❌ Error seeding admin user:", error);
    } finally {
        process.exit();
    }
}

seedAdmin();
