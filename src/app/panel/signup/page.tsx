import { RegisterForm } from "@/components/assujetti/register-form";
import { Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] relative overflow-x-hidden">
            <div className="flex flex-col items-center mb-10 transition-all duration-500">
                <Link href="/" className="hover:opacity-90 transition-opacity">
                    <Image
                        src="/logos/logo.png"
                        alt="RTNC Logo"
                        width={200}
                        height={66}
                        className="h-12 sm:h-16 w-auto mb-4 drop-shadow-sm"
                        priority
                    />
                </Link>
                <p className="text-slate-400 mt-1 text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] text-center max-w-sm">
                    Portail d'enregistrement assujetti
                </p>
            </div>

            <RegisterForm />

            <footer className="mt-8 text-center text-[10px] text-slate-400 font-medium tracking-widest uppercase opacity-60">
                © 2026 RTNC • Système Intégré de Gestion de la Redevance
            </footer>
        </main>
    );
}
