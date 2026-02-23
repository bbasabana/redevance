import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NoteTaxationWizard from "@/components/assujetti/NoteTaxationWizard";

export const metadata = {
    title: "Nouvelle Note de Taxation | RTNC Redevance",
    description: "Établir une nouvelle note de taxation pour la redevance audiovisuelle.",
};

export default async function NewNoteTaxationPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <NoteTaxationWizard session={session} />
        </div>
    );
}
