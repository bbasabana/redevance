import { auth } from "@/auth";
import { db } from "@/db";
import { assujettis } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProfileEditForm from "@/components/assujetti/ProfileEditForm";
import { redirect } from "next/navigation";

export default async function ProfilEditPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const [profile] = await db
        .select()
        .from(assujettis)
        .where(eq(assujettis.userId, session.user.id))
        .limit(1);

    if (!profile) {
        redirect("/assujetti/dashboard");
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-0">
            <ProfileEditForm initialData={profile} />
        </div>
    );
}
