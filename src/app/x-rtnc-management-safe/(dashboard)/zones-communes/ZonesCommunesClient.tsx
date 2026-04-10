"use client";

import { useState, useTransition } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    createGeographyAction,
    deleteGeographyAction,
    listGeographiesAdminAction,
    updateGeographyAction,
    type GeographyAdminRow,
} from "./actions";
import { ADMIN_GEO_TYPES, ADMIN_LOC_CATS, GEO_TYPE_LABELS, LOC_CAT_LABELS } from "@/admin/geo-constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FormState = {
    id?: string;
    nom: string;
    type: (typeof ADMIN_GEO_TYPES)[number];
    parentId: string;
    category: string;
    isActive: boolean;
};

const emptyForm = (): FormState => ({
    nom: "",
    type: "COMMUNE",
    parentId: "",
    category: "",
    isActive: true,
});

export function ZonesCommunesClient({ initialData }: { initialData: GeographyAdminRow[] }) {
    const [rows, setRows] = useState(initialData);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm());
    const [isEdit, setIsEdit] = useState(false);
    const [pending, startTransition] = useTransition();

    const refresh = async () => {
        const res = await listGeographiesAdminAction();
        if (res.success) setRows(res.data);
    };

    const openCreate = () => {
        setIsEdit(false);
        setForm(emptyForm());
        setOpen(true);
    };

    const openEdit = (row: GeographyAdminRow) => {
        setIsEdit(true);
        setForm({
            id: row.id,
            nom: row.nom,
            type: row.type,
            parentId: row.parentId ?? "",
            category: row.category ?? "",
            isActive: row.isActive !== false,
        });
        setOpen(true);
    };

    const submit = () => {
        if (!form.nom.trim()) {
            toast.error("Le nom est obligatoire.");
            return;
        }

        startTransition(async () => {
            const parentId = form.parentId || null;
            const category =
                form.category === "" ? null : (form.category as (typeof ADMIN_LOC_CATS)[number]);

            if (isEdit && form.id) {
                const res = await updateGeographyAction({
                    id: form.id,
                    nom: form.nom.trim(),
                    type: form.type,
                    parentId,
                    category,
                    isActive: form.isActive,
                });
                if (res.success) {
                    toast.success("Lieu mis à jour.");
                    setOpen(false);
                    await refresh();
                } else toast.error(res.error);
            } else {
                const res = await createGeographyAction({
                    nom: form.nom.trim(),
                    type: form.type,
                    parentId,
                    category,
                    isActive: form.isActive,
                });
                if (res.success) {
                    toast.success("Lieu créé.");
                    setOpen(false);
                    await refresh();
                } else toast.error(res.error);
            }
        });
    };

    const remove = (row: GeographyAdminRow) => {
        if (!confirm(`Supprimer « ${row.nom} » ?`)) return;
        startTransition(async () => {
            const res = await deleteGeographyAction(row.id);
            if (res.success) {
                toast.success("Lieu supprimé.");
                await refresh();
            } else toast.error(res.error);
        });
    };

    const parentOptions = rows.filter((r) => !isEdit || r.id !== form.id);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Zones & communes</h1>
                    <p className="text-slate-500 mt-1 max-w-2xl">
                        Référentiel géographique hiérarchique. La <strong>catégorie de localisation</strong> (Urbaine /
                        Rurale…) est utilisée pour résoudre les barèmes de taxation en remontant la hiérarchie.
                    </p>
                </div>
                <Button onClick={openCreate} className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/15">
                    <Plus className="w-4 h-4" />
                    Ajouter un lieu
                </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80">
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Nom
                                </th>
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Type
                                </th>
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Parent
                                </th>
                                <th className="text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Cat. fiscal
                                </th>
                                <th className="text-center font-bold text-slate-600 uppercase text-[10px] tracking-wider px-4 py-3">
                                    Actif
                                </th>
                                <th className="text-right px-4 py-3 w-32" />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                        Aucune géographie. Importez des données ou créez un lieu manuellement.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => (
                                    <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary shrink-0 opacity-70" />
                                            {row.nom}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {GEO_TYPE_LABELS[row.type] ?? row.type}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {row.parentNom ?? "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.category ? (
                                                <span className="text-xs font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">
                                                    {LOC_CAT_LABELS[row.category as keyof typeof LOC_CAT_LABELS] ??
                                                        row.category}
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 text-xs font-medium">Non défini</span>
                                            )}
                                        </td>
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
                                            <div className="flex justify-end gap-1">
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
                <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Modifier le lieu" : "Nouveau lieu"}</DialogTitle>
                        <DialogDescription>
                            Rattachez le lieu à un parent (province → ville → commune, etc.) et renseignez la catégorie
                            fiscale lorsque c’est pertinent pour les barèmes.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Nom</Label>
                            <Input
                                className="rounded-xl"
                                value={form.nom}
                                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                                placeholder="Ex. Gombe"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={form.type}
                                onValueChange={(v) =>
                                    setForm((f) => ({ ...f, type: v as FormState["type"] }))
                                }
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ADMIN_GEO_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {GEO_TYPE_LABELS[t]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Parent (optionnel)</Label>
                            <Select
                                value={form.parentId || "__none__"}
                                onValueChange={(v) =>
                                    setForm((f) => ({ ...f, parentId: v === "__none__" ? "" : v }))
                                }
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Aucun" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">— Aucun —</SelectItem>
                                    {parentOptions.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            [{GEO_TYPE_LABELS[r.type]}] {r.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Catégorie fiscale du lieu</Label>
                            <Select
                                value={form.category || "__unset__"}
                                onValueChange={(v) =>
                                    setForm((f) => ({
                                        ...f,
                                        category: v === "__unset__" ? "" : v,
                                    }))
                                }
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Non défini" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__unset__">— Non défini —</SelectItem>
                                    {ADMIN_LOC_CATS.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {LOC_CAT_LABELS[c]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="active"
                                checked={form.isActive}
                                onCheckedChange={(c) => setForm((f) => ({ ...f, isActive: c === true }))}
                            />
                            <Label htmlFor="active" className="font-normal cursor-pointer">
                                Lieu actif (affichage / usage métier)
                            </Label>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
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
