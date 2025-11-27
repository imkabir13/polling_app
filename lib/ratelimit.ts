import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory rate limiting for development (no Redis needed)
class MemoryRatelimit {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.maxRequests = limit;
    this.windowMs = windowMs;
  }

  async limit(identifier: string): Promise<{ success: boolean }> {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the time window
    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (validRequests.length >= this.maxRequests) {
      this.requests.set(identifier, validRequests);
      return { success: false };
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return { success: true };
  }
}

// Type for rate limiter interface
interface RateLimiter {
  limit(identifier: string): Promise<{ success: boolean }>;
}

// Create rate limiter based on environment
export const createRateLimiter = (): RateLimiter => {
  // If Upstash Redis credentials are available, use Redis-based rate limiting
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 votes per hour per IP
      analytics: true,
    }) as RateLimiter;
  }

  // Fallback to in-memory rate limiting for development
  console.warn(
    "⚠️ Using in-memory rate limiting. For production, configure Upstash Redis."
  );
  return new MemoryRatelimit(5, 60 * 60 * 1000) as RateLimiter; // 5 votes per hour
};

export const voteRateLimiter = createRateLimiter();
