import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
    return (
        <main className="flex h-screen items-center justify-center bg-slate-100">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl border border-slate-200">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 border-b-2 border-primary inline-block pb-1">CONSOLE ADMIN</h1>
                    <p className="text-slate-500 text-sm mt-2">Accès réservé aux administrateurs de la plate-forme</p>
                </div>
                <LoginForm hideSignUp={true} />
            </div>
        </main>
    );
}
