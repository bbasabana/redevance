import { LoginSlider } from "@/components/auth/login-slider";
import { LoginForm } from "@/components/auth/login-form";

// Explicit requirement: Prevent browser caching so the back button doesn't reload a cached sign-in page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LoginPage() {
    return (
        <main className="flex min-h-screen min-h-[100dvh] overflow-hidden">
            {/* Left Side - Slider (50%) */}
            <div className="hidden md:flex md:w-[50%] min-h-full shrink-0">
                <LoginSlider />
            </div>

            {/* Right Side - Form (50%) — scrollable so all content is visible on tablet */}
            <div className="w-full md:w-[50%] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-50 p-4 sm:p-6 md:p-6 lg:p-8 py-8 md:py-10">
                <LoginForm />
            </div>
        </main>
    );
}
