import { LoginForm } from "@/components/auth/login-form";

export default function VaultLoginPage() {
    return (
        <main className="flex h-screen items-center justify-center bg-slate-900">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 underline decoration-yellow-400 decoration-4">IT ADM VAULT</h1>
                    <p className="text-slate-500 text-sm mt-2">Restricted Access - IT Administrators Only</p>
                </div>
                <LoginForm hideSignUp={true} />
            </div>
        </main>
    );
}
