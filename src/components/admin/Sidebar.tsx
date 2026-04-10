"use client";

import { AdminSidebar } from "@/admin/components/AdminSidebar";

/** Alias historique — la console admin utilise toujours `AdminSidebar` et `ADMIN_BASE_PATH`. */
export function Sidebar(_props?: { variant?: "admin" | "agent" }) {
    return <AdminSidebar />;
}
