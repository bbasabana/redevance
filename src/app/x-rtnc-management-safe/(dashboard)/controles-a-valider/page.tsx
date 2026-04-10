import { getPendingControlsAction } from "./actions";
import { ControlesAValiderClient } from "./ControlesAValiderClient";

export default async function ControlesAValiderPage() {
  const result = await getPendingControlsAction();
  const list = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Contrôles terrain à valider
        </h1>
        <p className="text-slate-500 mt-1">
          Comparer les données constatées par l&apos;agent aux données en base et approuver ou rejeter les mises à jour.
        </p>
      </div>
      <ControlesAValiderClient initialList={list} />
    </div>
  );
}
