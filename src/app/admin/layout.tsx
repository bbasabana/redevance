import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/layout/header";
import { WelcomeNotification } from "@/components/notifications/welcome-notification";
import { Suspense } from "react";
import { auth } from "@/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const userName = session?.user?.name || "Administrateur";
    const userRole = (session?.user as any)?.role || "Admin IT";
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
