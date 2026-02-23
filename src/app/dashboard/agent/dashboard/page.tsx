import { db } from "@/db";
import { appUsers, geographies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import AgentDashboardClient from "./agent-dashboard-client";

export default async function AgentDashboard() {
    const session = await getSession();
    if (!session || !session.user.userId) {
        redirect("/panel/signin");
    }

    // Fetch Agent details including assigned commune
    const [agent] = await db.select({
        id: appUsers.id,
        identifiantAgent: appUsers.identifiantAgent,
        assignedCommuneId: appUsers.assignedCommuneId,
    })
        .from(appUsers)
        .where(eq(appUsers.id, session.user.userId))
        .limit(1);

    if (!agent) {
        redirect("/panel/signin");
    }

    let communeName = "Non affecté";
    if (agent.assignedCommuneId) {
        const [commune] = await db.select({
            nom: geographies.nom
        })
            .from(geographies)
            .where(eq(geographies.id, agent.assignedCommuneId))
            .limit(1);

        if (commune) {
            communeName = commune.nom;
        }
    }

    return (
        <AgentDashboardClient
            agentId={agent.identifiantAgent || "NON-ID"}
            communeName={communeName}
        />
    );
}
