// Safety Manifest - Signed content attestation for offline verification
// Ed25519 signatures on structured metadata with canonical JSON

import { CryptoPrimitives } from '../crypto/primitives';
import { MediaHashes } from '../hashes/HashManager';

export interface SafetyManifest {
  originPubKey: Uint8Array;     // Publisher's public key (32 bytes)
  sha256: Uint8Array;           // File content hash (32 bytes)
  pHash?: Uint8Array;           // Perceptual hash (8 bytes, optional)
  nsfwScore: number;            // NSFW classifier score [0,1]
  timestamp: number;            // Unix timestamp (milliseconds)
  policyFlags: string[];        // ["media_only", "youth_mode?"]
  version: number;              // Manifest version (currently 1)
  signature: Uint8Array;        // Ed25519 signature (64 bytes)
}

export interface ManifestCreationOptions {
  includePerceptualHash: boolean;
  policyFlags: string[];
  maxAgeHours: number;
}

export interface ManifestSigner {
  sign(manifestData: Omit<SafetyManifest, 'signature'>, privateKeyHandle: string): Promise<SafetyManifest>;
  verify(manifest: SafetyManifest): Promise<boolean>;
  createManifest(
    file: File,
    hashes: MediaHashes,
    nsfwScore: number,
    originPubKey: Uint8Array,
    options?: Partial<ManifestCreationOptions>
  ): Promise<Omit<SafetyManifest, 'signature'>>;
  isExpired(manifest: SafetyManifest, maxAgeHours?: number): boolean;
  validateManifest(manifest: SafetyManifest): { valid: boolean; errors: string[] };
}

export class ManifestSignerImpl implements ManifestSigner {
  private crypto = CryptoPrimitives.getInstance();

  async sign(
    manifestData: Omit<SafetyManifest, 'signature'>,
    privateKeyHandle: string
  ): Promise<SafetyManifest> {
    try {
      // Create canonical JSON representation
      const canonicalJson = this.createCanonicalJson(manifestData);
      
      // Sign the canonical JSON
      const signature = await this.crypto.ed25519Sign(privateKeyHandle, canonicalJson);
      
      return {
        ...manifestData,
        signature
      };
    } catch (error) {
      throw new Error(`Manifest signing failed: ${error}`);
    }
  }

  async verify(manifest: SafetyManifest): Promise<boolean> {
    try {
      // Validate manifest structure first
      const validation = this.validateManifest(manifest);
      if (!validation.valid) {
        console.warn('Manifest validation failed:', validation.errors);
        return false;
      }

      // Create canonical JSON without signature
      const manifestWithoutSig: Omit<SafetyManifest, 'signature'> = {
        originPubKey: manifest.originPubKey,
        sha256: manifest.sha256,
        pHash: manifest.pHash,
        nsfwScore: manifest.nsfwScore,
        timestamp: manifest.timestamp,
        policyFlags: manifest.policyFlags,
        version: manifest.version
      };
      
      const canonicalJson = this.createCanonicalJson(manifestWithoutSig);
      
      // Verify Ed25519 signature
      return await this.crypto.ed25519Verify(
        manifest.originPubKey,
        manifest.signature,
        canonicalJson
      );
    } catch (error) {
      console.error('Manifest verification failed:', error);
      return false;
    }
  }

  async createManifest(
    file: File,
    hashes: MediaHashes,
    nsfwScore: number,
    originPubKey: Uint8Array,
    options: Partial<ManifestCreationOptions> = {}
  ): Promise<Omit<SafetyManifest, 'signature'>> {
    const defaults: ManifestCreationOptions = {
      includePerceptualHash: true,
      policyFlags: ['media_only'],
      maxAgeHours: 24
    };
    
    const opts = { ...defaults, ...options };
    
    return {
      originPubKey,
      sha256: hashes.sha256,
      pHash: opts.includePerceptualHash ? hashes.pHash : undefined,
      nsfwScore,
      timestamp: Date.now(),
      policyFlags: opts.policyFlags,
      version: 1
    };
  }

  isExpired(manifest: SafetyManifest, maxAgeHours: number = 24): boolean {
    const ageMs = Date.now() - manifest.timestamp;
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    return ageMs > maxAgeMs;
  }

  validateManifest(manifest: SafetyManifest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!manifest.originPubKey || manifest.originPubKey.length !== 32) {
      errors.push('Invalid originPubKey: must be 32 bytes');
    }

    if (!manifest.sha256 || manifest.sha256.length !== 32) {
      errors.push('Invalid sha256: must be 32 bytes');
    }

    if (manifest.pHash && manifest.pHash.length !== 8) {
      errors.push('Invalid pHash: must be 8 bytes when present');
    }

    if (typeof manifest.nsfwScore !== 'number' || 
        manifest.nsfwScore < 0 || 
        manifest.nsfwScore > 1) {
      errors.push('Invalid nsfwScore: must be number in [0,1]');
    }

    if (!manifest.timestamp || manifest.timestamp <= 0) {
      errors.push('Invalid timestamp: must be positive number');
    }

    if (!Array.isArray(manifest.policyFlags)) {
      errors.push('Invalid policyFlags: must be array');
    }

    if (manifest.version !== 1) {
      errors.push('Invalid version: must be 1');
    }

    if (!manifest.signature || manifest.signature.length !== 64) {
      errors.push('Invalid signature: must be 64 bytes');
    }

    // Check timestamp is reasonable (not too far in future)
    const maxFutureMs = 5 * 60 * 1000; // 5 minutes
    if (manifest.timestamp > Date.now() + maxFutureMs) {
      errors.push('Invalid timestamp: too far in future');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private createCanonicalJson(manifest: Omit<SafetyManifest, 'signature'>): Uint8Array {
    // Create deterministic JSON representation
    const canonicalData = {
      originPubKey: Array.from(manifest.originPubKey),
      sha256: Array.from(manifest.sha256),
      pHash: manifest.pHash ? Array.from(manifest.pHash) : null,
      nsfwScore: manifest.nsfwScore,
      timestamp: manifest.timestamp,
      policyFlags: [...manifest.policyFlags].sort(), // Sort for determinism
      version: manifest.version
    };

    // Convert to canonical JSON (keys sorted, no whitespace)
    const jsonString = JSON.stringify(canonicalData, Object.keys(canonicalData).sort());
    
    return new TextEncoder().encode(jsonString);
  }
}

// Utility functions for manifest handling
export class ManifestUtils {
  static encodeManifest(manifest: SafetyManifest): string {
    // Encode manifest as base64 for transmission
    const encoded = {
      originPubKey: Array.from(manifest.originPubKey),
      sha256: Array.from(manifest.sha256),
      pHash: manifest.pHash ? Array.from(manifest.pHash) : null,
      nsfwScore: manifest.nsfwScore,
      timestamp: manifest.timestamp,
      policyFlags: manifest.policyFlags,
      version: manifest.version,
      signature: Array.from(manifest.signature)
    };
    
    const jsonString = JSON.stringify(encoded);
    return btoa(jsonString);
  }

  static decodeManifest(encoded: string): SafetyManifest {
    try {
      const jsonString = atob(encoded);
      const decoded = JSON.parse(jsonString);
      
      return {
        originPubKey: new Uint8Array(decoded.originPubKey),
        sha256: new Uint8Array(decoded.sha256),
        pHash: decoded.pHash ? new Uint8Array(decoded.pHash) : undefined,
        nsfwScore: decoded.nsfwScore,
        timestamp: decoded.timestamp,
        policyFlags: decoded.policyFlags,
        version: decoded.version,
        signature: new Uint8Array(decoded.signature)
      };
    } catch (error) {
      throw new Error(`Manifest decoding failed: ${error}`);
    }
  }

  static summarizeManifest(manifest: SafetyManifest): string {
    const pubKeyHex = Array.from(manifest.originPubKey.slice(0, 8))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const hashHex = Array.from(manifest.sha256.slice(0, 8))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const age = Date.now() - manifest.timestamp;
    const ageHours = Math.floor(age / (60 * 60 * 1000));
    
    return `Manifest v${manifest.version} | Origin: ${pubKeyHex}... | Hash: ${hashHex}... | NSFW: ${manifest.nsfwScore.toFixed(3)} | Age: ${ageHours}h | Flags: ${manifest.policyFlags.join(',')}`;
  }

  static extractMetadata(manifest: SafetyManifest): {
    isMediaOnly: boolean;
    isYouthMode: boolean;
    isExpired: boolean;
    isSafe: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const isMediaOnly = manifest.policyFlags.includes('media_only');
    const isYouthMode = manifest.policyFlags.includes('youth_mode');
    const isExpired = Date.now() - manifest.timestamp > 24 * 60 * 60 * 1000; // 24h
    
    let isSafe = true;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (manifest.nsfwScore >= 0.85) {
      isSafe = false;
      riskLevel = 'high';
    } else if (manifest.nsfwScore >= 0.70) {
      riskLevel = 'medium';
      if (isYouthMode) {
        isSafe = false;
      }
    }
    
    return {
      isMediaOnly,
      isYouthMode,
      isExpired,
      isSafe,
      riskLevel
    };
  }
}

// Singleton instance
export const manifestSigner = new ManifestSignerImpl();