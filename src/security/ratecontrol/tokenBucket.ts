// Token bucket rate limiter with per-peer and global controls
// Implements exponential backoff on authentication failures

import { TokenBucket, SecurityError, SecurityException } from '../crypto/types';

export class RateLimiter {
  private peerBuckets = new Map<string, TokenBucket>();
  private globalBucket: TokenBucket;
  private authFailures = new Map<string, { count: number; lastFailure: number }>();
  private readonly maxTokens: number;
  private readonly refillRate: number;
  private readonly globalCapacity: number;

  constructor(
    maxTokens: number = 100,
    refillRate: number = 10,
    globalCapacity: number = 1000
  ) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.globalCapacity = globalCapacity;
    
    this.globalBucket = {
      tokens: globalCapacity,
      capacity: globalCapacity,
      refill_rate: refillRate * 10, // Global bucket refills faster
      last_refill: Date.now()
    };
  }

  /**
   * Check if peer can send data (consumes token if allowed)
   */
  checkRateLimit(peerId: string, dataSize: number = 1): boolean {
    // Check authentication failure backoff first
    if (this.isInBackoff(peerId)) {
      return false;
    }

    // Get or create peer bucket
    let peerBucket = this.peerBuckets.get(peerId);
    if (!peerBucket) {
      peerBucket = {
        tokens: this.maxTokens,
        capacity: this.maxTokens,
        refill_rate: this.refillRate,
        last_refill: Date.now()
      };
      this.peerBuckets.set(peerId, peerBucket);
    }

    // Refill buckets
    this.refillBucket(peerBucket);
    this.refillBucket(this.globalBucket);

    // Check if both peer and global buckets have sufficient tokens
    if (peerBucket.tokens >= dataSize && this.globalBucket.tokens >= dataSize) {
      peerBucket.tokens -= dataSize;
      this.globalBucket.tokens -= dataSize;
      return true;
    }

    return false;
  }

  /**
   * Record authentication failure and apply exponential backoff
   */
  recordAuthFailure(peerId: string): void {
    const failure = this.authFailures.get(peerId) || { count: 0, lastFailure: 0 };
    failure.count += 1;
    failure.lastFailure = Date.now();
    this.authFailures.set(peerId, failure);

    // Log security event
    console.warn(`Authentication failure for peer ${peerId}, count: ${failure.count}`);
  }

  /**
   * Clear authentication failures on successful verification
   */
  clearAuthFailures(peerId: string): void {
    this.authFailures.delete(peerId);
  }

  /**
   * Check if peer is in exponential backoff period
   */
  private isInBackoff(peerId: string): boolean {
    const failure = this.authFailures.get(peerId);
    if (!failure || failure.count === 0) {
      return false;
    }

    // Exponential backoff: base_ms * 2^(failures-1), max 60 seconds
    const baseBackoffMs = 1000; // 1 second
    const maxBackoffMs = 60000; // 60 seconds
    const backoffMs = Math.min(baseBackoffMs * Math.pow(2, failure.count - 1), maxBackoffMs);
    
    const timeSinceFailure = Date.now() - failure.lastFailure;
    return timeSinceFailure < backoffMs;
  }

  /**
   * Refill bucket based on elapsed time
   */
  private refillBucket(bucket: TokenBucket): void {
    const now = Date.now();
    const elapsed = (now - bucket.last_refill) / 1000; // Convert to seconds
    const tokensToAdd = elapsed * bucket.refill_rate;
    
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.last_refill = now;
  }

  /**
   * Get current token counts for monitoring
   */
  getStats(): {
    totalPeers: number;
    globalTokens: number;
    peersInBackoff: number;
    averagePeerTokens: number;
  } {
    const now = Date.now();
    let totalTokens = 0;
    let peersInBackoff = 0;

    for (const [peerId, bucket] of this.peerBuckets) {
      this.refillBucket(bucket);
      totalTokens += bucket.tokens;
      
      if (this.isInBackoff(peerId)) {
        peersInBackoff++;
      }
    }

    return {
      totalPeers: this.peerBuckets.size,
      globalTokens: this.globalBucket.tokens,
      peersInBackoff,
      averagePeerTokens: this.peerBuckets.size > 0 ? totalTokens / this.peerBuckets.size : 0
    };
  }

  /**
   * Clean up expired peer buckets
   */
  cleanupExpired(): void {
    const expireTime = Date.now() - 10 * 60 * 1000; // 10 minutes
    
    for (const [peerId, bucket] of this.peerBuckets) {
      if (bucket.last_refill < expireTime) {
        this.peerBuckets.delete(peerId);
      }
    }

    // Clean up old auth failures
    for (const [peerId, failure] of this.authFailures) {
      if (failure.lastFailure < expireTime) {
        this.authFailures.delete(peerId);
      }
    }
  }
}