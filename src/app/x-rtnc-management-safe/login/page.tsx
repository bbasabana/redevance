import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import Image from "next/image";
import Link from "next/link";
import { ADMIN_BASE_PATH } from "@/admin/config";

export default function SecureAdminLoginPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
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

                <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Accès réservé — console{" "}
                    <span className="text-slate-600">{ADMIN_BASE_PATH}</span>
                </p>
            </div>
        </main>
    );
}
