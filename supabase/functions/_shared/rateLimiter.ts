/**
 * Rate Limiting Utility
 * Implements per-user rate limiting for edge functions
 */

interface RateLimit {
  count: number;
  resetAt: number;
}

// In-memory store (consider using Redis/Supabase for production)
const rateLimitStore = new Map<string, RateLimit>();

/**
 * Check if a user has exceeded their rate limit
 * @param userId - User identifier
 * @param maxPerHour - Maximum requests per hour
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(userId: string, maxPerHour: number): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(userId);

  // No existing limit or expired - create new
  if (!limit || now > limit.resetAt) {
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + 3600000, // 1 hour in ms
    });
    return true;
  }

  // Check if limit exceeded
  if (limit.count >= maxPerHour) {
    return false;
  }

  // Increment counter
  limit.count++;
  return true;
}

/**
 * Get remaining requests for a user
 */
export function getRemainingRequests(userId: string, maxPerHour: number): number {
  const limit = rateLimitStore.get(userId);
  if (!limit || Date.now() > limit.resetAt) {
    return maxPerHour;
  }
  return Math.max(0, maxPerHour - limit.count);
}

/**
 * Get time until rate limit resets (in seconds)
 */
export function getResetTime(userId: string): number {
  const limit = rateLimitStore.get(userId);
  if (!limit || Date.now() > limit.resetAt) {
    return 0;
  }
  return Math.ceil((limit.resetAt - Date.now()) / 1000);
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupExpiredLimits(): void {
  const now = Date.now();
  for (const [userId, limit] of rateLimitStore.entries()) {
    if (now > limit.resetAt) {
      rateLimitStore.delete(userId);
    }
  }
}

// Auto-cleanup every 10 minutes
setInterval(cleanupExpiredLimits, 600000);
