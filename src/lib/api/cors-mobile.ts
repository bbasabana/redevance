/**
 * CORS pour l'API mobile.
 * L'app Flutter n'utilise pas de cookies (auth par Bearer token).
 * Ces en-têtes permettent une communication stable mobile ↔ Next.js.
 */

export const MOBILE_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
};

export function withCorsHeaders(init?: ResponseInit): ResponseInit {
  const headers = new Headers(init?.headers);
  Object.entries(MOBILE_CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
  return { ...init, headers };
}
