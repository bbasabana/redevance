"use client";

import { useState, useTransition } from "react";
import {
  getControlDetailAction,
  approveControlAction,
  rejectControlAction,
  type PendingControlRow,
  type ControlDetailForAdmin,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, XCircle, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LABELS: Record<string, string> = {
  nomRaisonSociale: "Nom / Raison sociale",
  typePersonne: "Type (Physique/Morale)",
  nif: "NIF",
  rccm: "RCCM",
  idNat: "ID National",
  representantLegal: "Représentant légal",
  adresseSiege: "Adresse siège",
  typeActivite: "Catégorie (activité)",
  sousTypePm: "Sous-type PM",
};

export function ControlesAValiderClient({
  initialList,
}: {
  initialList: PendingControlRow[];
}) {
  const [list, setList] = useState<PendingControlRow[]>(initialList);
  const [detail, setDetail] = useState<ControlDetailForAdmin | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openDetail = (id: string) => {
    setLoadingDetailId(id);
    getControlDetailAction(id).then((res) => {
      setLoadingDetailId(null);
      if (res.success) setDetail(res.data);
      else toast.error(res.error);
    });
  };

  const closeDetail = () => setDetail(null);

  const handleApprove = (controleId: string) => {
    startTransition(async () => {
      const res = await approveControlAction(controleId);
      if (res.success) {
        toast.success("Contrôle approuvé. Les données assujetti ont été mises à jour.");
        setList((prev) => prev.filter((r) => r.id !== controleId));
        closeDetail();
      } else toast.error(res.error);
    });
  };

  const handleReject = (controleId: string) => {
    startTransition(async () => {
      const res = await rejectControlAction(controleId);
      if (res.success) {
        toast.success("Contrôle rejeté.");
        setList((prev) => prev.filter((r) => r.id !== controleId));
        closeDetail();
      } else toast.error(res.error);
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <span className="text-sm font-medium text-slate-500">
            {list.length} contrôle(s) en attente de validation
          </span>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-slate-500 py-8 text-center">
              Aucun contrôle en attente. Les nouveaux contrôles terrain apparaîtront ici pour comparaison et validation.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {list.map((row) => (
                <li key={row.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {row.nomAssujetti ?? "—"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {row.identifiantFiscal ?? "—"} · Exercice {row.exercice}
                      {row.dateControle && (
                        <> · {new Date(row.dateControle).toLocaleDateString("fr-FR")}</>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      TV: {row.nbTvDeclare} → {row.nbTvConstate} · Radio: {row.nbRadioDeclare} → {row.nbRadioConstate}
                      {row.montantTotal != null && (
                        <> · Montant: {Number(row.montantTotal).toLocaleString()} FC</>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetail(row.id)}
                    disabled={loadingDetailId === row.id}
                  >
                    {loadingDetailId === row.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Voir & comparer
                      </>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {detail && (
        <DetailModal
          detail={detail}
          onClose={closeDetail}
          onApprove={() => handleApprove(detail.controleId)}
          onReject={() => handleReject(detail.controleId)}
          isPending={isPending}
        />
      )}
    </>
  );
}

function DetailModal({
  detail,
  onClose,
  onApprove,
  onReject,
  isPending,
}: {
  detail: ControlDetailForAdmin;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            Comparaison · Contrôle {detail.controleId.slice(0, 8)}…
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Exercice {detail.exercice}
            {detail.dateControle && ` · ${new Date(detail.dateControle).toLocaleDateString("fr-FR")}`}
            {detail.montantTotal != null && ` · ${Number(detail.montantTotal).toLocaleString()} FC`}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
              Données identité / légales
            </h3>
            <div className="space-y-3">
              {(["nomRaisonSociale", "typePersonne", "nif", "rccm", "idNat", "representantLegal", "adresseSiege", "typeActivite", "sousTypePm"] as const).map(
                (key) => {
                  const oldVal = detail.ancien[key] ?? "—";
                  const newVal = detail.nouveau[key] ?? "—";
                  const differ = String(oldVal).trim().toUpperCase() !== String(newVal).trim().toUpperCase();
                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-xl border-2 ${
                        differ ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          {LABELS[key] ?? key}
                        </span>
                        {differ && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            Écart
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">En base</p>
                          <p className="font-medium text-slate-700 break-words">{oldVal || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#0d2870] uppercase">Constaté</p>
                          <p className="font-medium text-slate-900 break-words">{newVal || "—"}</p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
              Équipements
            </h3>
            <p className="text-sm text-slate-600">
              TV déclaré {detail.nbTvDeclare} → constaté {detail.nbTvConstate} · Radio déclaré{" "}
              {detail.nbRadioDeclare} → constaté {detail.nbRadioConstate}
            </p>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Fermer
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={onReject}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
              Rejeter
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={onApprove}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
              Approuver et mettre à jour l&apos;assujetti
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
