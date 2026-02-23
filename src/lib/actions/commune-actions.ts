"use server";

import { db } from "@/db";
import { communes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCommunes() {
    try {
        const results = await db
            .select()
            .from(communes)
            .where(eq(communes.isActive, true));
        return { success: true, data: results };
    } catch (error) {
        console.error("Error fetching communes:", error);
        return { success: false, error: "Failed to fetch communes" };
    }
}
