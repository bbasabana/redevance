import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redisUrl = process.env.UPSTASH_REDIS_URL;
const redisToken = process.env.UPSTASH_REDIS_TOKEN;

if (!redisUrl || !redisToken) {
    console.warn("⚠️ Upstash Redis missing: Rate limiting disabled.");
}

export const redis = (redisUrl && redisToken)
    ? new Redis({ url: redisUrl, token: redisToken })
    : null;

// Create a new ratelimiter, that allows 5 requests per 10 seconds
export const loginRateLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 s"),
    analytics: true,
    prefix: "@upstash/ratelimit/login",
}) : {
    // Fallback object if redis is missing to avoid crashes
    limit: async () => ({ success: true, limit: 0, remaining: 0, reset: 0 }),
} as any;
