import { AdminSidebar } from "@/admin/components/AdminSidebar";
import { Header } from "@/components/layout/header";
import { auth } from "@/auth";

export default async function AdminDashboardShellLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const userName = session?.user?.name || "Direction Générale";
    const rawRole = (session?.user as { role?: string } | undefined)?.role;
    const userRole =
        rawRole === "admin" ? "Super Admin RTNC" : rawRole || "Super Admin RTNC";

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    userName={userName}
                    userTitle={userRole}
                    showLogo={false}
                    className="border-b border-indigo-100/50 bg-white/80 backdrop-blur-md"
                />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8">{children}</div>
                </main>
            </div>
        </div>
    );
}
