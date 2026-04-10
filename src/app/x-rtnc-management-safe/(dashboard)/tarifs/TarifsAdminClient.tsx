"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    createTarifRuleAction,
    deleteTarifRuleAction,
    listTarifRulesAction,
    updateTarifRuleAction,
    type TarifRuleRow,
} from "./actions";
import { toast } from "sonner";

const CATEGORIES = [
    { value: "URBAINE", label: "Urbaine" },
    { value: "URBANO_RURALE", label: "Urbano-rurale" },
    { value: "RURALE", label: "Rurale" },
] as const;

const ENTITY_TYPES = [
    { value: "pm", label: "Personne morale (PM)" },
    { value: "pmta", label: "PM tenu à l’affichage (PMTA)" },
    { value: "ppta", label: "PP tenu à l’affichage (PPTA)" },
] as const;

const DEVICES = [
    { value: "Téléviseurs", label: "Téléviseurs" },
    { value: "Radios", label: "Radios" },
] as const;

type FormState = {
    id?: string;
    category: (typeof CATEGORIES)[number]["value"];
    entityType: (typeof ENTITY_TYPES)[number]["value"];
    categorieAppareil: (typeof DEVICES)[number]["value"];
    price: string;
    currency: string;
};

const emptyForm = (): FormState => ({
    category: "URBAINE",
    entityType: "pm",
    categorieAppareil: "Téléviseurs",
    price: "",
    currency: "USD",
});

export function TarifsAdminClient({ initialData }: { initialData: TarifRuleRow[] }) {
    const [rows, setRows] = useState(initialData);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm());
    const [isEdit, setIsEdit] = useState(false);
    const [pending, startTransition] = useTransition();

    const refreshFromServer = async () => {
        const res = await listTarifRulesAction();
        if (res.success) setRows(res.data);
    };

    const openCreate = () => {
        setIsEdit(false);
        setForm(emptyForm());
        setOpen(true);
    };

    const openEdit = (row: TarifRuleRow) => {
        setIsEdit(true);
        setForm({
            id: row.id,
            category: row.category,
            entityType: row.entityType,
            categorieAppareil: (row.categorieAppareil as FormState["categorieAppareil"]) || "Téléviseurs",
            price: row.price,
            currency: row.currency || "USD",
        });
        setOpen(true);
    };

    const submit = () => {
        const priceNum = Number(form.price.replace(",", "."));
        if (!Number.isFinite(priceNum) || priceNum <= 0) {
            toast.error("Indiquez un montant valide.");
            return;
        }

        startTransition(async () => {
            if (isEdit && form.id) {
                const res = await updateTarifRuleAction({
                    id: form.id,
                    category: form.category,
                    entityType: form.entityType,
                    categorieAppareil: form.categorieAppareil,
                    price: priceNum,
                    currency: form.currency || "USD",
                });
                if (res.success) {
                    toast.success("Règle mise à jour.");
                    setOpen(false);
                    await refreshFromServer();
                } else {
                    toast.error(res.error);
                }
            } else {
                const res = await createTarifRuleAction({
                    category: form.category,
                    entityType: form.entityType,
                    categorieAppareil: form.categorieAppareil,
                    price: priceNum,
                    currency: form.currency || "USD",
                });
                if (res.success) {
                    toast.success("Règle créée.");
                    setOpen(false);
                    await refreshFromServer();
                } else {
                    toast.error(res.error);
                }
            }
        });
    };

    const remove = (row: TarifRuleRow) => {
        if (!confirm(`Supprimer la règle ${labelRow(row)} ?`)) return;
        startTransition(async () => {
            const res = await deleteTarifRuleAction(row.id);
            if (res.success) {
                toast.success("Règle supprimée.");
                await refreshFromServer();
            } else {
                toast.error(res.error);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tarifs & barèmes</h1>
                    <p className="text-slate-500 mt-1 max-w-2xl">
                        Grille utilisée pour le calcul des notes de taxation (catégorie de lieu × type d’entité ×
                        appareil). Les valeurs sont alignées sur le moteur métier (recherche par triple clé).
                    </p>
                </div>
                <Button onClick={openCreate} className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/15">
                    <Plus className="w-4 h-4" />
                    Nouvelle règle
                </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80">
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Zone
                                </th>
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Type entité
                                </th>
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Appareil
                                </th>
                                <th className="text-right font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Prix
                                </th>
                                <th className="text-right font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3 w-32">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                        Aucune règle en base. Ajoutez-en une pour alimenter la taxation.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => (
                                    <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {CATEGORIES.find((c) => c.value === row.category)?.label ?? row.category}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {ENTITY_TYPES.find((e) => e.value === row.entityType)?.label ?? row.entityType}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {row.categorieAppareil ?? (
                                                <span className="text-amber-600 font-medium">Non défini</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                                            {Number(row.price).toLocaleString("fr-FR", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}{" "}
                                            <span className="text-slate-400 font-sans font-medium text-xs">
                                                {row.currency || "USD"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl text-slate-500 hover:text-primary"
                                                    onClick={() => openEdit(row)}
                                                    aria-label="Modifier"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl text-slate-500 hover:text-red-600"
                                                    onClick={() => remove(row)}
                                                    aria-label="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <DollarSign className="w-5 h-5 text-primary" />
                            {isEdit ? "Modifier la règle" : "Nouvelle règle"}
                        </DialogTitle>
                        <DialogDescription>
                            Clé métier : zone tarifaire + type d’entité (PM / PMTA / PPTA) + catégorie d’appareil (libellé
                            exact attendu par le calculateur).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        <div className="space-y-2">
                            <Label>Catégorie de lieu</Label>
                            <Select
                                value={form.category}
                                onValueChange={(v) =>
                                    setForm((f) => ({ ...f, category: v as FormState["category"] }))
                                }
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Type d’entité</Label>
                            <Select
                                value={form.entityType}
                                onValueChange={(v) =>
                                    setForm((f) => ({ ...f, entityType: v as FormState["entityType"] }))
                                }
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ENTITY_TYPES.map((e) => (
                                        <SelectItem key={e.value} value={e.value}>
                                            {e.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Appareil</Label>
                            <Select
                                value={form.categorieAppareil}
                                onValueChange={(v) =>
                                    setForm((f) => ({ ...f, categorieAppareil: v as FormState["categorieAppareil"] }))
                                }
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEVICES.map((d) => (
                                        <SelectItem key={d.value} value={d.value}>
                                            {d.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Montant</Label>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    className="rounded-xl font-mono"
                                    value={form.price}
                                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Devise</Label>
                                <Input
                                    className="rounded-xl font-mono uppercase"
                                    maxLength={3}
                                    value={form.currency}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                            Annuler
                        </Button>
                        <Button type="button" className="rounded-xl font-bold" onClick={submit} disabled={pending}>
                            {pending ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Créer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function labelRow(row: TarifRuleRow) {
    return `${row.category} / ${row.entityType} / ${row.categorieAppareil ?? "?"}`;
}
