import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function PanelDashboardPage() {
    const session = await auth();

    // Simple redirection logic for now, middleware handles the heavy lifting
    if (!session) {
        redirect("/panel/signin");
    }

    const user = session.user as any;

    if (user.userType === "admin") {
        redirect("/admin/dashboard");
    }

    if (user.role === "agent") {
        redirect("/dashboard/agent");
    }

    // Default for Particular/Enterprise
    redirect("/assujetti/dashboard");

    return null;
}
