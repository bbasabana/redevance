import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Need to match what's in session.ts
const secretKey = process.env.AUTH_SECRET || "default_super_secret_key_change_me_in_production";
const key = new TextEncoder().encode(secretKey);

async function getSessionPayload(request: NextRequest, cookieName: string) {
    const session = request.cookies.get(cookieName)?.value;
    if (!session) return null;
    try {
        const { payload } = await jwtVerify(session, key, { algorithms: ["HS256"] });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { nextUrl } = request;
    const pathname = nextUrl.pathname;

    const session = await getSessionPayload(request, "auth_session");
    const pending = await getSessionPayload(request, "auth_pending");

    const isAgentRole = (r?: string) => ['agent', 'controleur', 'superviseur', 'directeur', 'sous_directeur', 'dg', 'admin'].includes(r || '');
    const isAssujettiRole = (r?: string) => ['assujetti', 'entreprise', 'particulier', 'particular'].includes(r || '');

    // ── Espace Auth Publique (Login / Signup) ─────────────────────────────────
    const isAuthRoute = pathname.startsWith("/panel/signin") || pathname.startsWith("/panel/signup");
    if (isAuthRoute && session) {
        // Déjà connecté -> Redirection basée sur le rôle
        const role = session.role as string;
        if (isAgentRole(role)) {
            return NextResponse.redirect(new URL(role === "admin" ? "/admin/dashboard" : "/dashboard/agent", request.url));
        } else if (isAssujettiRole(role)) {
            return NextResponse.redirect(new URL("/assujetti/dashboard", request.url));
        }
    }

    // ── Routes Agent & Admin ─────────────────────────────────────────────────
    if (pathname.startsWith('/agent') || pathname.startsWith('/dashboard/agent') || pathname.startsWith('/admin')) {
        if (!session) return NextResponse.redirect(new URL('/panel/signin', request.url));

        const role = session.role as string;
        if (!isAgentRole(role)) {
            return NextResponse.redirect(new URL('/panel/signin', request.url));
        }
    }

    // ── Espace Assujetti (Dashboard & Sous-routes) ───────────────────────────
    if (pathname.startsWith('/assujetti') && !pathname.startsWith('/assujetti/identification')) {
        if (!session) return NextResponse.redirect(new URL('/panel/signin', request.url));

        const role = session.role as string;

        // Agents can NEVER access assujetti routes
        if (isAgentRole(role)) {
            return NextResponse.redirect(new URL(role === "admin" ? "/admin/dashboard" : "/dashboard/agent", request.url));
        }

        if (!isAssujettiRole(role)) {
            return NextResponse.redirect(new URL('/panel/signin', request.url));
        }

        // Must be active (identification completed)
        if (!session.is_active) {
            return NextResponse.redirect(new URL('/assujetti/identification?step=1', request.url));
        }
    }

    // ── Page Identification ──────────────────────────────────────────────────
    if (pathname.startsWith('/assujetti/identification')) {
        if (!session) return NextResponse.redirect(new URL('/panel/signin', request.url));

        const role = session.role as string;

        // Agents NEVER access identification
        if (isAgentRole(role)) {
            return NextResponse.redirect(new URL(role === "admin" ? "/admin/dashboard" : "/dashboard/agent", request.url));
        }

        // Assujetti déjà actif n'a plus rien à faire ici
        if (session.is_active) {
            return NextResponse.redirect(new URL('/assujetti/dashboard', request.url));
        }
    }

    // ── Pages de Setup 2FA / Verify 2FA ──────────────────────────────────────
    if (pathname.startsWith('/panel/setup-2fa') || pathname.startsWith('/panel/verify-2fa') || pathname.startsWith('/panel/first-login-2fa')) {
        if (!pending && !session) {
            return NextResponse.redirect(new URL('/panel/signin', request.url));
        }
    }

    let response = NextResponse.next();

    if (isAuthRoute || pathname.startsWith("/panel/setup-2fa") || pathname.startsWith("/panel/verify-2fa")) {
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");
    }

    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
