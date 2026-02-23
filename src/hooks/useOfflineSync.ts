"use client";

import { useEffect, useState } from "react";
import { offlineDB, type PendingSync } from "@/lib/offline/db";
import { toast } from "sonner";

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(
        typeof window !== "undefined" ? window.navigator.onLine : true
    );
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Function to add data to sync queue
    const queueForSync = async (type: "recensement" | "declaration", data: any) => {
        try {
            await offlineDB.pendingSync.add({
                type,
                data,
                status: "pending",
                createdAt: Date.now()
            });
            if (!isOnline) {
                toast.info("Mode hors-ligne : Les données seront envoyées dès le retour de la connexion.");
            }
        } catch (error) {
            console.error("Failed to queue for sync:", error);
            toast.error("Erreur de sauvegarde locale.");
        }
    };

    return { isOnline, syncing, queueForSync };
}
