/**
 * Point d’entrée unique de l’application admin (URL publique).
 * Le chemin historique `/admin` renvoie 404 côté middleware pour l’obfuscation.
 */
export const ADMIN_BASE_PATH = "/x-rtnc-management-safe" as const;

export type AdminBasePath = typeof ADMIN_BASE_PATH;
