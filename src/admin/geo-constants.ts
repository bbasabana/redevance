/** Aligné sur `geographyTypeEnum` dans le schéma Drizzle. */
export const ADMIN_GEO_TYPES = [
    "PROVINCE",
    "VILLE",
    "TERRITOIRE",
    "CITE",
    "SECTEUR",
    "CHEFFERIE",
    "COMMUNE",
    "QUARTIER",
    "GROUPEMENT",
] as const;

export type AdminGeoType = (typeof ADMIN_GEO_TYPES)[number];

export const ADMIN_LOC_CATS = ["URBAINE", "URBANO_RURALE", "RURALE"] as const;

export type AdminLocCat = (typeof ADMIN_LOC_CATS)[number];

export const GEO_TYPE_LABELS: Record<AdminGeoType, string> = {
    PROVINCE: "Province",
    VILLE: "Ville",
    TERRITOIRE: "Territoire",
    CITE: "Cité",
    SECTEUR: "Secteur",
    CHEFFERIE: "Chefferie",
    COMMUNE: "Commune",
    QUARTIER: "Quartier",
    GROUPEMENT: "Groupement",
};

export const LOC_CAT_LABELS: Record<AdminLocCat, string> = {
    URBAINE: "Urbaine",
    URBANO_RURALE: "Urbano-rurale",
    RURALE: "Rurale",
};
