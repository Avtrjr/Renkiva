// Moderation Bulletins - Distributed content blocking with multi-sig quorum
// Hash blocks and origin revocations propagated via mesh network

import { CryptoPrimitives } from '../crypto/primitives';

export enum BulletinType {
  HASH_BLOCK = 'HASH_BLOCK',
  ORIGIN_REVOKE = 'ORIGIN_REVOKE'
}

export interface ModerationBulletin {
  id: string;                   // Unique bulletin ID
  issuedAt: number;            // Unix timestamp (milliseconds)
  expiresAt: number;           // Unix timestamp (milliseconds)
  type: BulletinType;          // HASH_BLOCK or ORIGIN_REVOKE
  subject: Uint8Array;         // SHA-256 for HASH_BLOCK, pubkey for ORIGIN_REVOKE
  reasons: string[];           // Human-readable reasons
  signatures: ModeratorSignature[]; // Multi-sig quorum
  version: number;             // Bulletin format version
}

export interface ModeratorSignature {
  moderatorPubKey: Uint8Array; // Moderator's public key (32 bytes)
  signature: Uint8Array;       // Ed25519 signature (64 bytes)
  timestamp: number;           // When signature was created
}

export interface BulletinQuorum {
  isValid(bulletin: ModerationBulletin, required?: string): Promise<boolean>;
  getRequiredSignatures(requirement: string): { required: number; total: number };
  addSignature(bulletin: ModerationBulletin, moderatorKeyHandle: string): Promise<ModerationBulletin>;
  verifySignature(bulletin: ModerationBulletin, signature: ModeratorSignature): Promise<boolean>;
}

export interface BulletinStore {
  add(bulletin: ModerationBulletin): Promise<void>;
  get(id: string): Promise<ModerationBulletin | null>;
  list(type?: BulletinType, activeOnly?: boolean): Promise<ModerationBulletin[]>;
  isBlocked(subject: Uint8Array, type: BulletinType): Promise<boolean>;
  cleanup(): Promise<number>; // Remove expired bulletins
  search(query: string): Promise<ModerationBulletin[]>;
}

export class BulletinQuorumImpl implements BulletinQuorum {
  private crypto = CryptoPrimitives.getInstance();
  private trustedModerators = new Set<string>(); // Hex-encoded public keys

  constructor(moderatorKeys: Uint8Array[] = []) {
    // Initialize with trusted moderator keys
    for (const key of moderatorKeys) {
      const keyHex = Array.from(key).map(b => b.toString(16).padStart(2, '0')).join('');
      this.trustedModerators.add(keyHex);
    }
  }

  async isValid(bulletin: ModerationBulletin, required: string = '2of3'): Promise<boolean> {
    try {
      const { required: reqCount, total: totalCount } = this.getRequiredSignatures(required);
      
      // Check we have enough signatures
      if (bulletin.signatures.length < reqCount) {
        return false;
      }

      // Verify each signature
      let validSignatures = 0;
      const seenModerators = new Set<string>();
      
      for (const sig of bulletin.signatures) {
        // Check moderator is trusted
        const moderatorHex = Array.from(sig.moderatorPubKey)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        if (!this.trustedModerators.has(moderatorHex)) {
          console.warn(`Untrusted moderator: ${moderatorHex}`);
          continue;
        }

        // Prevent duplicate signatures from same moderator
        if (seenModerators.has(moderatorHex)) {
          console.warn(`Duplicate signature from moderator: ${moderatorHex}`);
          continue;
        }

        // Verify signature
        const isValidSig = await this.verifySignature(bulletin, sig);
        if (isValidSig) {
          validSignatures++;
          seenModerators.add(moderatorHex);
        }
      }

      return validSignatures >= reqCount;
    } catch (error) {
      console.error('Quorum validation failed:', error);
      return false;
    }
  }

  getRequiredSignatures(requirement: string): { required: number; total: number } {
    const match = requirement.match(/^(\d+)of(\d+)$/);
    if (!match) {
      throw new Error(`Invalid quorum requirement: ${requirement}`);
    }
    
    const required = parseInt(match[1]);
    const total = parseInt(match[2]);
    
    if (required > total || required <= 0 || total <= 0) {
      throw new Error(`Invalid quorum numbers: ${required} of ${total}`);
    }
    
    return { required, total };
  }

  async addSignature(
    bulletin: ModerationBulletin,
    moderatorKeyHandle: string
  ): Promise<ModerationBulletin> {
    try {
      // Create canonical representation for signing
      const canonicalData = this.createCanonicalBulletinData(bulletin);
      
      // Sign the canonical data
      const signature = await this.crypto.ed25519Sign(moderatorKeyHandle, canonicalData);
      
      // For now, we'll need the public key to be passed separately
      // In a real implementation, the key handle would contain the public key
      const moderatorPubKey = new Uint8Array(32); // Placeholder
      
      const moderatorSignature: ModeratorSignature = {
        moderatorPubKey,
        signature,
        timestamp: Date.now()
      };

      // Add signature to bulletin
      const updatedBulletin: ModerationBulletin = {
        ...bulletin,
        signatures: [...bulletin.signatures, moderatorSignature]
      };

      return updatedBulletin;
    } catch (error) {
      throw new Error(`Failed to add moderator signature: ${error}`);
    }
  }

  async verifySignature(
    bulletin: ModerationBulletin,
    signature: ModeratorSignature
  ): Promise<boolean> {
    try {
      // Create canonical representation
      const canonicalData = this.createCanonicalBulletinData(bulletin);
      
      // Verify Ed25519 signature
      return await this.crypto.ed25519Verify(
        signature.moderatorPubKey,
        signature.signature,
        canonicalData
      );
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  addTrustedModerator(publicKey: Uint8Array): void {
    const keyHex = Array.from(publicKey).map(b => b.toString(16).padStart(2, '0')).join('');
    this.trustedModerators.add(keyHex);
  }

  removeTrustedModerator(publicKey: Uint8Array): void {
    const keyHex = Array.from(publicKey).map(b => b.toString(16).padStart(2, '0')).join('');
    this.trustedModerators.delete(keyHex);
  }

  private createCanonicalBulletinData(bulletin: ModerationBulletin): Uint8Array {
    // Create deterministic representation excluding signatures
    const canonicalData = {
      id: bulletin.id,
      issuedAt: bulletin.issuedAt,
      expiresAt: bulletin.expiresAt,
      type: bulletin.type,
      subject: Array.from(bulletin.subject),
      reasons: [...bulletin.reasons].sort(), // Sort for determinism
      version: bulletin.version
    };

    const jsonString = JSON.stringify(canonicalData, Object.keys(canonicalData).sort());
    return new TextEncoder().encode(jsonString);
  }
}

export class BulletinStoreImpl implements BulletinStore {
  private bulletins = new Map<string, ModerationBulletin>();
  private hashIndex = new Map<string, Set<string>>(); // hash -> bulletin IDs
  private originIndex = new Map<string, Set<string>>(); // origin -> bulletin IDs

  async add(bulletin: ModerationBulletin): Promise<void> {
    try {
      // Validate bulletin
      const validation = this.validateBulletin(bulletin);
      if (!validation.valid) {
        throw new Error(`Invalid bulletin: ${validation.errors.join(', ')}`);
      }

      // Store bulletin
      this.bulletins.set(bulletin.id, bulletin);
      
      // Update indices
      const subjectHex = Array.from(bulletin.subject)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      if (bulletin.type === BulletinType.HASH_BLOCK) {
        if (!this.hashIndex.has(subjectHex)) {
          this.hashIndex.set(subjectHex, new Set());
        }
        this.hashIndex.get(subjectHex)!.add(bulletin.id);
      } else if (bulletin.type === BulletinType.ORIGIN_REVOKE) {
        if (!this.originIndex.has(subjectHex)) {
          this.originIndex.set(subjectHex, new Set());
        }
        this.originIndex.get(subjectHex)!.add(bulletin.id);
      }

      console.log(`Added bulletin ${bulletin.id} (${bulletin.type})`);
    } catch (error) {
      throw new Error(`Failed to add bulletin: ${error}`);
    }
  }

  async get(id: string): Promise<ModerationBulletin | null> {
    return this.bulletins.get(id) || null;
  }

  async list(type?: BulletinType, activeOnly: boolean = true): Promise<ModerationBulletin[]> {
    const now = Date.now();
    const results: ModerationBulletin[] = [];

    for (const bulletin of this.bulletins.values()) {
      // Filter by type if specified
      if (type && bulletin.type !== type) continue;
      
      // Filter expired if activeOnly
      if (activeOnly && bulletin.expiresAt <= now) continue;
      
      results.push(bulletin);
    }

    // Sort by issuedAt (newest first)
    return results.sort((a, b) => b.issuedAt - a.issuedAt);
  }

  async isBlocked(subject: Uint8Array, type: BulletinType): Promise<boolean> {
    const subjectHex = Array.from(subject)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const index = type === BulletinType.HASH_BLOCK ? this.hashIndex : this.originIndex;
    const bulletinIds = index.get(subjectHex);
    
    if (!bulletinIds) return false;

    const now = Date.now();
    
    // Check if any active bulletin blocks this subject
    for (const bulletinId of bulletinIds) {
      const bulletin = this.bulletins.get(bulletinId);
      if (bulletin && bulletin.expiresAt > now) {
        return true;
      }
    }
    
    return false;
  }

  async cleanup(): Promise<number> {
    const now = Date.now();
    let removed = 0;

    // Remove expired bulletins
    for (const [id, bulletin] of this.bulletins) {
      if (bulletin.expiresAt <= now) {
        this.bulletins.delete(id);
        
        // Clean up indices
        const subjectHex = Array.from(bulletin.subject)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        if (bulletin.type === BulletinType.HASH_BLOCK) {
          this.hashIndex.get(subjectHex)?.delete(id);
        } else if (bulletin.type === BulletinType.ORIGIN_REVOKE) {
          this.originIndex.get(subjectHex)?.delete(id);
        }
        
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`Cleaned up ${removed} expired bulletins`);
    }
    
    return removed;
  }

  async search(query: string): Promise<ModerationBulletin[]> {
    const results: ModerationBulletin[] = [];
    const lowerQuery = query.toLowerCase();

    for (const bulletin of this.bulletins.values()) {
      // Search in reasons
      const reasonMatch = bulletin.reasons.some(reason => 
        reason.toLowerCase().includes(lowerQuery)
      );
      
      // Search in subject (as hex)
      const subjectHex = Array.from(bulletin.subject)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const subjectMatch = subjectHex.includes(lowerQuery);
      
      if (reasonMatch || subjectMatch || bulletin.id.includes(query)) {
        results.push(bulletin);
      }
    }

    return results.sort((a, b) => b.issuedAt - a.issuedAt);
  }

  private validateBulletin(bulletin: ModerationBulletin): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!bulletin.id || typeof bulletin.id !== 'string') {
      errors.push('Invalid id: must be non-empty string');
    }

    if (!bulletin.issuedAt || bulletin.issuedAt <= 0) {
      errors.push('Invalid issuedAt: must be positive timestamp');
    }

    if (!bulletin.expiresAt || bulletin.expiresAt <= bulletin.issuedAt) {
      errors.push('Invalid expiresAt: must be after issuedAt');
    }

    if (!Object.values(BulletinType).includes(bulletin.type)) {
      errors.push('Invalid type: must be HASH_BLOCK or ORIGIN_REVOKE');
    }

    if (!bulletin.subject || bulletin.subject.length !== 32) {
      errors.push('Invalid subject: must be 32 bytes');
    }

    if (!Array.isArray(bulletin.reasons) || bulletin.reasons.length === 0) {
      errors.push('Invalid reasons: must be non-empty array');
    }

    if (!Array.isArray(bulletin.signatures)) {
      errors.push('Invalid signatures: must be array');
    }

    if (bulletin.version !== 1) {
      errors.push('Invalid version: must be 1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Utility functions
export class BulletinUtils {
  static generateBulletinId(): string {
    // Generate random bulletin ID
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static createHashBlockBulletin(
    contentHash: Uint8Array,
    reasons: string[],
    ttlHours: number = 72
  ): Omit<ModerationBulletin, 'signatures'> {
    const now = Date.now();
    
    return {
      id: this.generateBulletinId(),
      issuedAt: now,
      expiresAt: now + (ttlHours * 60 * 60 * 1000),
      type: BulletinType.HASH_BLOCK,
      subject: contentHash,
      reasons,
      version: 1
    };
  }

  static createOriginRevokeBulletin(
    originPubKey: Uint8Array,
    reasons: string[],
    ttlDays: number = 30
  ): Omit<ModerationBulletin, 'signatures'> {
    const now = Date.now();
    
    return {
      id: this.generateBulletinId(),
      issuedAt: now,
      expiresAt: now + (ttlDays * 24 * 60 * 60 * 1000),
      type: BulletinType.ORIGIN_REVOKE,
      subject: originPubKey,
      reasons,
      version: 1
    };
  }

  static summarizeBulletin(bulletin: ModerationBulletin): string {
    const subjectHex = Array.from(bulletin.subject.slice(0, 8))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const age = Date.now() - bulletin.issuedAt;
    const ageHours = Math.floor(age / (60 * 60 * 1000));
    
    const expiry = bulletin.expiresAt - Date.now();
    const expiryHours = Math.floor(expiry / (60 * 60 * 1000));
    
    return `${bulletin.type} | Subject: ${subjectHex}... | Age: ${ageHours}h | Expires: ${expiryHours}h | Sigs: ${bulletin.signatures.length} | Reasons: ${bulletin.reasons.join(', ')}`;
  }
}

// Singleton instances
export const bulletinQuorum = new BulletinQuorumImpl();
export const bulletinStore = new BulletinStoreImpl();