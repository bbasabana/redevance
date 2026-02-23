import { MobileHeader } from "@/components/agent/MobileHeader";
import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session || !session.user.userId) {
        redirect("/panel/signin");
    }

    // Fetch user details for the header
    const [user] = await db.select({
        nomPrenom: appUsers.nomPrenom,
    })
        .from(appUsers)
        .where(eq(appUsers.id, session.user.userId))
        .limit(1);

    const userName = user?.nomPrenom || "Agent RTNC";
    const userRole = session.user.role === 'agent' ? "Agent de Terrain" : "Contrôleur";

    return (
        <div className="min-h-screen bg-slate-100/50 flex justify-center">
            {/* Mobile/Tablet App Container */}
            <div className="w-full max-w-[600px] bg-white min-h-screen flex flex-col shadow-2xl relative shadow-slate-200/50 border-x border-slate-100">
                <MobileHeader userName={userName} userRole={userRole} />

                <main className="flex-1 pt-20 pb-24 px-5 overflow-y-auto overflow-x-hidden scrollbar-hide">
                    {children}
                </main>
            </div>
        </div>
    );
}
