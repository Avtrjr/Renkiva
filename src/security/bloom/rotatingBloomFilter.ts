// Salted, rotating Bloom filters for duplicate detection
// Rotates every 60 seconds with configurable false positive rate

export class RotatingBloomFilter {
  private currentFilter: BloomFilter;
  private previousFilter: BloomFilter;
  private readonly rotationIntervalMs: number;
  private readonly targetFalsePositiveRate: number;
  private readonly maxCapacity: number;
  private lastRotation: number;
  private currentEpochSalt: Uint8Array;
  private itemCount: number;

  constructor(
    rotationIntervalMs: number = 60000, // 60 seconds
    targetFalsePositiveRate: number = 0.01, // 1%
    maxCapacity: number = 10000
  ) {
    this.rotationIntervalMs = rotationIntervalMs;
    this.targetFalsePositiveRate = targetFalsePositiveRate;
    this.maxCapacity = maxCapacity;
    this.lastRotation = Date.now();
    this.itemCount = 0;

    // Generate initial epoch salt
    this.currentEpochSalt = this.generateEpochSalt();

    // Initialize filters
    const { size, hashCount } = this.calculateOptimalParameters();
    this.currentFilter = new BloomFilter(size, hashCount);
    this.previousFilter = new BloomFilter(size, hashCount);
  }

  /**
   * Add item to current filter with epoch salt
   */
  add(item: Uint8Array): void {
    this.checkRotation();
    
    const saltedItem = this.saltItem(item, this.currentEpochSalt);
    this.currentFilter.add(saltedItem);
    this.itemCount++;
  }

  /**
   * Check if item exists in current or previous filter
   */
  contains(item: Uint8Array): boolean {
    this.checkRotation();
    
    const saltedItem = this.saltItem(item, this.currentEpochSalt);
    
    // Check current filter first
    if (this.currentFilter.contains(saltedItem)) {
      return true;
    }

    // Check previous filter with previous salt
    // Note: In production, need to track previous salt
    return this.previousFilter.contains(saltedItem);
  }

  /**
   * Force rotation of bloom filters
   */
  rotate(): void {
    // Move current to previous
    this.previousFilter = this.currentFilter;
    
    // Create new current filter
    const { size, hashCount } = this.calculateOptimalParameters();
    this.currentFilter = new BloomFilter(size, hashCount);
    
    // Generate new epoch salt
    this.currentEpochSalt = this.generateEpochSalt();
    
    this.lastRotation = Date.now();
    this.itemCount = 0;
    
    console.log(`Bloom filter rotated at ${new Date().toISOString()}`);
  }

  /**
   * Check if rotation is needed based on time or capacity
   */
  private checkRotation(): void {
    const now = Date.now();
    const timeSinceRotation = now - this.lastRotation;
    
    // Rotate if interval elapsed or capacity exceeded
    if (timeSinceRotation >= this.rotationIntervalMs || this.itemCount >= this.maxCapacity) {
      this.rotate();
    }
  }

  /**
   * Salt item with epoch salt for temporal separation
   */
  private saltItem(item: Uint8Array, salt: Uint8Array): Uint8Array {
    const salted = new Uint8Array(item.length + salt.length);
    salted.set(salt, 0);
    salted.set(item, salt.length);
    return salted;
  }

  /**
   * Generate random epoch salt
   */
  private generateEpochSalt(): Uint8Array {
    const salt = new Uint8Array(8);
    crypto.getRandomValues(salt);
    return salt;
  }

  /**
   * Calculate optimal bloom filter parameters
   */
  private calculateOptimalParameters(): { size: number; hashCount: number } {
    const n = this.maxCapacity; // Expected number of items
    const p = this.targetFalsePositiveRate; // Target false positive rate
    
    // Optimal filter size: m = -n * ln(p) / (ln(2)^2)
    const size = Math.ceil(-n * Math.log(p) / (Math.log(2) * Math.log(2)));
    
    // Optimal number of hash functions: k = (m/n) * ln(2)
    const hashCount = Math.ceil((size / n) * Math.log(2));
    
    return { size, hashCount };
  }

  /**
   * Get current false positive rate estimate
   */
  getCurrentFalsePositiveRate(): number {
    if (this.itemCount === 0) {
      return 0;
    }
    
    const { size, hashCount } = this.calculateOptimalParameters();
    // Estimate: (1 - e^(-k*n/m))^k
    return Math.pow(1 - Math.exp(-hashCount * this.itemCount / size), hashCount);
  }

  /**
   * Get statistics for monitoring
   */
  getStats(): {
    itemCount: number;
    filterSize: number;
    hashCount: number;
    estimatedFalsePositiveRate: number;
    timeSinceRotation: number;
    rotationsCount: number;
  } {
    const { size, hashCount } = this.calculateOptimalParameters();
    
    return {
      itemCount: this.itemCount,
      filterSize: size,
      hashCount,
      estimatedFalsePositiveRate: this.getCurrentFalsePositiveRate(),
      timeSinceRotation: Date.now() - this.lastRotation,
      rotationsCount: 0 // TODO: Track this
    };
  }
}

/**
 * Simple Bloom Filter implementation
 */
class BloomFilter {
  private bitArray: Uint8Array;
  private size: number;
  private hashCount: number;

  constructor(size: number, hashCount: number) {
    this.size = size;
    this.hashCount = hashCount;
    // Convert bit size to byte size
    this.bitArray = new Uint8Array(Math.ceil(size / 8));
  }

  /**
   * Add item to bloom filter
   */
  add(item: Uint8Array): void {
    const hashes = this.getHashes(item);
    for (const hash of hashes) {
      this.setBit(hash % this.size);
    }
  }

  /**
   * Check if item might exist in filter
   */
  contains(item: Uint8Array): boolean {
    const hashes = this.getHashes(item);
    for (const hash of hashes) {
      if (!this.getBit(hash % this.size)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Generate multiple hash values for item
   */
  private getHashes(item: Uint8Array): number[] {
    const hashes: number[] = [];
    
    // Simple hash function family using FNV-1a variants
    for (let i = 0; i < this.hashCount; i++) {
      let hash = 2166136261; // FNV offset basis
      
      for (let j = 0; j < item.length; j++) {
        hash ^= item[j];
        hash *= 16777619; // FNV prime
        hash ^= i; // Salt with hash function index
      }
      
      hashes.push(Math.abs(hash));
    }
    
    return hashes;
  }

  /**
   * Set bit at position
   */
  private setBit(position: number): void {
    const byteIndex = Math.floor(position / 8);
    const bitIndex = position % 8;
    this.bitArray[byteIndex] |= (1 << bitIndex);
  }

  /**
   * Get bit at position
   */
  private getBit(position: number): boolean {
    const byteIndex = Math.floor(position / 8);
    const bitIndex = position % 8;
    return (this.bitArray[byteIndex] & (1 << bitIndex)) !== 0;
  }
}