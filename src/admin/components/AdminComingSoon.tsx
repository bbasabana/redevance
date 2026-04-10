import { Construction } from "lucide-react";

export function AdminComingSoon({ title, description }: { title: string; description?: string }) {
    return (
        <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white p-10 md:p-14 text-center space-y-4 shadow-sm">
            <Construction className="w-12 h-12 md:w-14 md:h-14 mx-auto text-amber-500" aria-hidden />
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
            {description ? <p className="text-slate-600 max-w-xl mx-auto font-medium">{description}</p> : null}
            <p className="text-sm text-slate-400 font-medium">
                Fonctionnalité prévue dans la feuille de route — la navigation et l’architecture admin sont prêtes.
            </p>
        </div>
    );
}
