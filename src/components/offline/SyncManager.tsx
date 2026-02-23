"use client";

import React, { useEffect } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { offlineDB } from "@/lib/offline/db";
import { toast } from "sonner";
import { WifiOff, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SyncManager() {
    const { isOnline, syncing } = useOfflineSync();

    useEffect(() => {
        if (isOnline) {
            handleSync();
        }
    }, [isOnline]);

    const handleSync = async () => {
        const pendingItems = await offlineDB.pendingSync
            .where("status")
            .equals("pending")
            .toArray();

        if (pendingItems.length === 0) return;

        toast.info(`Synchronisation de ${pendingItems.length} éléments en cours...`);

        for (const item of pendingItems) {
            try {
                // Update status to syncing
                await offlineDB.pendingSync.update(item.id!, { status: "syncing" });

                // In a real scenario, we would call the specific server action here
                // For now, we simulate a successful sync
                console.log(`Syncing ${item.type}:`, item.data);

                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Delete from local DB after successful sync
                await offlineDB.pendingSync.delete(item.id!);
            } catch (error) {
                console.error(`Failed to sync item ${item.id}:`, error);
                await offlineDB.pendingSync.update(item.id!, {
                    status: "pending", // Reset to pending to retry later
                    error: String(error)
                });
            }
        }

        toast.success("Synchronisation terminée !");
    };

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]"
                >
                    <div className="bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
                        <WifiOff className="w-4 h-4" />
                        Mode Hors-ligne actif
                    </div>
                </motion.div>
            )}
            {syncing && (
                <motion.div
                    initial={{ bottom: -50, opacity: 0 }}
                    animate={{ bottom: 20, opacity: 1 }}
                    exit={{ bottom: -50, opacity: 0 }}
                    className="fixed bottom-10 right-10 z-[100]"
                >
                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        Synchronisation...
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
