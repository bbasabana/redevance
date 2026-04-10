"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pwa_install_dismissed";

type InstallPromptEventLike = Event & {
    prompt: () => Promise<{ outcome?: string } | void>;
};

/** Survit aux remontages React (ex. Strict Mode) : un seul `beforeinstallprompt` par chargement. */
let capturedInstallEvent: InstallPromptEventLike | null = null;

export function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEventLike | null>(null);
    const [visible, setVisible] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const standalone = (window as Window & { matchMedia?: (q: string) => { matches: boolean } }).matchMedia?.("(display-mode: standalone)").matches;
        const isStandalone = standalone || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        const dismissed = sessionStorage.getItem(STORAGE_KEY);
        if (dismissed === "1") return;

        if (capturedInstallEvent) {
            setDeferredPrompt(capturedInstallEvent);
            setVisible(true);
        }

        const handler = (e: Event) => {
            const ev = e as InstallPromptEventLike;
            if (typeof ev.prompt !== "function") return;
            ev.preventDefault();
            capturedInstallEvent = ev;
            setDeferredPrompt(ev);
            setVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        const ev = deferredPrompt ?? capturedInstallEvent;
        if (!ev || typeof ev.prompt !== "function") return;
        try {
            await ev.prompt();
            setVisible(false);
            setDeferredPrompt(null);
            capturedInstallEvent = null;
        } catch (_) {
            setVisible(false);
        }
    };

    const handleDismiss = useCallback(() => {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setVisible(false);
        setDeferredPrompt(null);
        capturedInstallEvent = null;
    }, []);

    if (!visible || isInstalled) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 pb-8 pointer-events-none sm:items-center sm:p-6">
            <div
                className={cn(
                    "pointer-events-auto w-full max-w-md rounded-3xl shadow-2xl border-2 border-slate-200 bg-white overflow-hidden",
                    "animate-in fade-in slide-in-from-bottom-4 duration-300"
                )}
                role="dialog"
                aria-labelledby="pwa-title"
                aria-describedby="pwa-desc"
            >
                <div className="relative p-6 pt-8">
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        aria-label="Fermer"
                    >
                        <X size={18} />
                    </button>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#0d2870]/10 flex items-center justify-center text-[#0d2870]">
                            <Smartphone size={32} />
                        </div>
                    </div>
                    <h2 id="pwa-title" className="text-center text-lg font-black text-slate-900 uppercase tracking-tight">
                        Installer l&apos;application
                    </h2>
                    <p id="pwa-desc" className="text-center text-sm text-slate-500 mt-2 px-2">
                        Ajoutez RTNC Redevance sur votre écran d&apos;accueil pour un accès rapide et une meilleure expérience.
                    </p>
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest transition-colors hover:bg-slate-50"
                        >
                            Passer
                        </button>
                        <button
                            type="button"
                            onClick={handleInstall}
                            className="flex-1 py-3.5 rounded-2xl bg-[#0d2870] text-white font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-[#0b2058] transition-colors"
                        >
                            <Download size={18} />
                            Installer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
