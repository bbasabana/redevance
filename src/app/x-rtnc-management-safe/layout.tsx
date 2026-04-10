import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/layout/header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    
    // Simple protection for now, middleware will do the heavy lifting
    if (!session || (session.user as any)?.role !== "ADMIN") {
        // redirect("/x-rtnc-management-safe/login");
    }

    const userName = session?.user?.name || "Direction Générale";
    const userRole = "Super Admin RTNC";

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            {/* Sidebar for Admin */}
            <Sidebar variant="admin" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    userName={userName} 
                    userTitle={userRole} 
                    showLogo={false}
                    className="border-b border-indigo-100/50 bg-white/80 backdrop-blur-md"
                />
                
                <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
