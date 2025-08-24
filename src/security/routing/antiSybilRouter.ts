// Anti-Sybil routing with path scoring and wormhole detection
// Implements RSSI/latency/hop penalty scoring with smoothing

export interface PeerLink {
  peerId: string;
  rssi: number;
  latency: number;
  hopCount: number;
  lastSeen: number;
  verified: boolean;
}

export interface PathScore {
  peerId: string;
  score: number;
  rssiWeight: number;
  latencyWeight: number;
  hopPenalty: number;
  wormholeDetected: boolean;
}

export interface RoutingConfig {
  rssiWeight: number;
  latencyWeight: number;
  hopPenaltyWeight: number;
  latencySmoothingFactor: number;
  wormholeLatencyThreshold: number;
  maxTtlHops: number;
  identityCreationRateLimit: number;
}

export class AntiSybilRouter {
  private peerLinks = new Map<string, PeerLink>();
  private pathScores = new Map<string, PathScore>();
  private smoothedLatencies = new Map<string, number>();
  private identityCreationLog = new Map<string, number[]>(); // deviceId -> timestamps
  private readonly config: RoutingConfig;

  constructor(config: Partial<RoutingConfig> = {}) {
    this.config = {
      rssiWeight: 0.4,
      latencyWeight: 0.3,
      hopPenaltyWeight: 0.3,
      latencySmoothingFactor: 0.8,
      wormholeLatencyThreshold: 3.0, // 3x expected latency
      maxTtlHops: 6,
      identityCreationRateLimit: 5, // per hour
      ...config
    };
  }

  /**
   * Update peer link metrics and recalculate path scores
   */
  updatePeerLink(peerId: string, rssi: number, latency: number, hopCount: number, verified: boolean): void {
    const now = Date.now();
    
    // Smooth latency measurements to prevent single-sample spikes
    const smoothedLatency = this.smoothLatency(peerId, latency);
    
    const link: PeerLink = {
      peerId,
      rssi,
      latency: smoothedLatency,
      hopCount,
      lastSeen: now,
      verified
    };

    this.peerLinks.set(peerId, link);
    this.calculatePathScore(peerId, link);
  }

  /**
   * Calculate path score with anti-wormhole detection
   */
  private calculatePathScore(peerId: string, link: PeerLink): void {
    // Normalize RSSI (-100 to -30 dBm typical range)
    const normalizedRssi = Math.max(0, Math.min(1, (link.rssi + 100) / 70));
    
    // Normalize latency (0-1000ms typical range)
    const normalizedLatency = Math.max(0, Math.min(1, 1 - (link.latency / 1000)));
    
    // Hop penalty (exponential decay)
    const hopPenalty = Math.pow(0.8, link.hopCount);
    
    // Calculate base score
    let score = (
      this.config.rssiWeight * normalizedRssi +
      this.config.latencyWeight * normalizedLatency +
      this.config.hopPenaltyWeight * hopPenalty
    );

    // Wormhole detection: check if latency is inconsistent with hop count
    const wormholeDetected = this.detectWormhole(link);
    if (wormholeDetected) {
      score *= 0.1; // Heavily penalize suspected wormholes
    }

    // Penalize unverified peers
    if (!link.verified) {
      score *= 0.5;
    }

    const pathScore: PathScore = {
      peerId,
      score,
      rssiWeight: normalizedRssi,
      latencyWeight: normalizedLatency,
      hopPenalty,
      wormholeDetected
    };

    this.pathScores.set(peerId, pathScore);
  }

  /**
   * Detect potential wormhole attacks based on latency/distance inconsistency
   */
  private detectWormhole(link: PeerLink): boolean {
    // Expected latency increases with hop count (rough heuristic)
    const expectedLatencyMs = 20 + (link.hopCount * 30); // Base + per-hop latency
    const threshold = expectedLatencyMs * this.config.wormholeLatencyThreshold;
    
    // Flag as wormhole if latency is suspiciously low for hop count
    if (link.latency < expectedLatencyMs * 0.3 && link.hopCount > 2) {
      console.warn(`Potential wormhole detected: ${link.peerId}, latency: ${link.latency}ms, hops: ${link.hopCount}`);
      return true;
    }

    // Also flag if latency is extremely high (possible attack/loop)
    if (link.latency > threshold) {
      console.warn(`Suspicious high latency: ${link.peerId}, latency: ${link.latency}ms, expected: ${expectedLatencyMs}ms`);
      return true;
    }

    return false;
  }

  /**
   * Smooth latency measurements to ignore single-sample spikes
   */
  private smoothLatency(peerId: string, newLatency: number): number {
    const existing = this.smoothedLatencies.get(peerId);
    if (!existing) {
      this.smoothedLatencies.set(peerId, newLatency);
      return newLatency;
    }

    // Exponential smoothing: new_value = α * measurement + (1-α) * old_value
    const smoothed = this.config.latencySmoothingFactor * existing + 
                    (1 - this.config.latencySmoothingFactor) * newLatency;
    
    this.smoothedLatencies.set(peerId, smoothed);
    return smoothed;
  }

  /**
   * Get best path to destination with TTL enforcement
   */
  getBestPath(destination: string, maxHops: number = this.config.maxTtlHops): string[] {
    // Simple greedy routing - in production, implement full path calculation
    const scores = Array.from(this.pathScores.values())
      .filter(score => score.peerId !== destination && !score.wormholeDetected)
      .sort((a, b) => b.score - a.score);

    if (scores.length === 0) {
      return [];
    }

    // Return single best hop for now
    return [scores[0].peerId];
  }

  /**
   * Check identity creation rate limit (anti-Sybil)
   */
  checkIdentityCreationRate(deviceId: string): boolean {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    
    let timestamps = this.identityCreationLog.get(deviceId) || [];
    
    // Remove old timestamps
    timestamps = timestamps.filter(ts => ts > hourAgo);
    
    // Check rate limit
    if (timestamps.length >= this.config.identityCreationRateLimit) {
      console.warn(`Identity creation rate limit exceeded for device: ${deviceId}`);
      return false;
    }

    // Record this attempt
    timestamps.push(now);
    this.identityCreationLog.set(deviceId, timestamps);
    
    return true;
  }

  /**
   * Validate TTL and decrement
   */
  validateTTL(ttl: number): { valid: boolean; newTtl: number } {
    if (ttl <= 0 || ttl > this.config.maxTtlHops) {
      return { valid: false, newTtl: 0 };
    }
    
    return { valid: true, newTtl: ttl - 1 };
  }

  /**
   * Get routing statistics for monitoring
   */
  getStats(): {
    totalPeers: number;
    verifiedPeers: number;
    wormholesDetected: number;
    averageScore: number;
    identityCreationAttempts: number;
  } {
    let verifiedCount = 0;
    let wormholeCount = 0;
    let totalScore = 0;
    let identityAttempts = 0;

    for (const link of this.peerLinks.values()) {
      if (link.verified) verifiedCount++;
    }

    for (const score of this.pathScores.values()) {
      if (score.wormholeDetected) wormholeCount++;
      totalScore += score.score;
    }

    for (const timestamps of this.identityCreationLog.values()) {
      identityAttempts += timestamps.length;
    }

    return {
      totalPeers: this.peerLinks.size,
      verifiedPeers: verifiedCount,
      wormholesDetected: wormholeCount,
      averageScore: this.pathScores.size > 0 ? totalScore / this.pathScores.size : 0,
      identityCreationAttempts: identityAttempts
    };
  }

  /**
   * Clean up expired peer links
   */
  cleanupExpired(): void {
    const expireTime = Date.now() - 5 * 60 * 1000; // 5 minutes
    
    for (const [peerId, link] of this.peerLinks) {
      if (link.lastSeen < expireTime) {
        this.peerLinks.delete(peerId);
        this.pathScores.delete(peerId);
        this.smoothedLatencies.delete(peerId);
      }
    }

    // Clean up old identity creation logs
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    for (const [deviceId, timestamps] of this.identityCreationLog) {
      const recent = timestamps.filter(ts => ts > dayAgo);
      if (recent.length === 0) {
        this.identityCreationLog.delete(deviceId);
      } else {
        this.identityCreationLog.set(deviceId, recent);
      }
    }
  }
}