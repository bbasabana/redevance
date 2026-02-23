import Dexie, { type Table } from "dexie";

export interface PendingSync {
    id?: number;
    type: "recensement" | "declaration";
    data: any;
    status: "pending" | "syncing" | "error";
    error?: string;
    createdAt: number;
}

export class OfflineDB extends Dexie {
    pendingSync!: Table<PendingSync>;

    constructor() {
        super("RedevanceOfflineDB");
        this.version(1).stores({
            pendingSync: "++id, type, status, createdAt" // Primary key and indexed fields
        });
    }
}

// Guard: Only instantiate Dexie on the client (IndexedDB is not available on the server)
export const offlineDB = typeof window !== "undefined" ? new OfflineDB() : null as unknown as OfflineDB;
