"use client";

import { useState, useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton({ className }: { className?: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleConfirm = () => {
        startTransition(async () => {
            await signOut({ callbackUrl: "/panel/signin" });
        });
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setOpen(true)}
                className={className ?? "flex items-center gap-2 px-3 py-1.5 bg-white text-red-600 rounded-full border border-slate-200 shadow-sm hover:bg-red-50 transition-all font-black text-[10px] uppercase tracking-tight"}
            >
                <LogOut className="w-3.5 h-3.5" />
                Déconnexion
            </button>

            {/* Confirmation Modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => !isPending && setOpen(false)}
                    />

                    {/* Dialog */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                            <LogOut className="w-7 h-7 text-red-500" />
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-bold text-slate-900">Confirmer la déconnexion</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Êtes-vous sûr de vouloir vous déconnecter&nbsp;? Votre progression sera sauvegardée.
                            </p>
                        </div>

                        <div className="flex gap-3 w-full mt-1">
                            <button
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isPending}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Déconnexion...
                                    </>
                                ) : (
                                    "Se déconnecter"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
