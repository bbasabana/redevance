import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.AUTH_SECRET || "default_super_secret_key_change_me_in_production";
const key = new TextEncoder().encode(secretKey);

export type MobileSessionPayload = {
  userId: string;
  role: string;
  is_active: boolean;
  expiresAt: string;
};

export async function createMobileSessionToken(
  userId: string,
  role: string,
  is_active: boolean,
  durationHours: number = 8
): Promise<string> {
  const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
  return new SignJWT({ userId, role, is_active, expiresAt: expiresAt.toISOString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${durationHours}h`)
    .sign(key);
}

export async function verifyMobileToken(token: string): Promise<MobileSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload as unknown as MobileSessionPayload;
  } catch {
    return null;
  }
}

export function getBearerTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}
