import { getAssujettisFinancialListAction } from "./actions";
import { AssujettiListClient } from "@/app/admin/(dashboard)/assujettis/AssujettiListClient";

export default async function AssujettisPage() {
    const res = await getAssujettisFinancialListAction();
    const initialData = res.success ? res.data : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestion des Assujettis</h1>
                    <p className="text-slate-500">Liste complète et suivi des paiements de la redevance.</p>
                </div>
            </div>

            <AssujettiListClient initialData={initialData} />
        </div>
    );
}
