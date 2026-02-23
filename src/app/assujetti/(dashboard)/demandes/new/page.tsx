import { DeclarationWizard } from "@/components/assujetti/DeclarationWizard";

export default function NewDemandePage() {
    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Nouvelle Demande</h1>
                <p className="text-slate-500 mt-1">Veuillez remplir le formulaire ci-dessous pour soumettre votre déclaration récepteur.</p>
            </div>

            <DeclarationWizard />
        </div>
    );
}
