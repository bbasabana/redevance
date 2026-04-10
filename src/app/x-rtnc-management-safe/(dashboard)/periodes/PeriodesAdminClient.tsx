"use client";

import { useState, useTransition } from "react";
import { CalendarRange, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    createPeriodeAction,
    deletePeriodeAction,
    listPeriodesAction,
    updatePeriodeAction,
    type PeriodeRow,
} from "./actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FormState = {
    id?: string;
    exercice: string;
    dateOuverture: string;
    dateFermeture: string;
    isActive: boolean;
};

const emptyForm = (): FormState => ({
    exercice: String(new Date().getFullYear()),
    dateOuverture: "",
    dateFermeture: "",
    isActive: true,
});

export function PeriodesAdminClient({ initialData }: { initialData: PeriodeRow[] }) {
    const [rows, setRows] = useState(initialData);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm());
    const [isEdit, setIsEdit] = useState(false);
    const [pending, startTransition] = useTransition();

    const refresh = async () => {
        const res = await listPeriodesAction();
        if (res.success) setRows(res.data);
    };

    const openCreate = () => {
        setIsEdit(false);
        setForm(emptyForm());
        setOpen(true);
    };

    const openEdit = (row: PeriodeRow) => {
        setIsEdit(true);
        setForm({
            id: row.id,
            exercice: String(row.exercice),
            dateOuverture: row.dateOuverture,
            dateFermeture: row.dateFermeture,
            isActive: row.isActive !== false,
        });
        setOpen(true);
    };

    const submit = () => {
        const ex = parseInt(form.exercice, 10);
        if (!Number.isFinite(ex)) {
            toast.error("Millésime d’exercice invalide.");
            return;
        }
        if (!form.dateOuverture || !form.dateFermeture) {
            toast.error("Indiquez les deux dates.");
            return;
        }

        startTransition(async () => {
            if (isEdit && form.id) {
                const res = await updatePeriodeAction({
                    id: form.id,
                    exercice: ex,
                    dateOuverture: form.dateOuverture,
                    dateFermeture: form.dateFermeture,
                    isActive: form.isActive,
                });
                if (res.success) {
                    toast.success("Période mise à jour.");
                    setOpen(false);
                    await refresh();
                } else toast.error(res.error);
            } else {
                const res = await createPeriodeAction({
                    exercice: ex,
                    dateOuverture: form.dateOuverture,
                    dateFermeture: form.dateFermeture,
                    isActive: form.isActive,
                });
                if (res.success) {
                    toast.success("Période créée.");
                    setOpen(false);
                    await refresh();
                } else toast.error(res.error);
            }
        });
    };

    const remove = (row: PeriodeRow) => {
        if (!confirm(`Supprimer la période d’exercice ${row.exercice} ?`)) return;
        startTransition(async () => {
            const res = await deletePeriodeAction(row.id);
            if (res.success) {
                toast.success("Période supprimée.");
                await refresh();
            } else toast.error(res.error);
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Périodes de déclaration</h1>
                    <p className="text-slate-500 mt-1 max-w-2xl">
                        Fenêtres d’ouverture et de fermeture par exercice (`periodes_declaration`). Utile pour la
                        planification et les contrôles métier ; les déclarations référencent l’exercice numérique.
                    </p>
                </div>
                <Button onClick={openCreate} className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/15">
                    <Plus className="w-4 h-4" />
                    Nouvelle période
                </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80">
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Exercice
                                </th>
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Ouverture
                                </th>
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Fermeture
                                </th>
                                <th className="text-center font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Active
                                </th>
                                <th className="text-right px-4 py-3 w-28" />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                        Aucune période définie. Créez-en une pour documenter les campagnes.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => (
                                    <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-black text-slate-900 flex items-center gap-2">
                                            <CalendarRange className="w-4 h-4 text-primary opacity-80" />
                                            {row.exercice}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-slate-700">{row.dateOuverture}</td>
                                        <td className="px-4 py-3 font-mono text-slate-700">{row.dateFermeture}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={cn(
                                                    "text-[10px] font-black uppercase px-2 py-1 rounded-full",
                                                    row.isActive !== false
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-500"
                                                )}
                                            >
                                                {row.isActive !== false ? "Oui" : "Non"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-xl"
                                                onClick={() => openEdit(row)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-xl text-red-600"
                                                onClick={() => remove(row)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
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
                        <DialogTitle>{isEdit ? "Modifier la période" : "Nouvelle période"}</DialogTitle>
                        <DialogDescription>Dates inclusives de la campagne de déclaration.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Exercice (année)</Label>
                            <Input
                                type="number"
                                className="rounded-xl font-mono"
                                value={form.exercice}
                                onChange={(e) => setForm((f) => ({ ...f, exercice: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Ouverture</Label>
                                <Input
                                    type="date"
                                    className="rounded-xl"
                                    value={form.dateOuverture}
                                    onChange={(e) => setForm((f) => ({ ...f, dateOuverture: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fermeture</Label>
                                <Input
                                    type="date"
                                    className="rounded-xl"
                                    value={form.dateFermeture}
                                    onChange={(e) => setForm((f) => ({ ...f, dateFermeture: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="pactive"
                                checked={form.isActive}
                                onCheckedChange={(c) => setForm((f) => ({ ...f, isActive: c === true }))}
                            />
                            <Label htmlFor="pactive" className="font-normal cursor-pointer">
                                Période marquée comme active
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                            Annuler
                        </Button>
                        <Button className="rounded-xl font-bold" onClick={submit} disabled={pending}>
                            {pending ? "…" : isEdit ? "Enregistrer" : "Créer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
