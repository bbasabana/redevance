import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import Credentials from "next-auth/providers/credentials";
import { adminUsers, appUsers, roles, userRoles } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { loginRateLimit } from "./lib/auth/redis";
import { headers } from "next/headers";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db),
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const email = credentials.email as string;
                const password = credentials.password as string;

                // Rate limiting based on IP
                try {
                    const ip = headers().get("x-forwarded-for") ?? "127.0.0.1";
                    const { success } = await loginRateLimit.limit(ip);
                    if (!success) {
                        throw new Error("TOO_MANY_ATTEMPTS");
                    }
                } catch (e) {
                    // Fallback if Redis fails or headers not available
                    console.error("Rate limit check failed:", e);
                }

                // 1. Try Admin Users (IT Admins)
                const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
                console.log("Auth Authorize - Checking Admin for email:", email, !!admin);
                if (admin) {
                    const isValid = await bcrypt.compare(password, admin.passwordHash);
                    if (isValid) {
                        return {
                            id: admin.id,
                            email: admin.email,
                            name: admin.nomPrenom,
                            userType: "admin",
                            role: "admin",
                            twoFactorEnabled: admin.twoFactorEnabled,
                        };
                    }
                }

                // 2. Try App Users (Agents, Assujettis, etc.)
                const [userWithRole] = await db
                    .select({
                        user: appUsers,
                        roleName: roles.name,
                    })
                    .from(appUsers)
                    .leftJoin(userRoles, eq(appUsers.id, userRoles.userId))
                    .leftJoin(roles, eq(userRoles.roleId, roles.id))
                    .where(eq(appUsers.email, email))
                    .limit(1);

                console.log("Auth Authorize - Checking App User for email:", email, !!userWithRole, "Role:", userWithRole?.roleName);

                if (userWithRole) {
                    const { user, roleName } = userWithRole;
                    const isValid = await bcrypt.compare(password, user.passwordHash);
                    if (isValid) {
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.nomPrenom,
                            userType: "app",
                            role: roleName || "assujetti",
                            twoFactorEnabled: user.twoFactorEnabled,
                        };
                    }
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                console.log("Auth Callback JWT - User log in:", user.email, "Type:", (user as any).userType);
                token.id = user.id;
                token.userType = (user as any).userType;
                token.role = (user as any).role;
                token.twoFactorEnabled = (user as any).twoFactorEnabled;
                token.twoFactorVerified = false;
            }

            if (trigger === "update") {
                if (session?.twoFactorVerified !== undefined) token.twoFactorVerified = session.twoFactorVerified;
                if (session?.twoFactorEnabled !== undefined) token.twoFactorEnabled = session.twoFactorEnabled;
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // console.log("Auth Callback Session - Mapping token for:", token.email, "Role:", token.role);
                (session.user as any).id = token.id;
                (session.user as any).userType = token.userType;
                (session.user as any).role = token.role;
                (session.user as any).twoFactorEnabled = token.twoFactorEnabled;
                (session.user as any).twoFactorVerified = token.twoFactorVerified;
            }
            return session;
        },
    },
    pages: {
        signIn: "/panel/signin",
    },
});
