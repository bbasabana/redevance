import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import Image from "next/image";
import Link from "next/link";

export default function AdminLoginPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Soft decorative background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
            
            <div className="relative z-10 w-full px-4">
                <div className="flex justify-center mb-10">
                    <Link href="/">
                        <Image
                            src="/logos/logo.png"
                            alt="Logo RTNC"
                            width={200}
                            height={60}
                            className="h-10 w-auto opacity-80"
                        />
                    </Link>
                </div>
                
                <AdminLoginForm />
            </div>
        </main>
    );
}
