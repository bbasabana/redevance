import { ADMIN_BASE_PATH } from "./config";

/** Clés d’icônes gérées par la sidebar (mapping lucide côté client). */
export type AdminNavIconKey =
    | "dashboard"
    | "users"
    | "settings"
    | "reports"
    | "declarations"
    | "recensement"
    | "notes"
    | "notifications"
    | "zones"
    | "tarifs"
    | "periodes"
    | "audit"
    | "shield";

export type AdminNavItem = {
    title: string;
    /** Segment URL sous ADMIN_BASE_PATH (vide = accueil). */
    segment: string;
    icon: AdminNavIconKey;
    /** Si false : page “Bientôt disponible” mais menu présent pour l’architecture. */
    implemented: boolean;
    description?: string;
};

/**
 * Menu principal administration RTNC — ordre = ordre d’affichage.
 * Toute nouvelle zone admin doit être ajoutée ici en premier lieu.
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
    {
        title: "Tableau de bord",
        segment: "",
        icon: "dashboard",
        implemented: true,
        description: "KPI, recettes, assujettis, appareils et performances géographiques.",
    },
    {
        title: "Assujettis",
        segment: "assujettis",
        icon: "users",
        implemented: true,
        description: "Registre des assujettis et suivi des paiements.",
    },
    {
        title: "Contrôles à valider",
        segment: "controles-a-valider",
        icon: "declarations",
        implemented: true,
        description: "Validation des contrôles terrain (écarts agent vs registre).",
    },
    {
        title: "Statistiques & revenus",
        segment: "rapports/agents",
        icon: "reports",
        implemented: true,
        description: "Performances agents, déploiement terrain et indicateurs.",
    },
    {
        title: "Zones & communes",
        segment: "zones-communes",
        icon: "zones",
        implemented: true,
        description: "Circonscriptions fiscales et référentiel géographique.",
    },
    {
        title: "Tarifs",
        segment: "tarifs",
        icon: "tarifs",
        implemented: true,
        description: "Barèmes et grilles tarifaires par zone / typologie.",
    },
    {
        title: "Périodes",
        segment: "periodes",
        icon: "periodes",
        implemented: true,
        description: "Exercices, campagnes et clôtures de période.",
    },
    {
        title: "Audit logs",
        segment: "audit",
        icon: "audit",
        implemented: true,
        description: "Traçabilité des actions sensibles (connexions, modifications).",
    },
];

export function adminHref(segment: string): string {
    if (!segment) return ADMIN_BASE_PATH;
    return `${ADMIN_BASE_PATH}/${segment}`;
}

export function isAdminPath(pathname: string): boolean {
    return pathname === ADMIN_BASE_PATH || pathname.startsWith(`${ADMIN_BASE_PATH}/`);
}
