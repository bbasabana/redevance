import { Sidebar } from "@/components/agent/Sidebar";
import { Header } from "@/components/layout/header";
import { WelcomeNotification } from "@/components/notifications/welcome-notification";
import { Suspense } from "react";
import { auth } from "@/auth";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const userName = session?.user?.name || "Agent RTNC";
    const userRole = (session?.user as any)?.role || "Contrôleur";
    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header userName={userName} userTitle={userRole} />
                <main className="flex-1 overflow-y-auto p-8">
                    <Suspense>
                        <WelcomeNotification />
                    </Suspense>
                    {children}
                </main>
            </div>
        </div>
    );
}
