import { LoginSlider } from "@/components/auth/login-slider";
import { LoginForm } from "@/components/auth/login-form";

// Explicit requirement: Prevent browser caching so the back button doesn't reload a cached sign-in page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LoginPage() {
    return (
        <main className="flex h-screen overflow-hidden">
            {/* Left Side - Slider (50%) */}
            <div className="hidden md:block md:w-[50%] h-full">
                <LoginSlider />
            </div>

            {/* Right Side - Form (50%) */}
            <div className="w-full md:w-[50%] flex items-center justify-center p-8 bg-slate-50">
                <LoginForm />
            </div>
        </main>
    );
}
