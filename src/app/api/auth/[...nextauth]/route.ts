import { handlers } from "@/auth";

// Force dynamic so session is always fresh; refetchInterval in SessionProvider limits client polling (P90 target < 200ms)
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
