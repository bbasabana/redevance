/**
 * Layout racine de l’espace admin (URL : ADMIN_BASE_PATH).
 * Le shell (sidebar + header) est dans `(dashboard)/layout.tsx` pour exclure `/login`.
 */
export default function SecureAdminRootLayout({ children }: { children: React.ReactNode }) {
    return children;
}
