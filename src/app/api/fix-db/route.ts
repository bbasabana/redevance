import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        console.log("Starting manual FK fix via API...");

        // 1. Drop the old constraint
        await db.execute(sql`ALTER TABLE "assujettis" DROP CONSTRAINT IF EXISTS "assujettis_commune_id_communes_id_fk"`);

        // 2. Add the new constraint to geographies
        await db.execute(sql`ALTER TABLE "assujettis" ADD CONSTRAINT "assujettis_commune_id_geographies_id_fk" FOREIGN KEY ("commune_id") REFERENCES "geographies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        return NextResponse.json({
            success: true,
            message: "Foreign key constraint updated successfully to reference geographies."
        });
    } catch (error: any) {
        console.error("Error during fix:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
