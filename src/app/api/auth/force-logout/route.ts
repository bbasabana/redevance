import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const deleted = url.searchParams.get("deleted");

    const cookieStore = cookies();

    // Clear custom JWT sessions
    cookieStore.delete("auth_session");
    cookieStore.delete("auth_pending");

    // Clear NextAuth sessions (depending on environment, it might use Secure prefix)
    cookieStore.delete("authjs.session-token");
    cookieStore.delete("__Secure-authjs.session-token");
    cookieStore.delete("authjs.callback-url");
    cookieStore.delete("authjs.csrf-token");

    // Build redirect URL
    const redirectUrl = new URL("/panel/signin", request.url);
    if (deleted) {
        redirectUrl.searchParams.set("error", "Compte supprimé ou introuvable.");
    }

    return NextResponse.redirect(redirectUrl);
}
