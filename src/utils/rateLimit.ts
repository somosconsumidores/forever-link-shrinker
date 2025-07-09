// Rate limiting utility for client-side protection
interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  checkLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry) {
      this.limits.set(identifier, {
        count: 1,
        firstRequest: now,
        lastRequest: now
      });
      return { allowed: true };
    }

    // If window has expired, reset
    if (now - entry.firstRequest > this.windowMs) {
      this.limits.set(identifier, {
        count: 1,
        firstRequest: now,
        lastRequest: now
      });
      return { allowed: true };
    }

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      const retryAfter = Math.ceil((entry.firstRequest + this.windowMs - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Update count
    entry.count++;
    entry.lastRequest = now;
    this.limits.set(identifier, entry);

    return { allowed: true };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now - entry.firstRequest > this.windowMs) {
        this.limits.delete(key);
      }
    }
  }
}

// Export singleton instances
export const urlShortenLimiter = new RateLimiter(60000, 5); // 5 requests per minute
export const authenticatedLimiter = new RateLimiter(60000, 20); // 20 requests per minute for authenticated users