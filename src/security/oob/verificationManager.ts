// Out-of-Band verification manager for peer identity confirmation
// Implements QR codes and Short Authentication Strings (SAS)

import { CryptoPrimitives } from '../crypto/primitives';
import { 
  VerificationChallenge,
  SecurityError, 
  SecurityException 
} from '../crypto/types';

export class VerificationManager {
  private crypto = CryptoPrimitives.getInstance();
  private pendingVerifications = new Map<string, VerificationChallenge>();
  private verifiedPeers = new Set<string>();
  private verificationCallbacks = new Map<string, (verified: boolean) => void>();

  // NATO phonetic alphabet for SAS generation
  private readonly phonetics = [
    'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel',
    'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa',
    'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'X-ray',
    'Yankee', 'Zulu'
  ];

  /**
   * Initiate verification process with a peer
   * Non-skippable - required before any communication
   */
  async initiateVerification(
    peerId: string,
    localPublicKey: Uint8Array,
    remotePublicKey: Uint8Array
  ): Promise<VerificationChallenge> {
    try {
      // Generate verification challenge
      const challengeId = this.generateChallengeId();
      const timestamp = Date.now();
      
      // Create combined key material for verification
      const combinedKeys = new Uint8Array(localPublicKey.length + remotePublicKey.length);
      combinedKeys.set(localPublicKey, 0);
      combinedKeys.set(remotePublicKey, localPublicKey.length);
      
      // Generate deterministic hash for verification
      const verificationHash = await this.crypto.blake2s(combinedKeys);
      
      // Create QR data (contains public keys and challenge)
      const qrPayload = {
        version: 1,
        challenge_id: challengeId,
        local_key: Array.from(localPublicKey),
        remote_key: Array.from(remotePublicKey),
        timestamp
      };
      
      const qrData = btoa(JSON.stringify(qrPayload));
      
      // Generate Short Authentication String (SAS)
      const sasWords = this.generateSAS(verificationHash);
      
      const challenge: VerificationChallenge = {
        qr_data: qrData,
        sas_words: sasWords,
        challenge_id: challengeId,
        expires_at: timestamp + 5 * 60 * 1000 // 5 minutes
      };
      
      this.pendingVerifications.set(peerId, challenge);
      
      return challenge;
    } catch (error) {
      throw new SecurityException(
        SecurityError.VERIFICATION_REQUIRED,
        'Failed to initiate peer verification',
        error
      );
    }
  }

  /**
   * Verify QR code scanned by user
   */
  async verifyQRCode(peerId: string, scannedQRData: string): Promise<boolean> {
    try {
      const challenge = this.pendingVerifications.get(peerId);
      if (!challenge) {
        throw new SecurityException(
          SecurityError.VERIFICATION_REQUIRED,
          'No pending verification for peer'
        );
      }

      // Check expiration
      if (Date.now() > challenge.expires_at) {
        this.pendingVerifications.delete(peerId);
        throw new SecurityException(
          SecurityError.VERIFICATION_REQUIRED,
          'Verification challenge expired'
        );
      }

      // Decode and validate QR data
      const qrPayload = JSON.parse(atob(scannedQRData));
      
      // Verify challenge ID matches
      if (qrPayload.challenge_id !== challenge.challenge_id) {
        return false;
      }

      // Verify timestamp freshness (within 5 minutes)
      const age = Date.now() - qrPayload.timestamp;
      if (age > 5 * 60 * 1000) {
        return false;
      }

      // QR verification successful - still need SAS confirmation
      return true;
    } catch (error) {
      console.error('QR verification failed:', error);
      return false;
    }
  }

  /**
   * Confirm Short Authentication String match
   * Two-sided confirmation required
   */
  async confirmSAS(
    peerId: string, 
    userConfirmedMatch: boolean,
    remoteConfirmedMatch: boolean
  ): Promise<boolean> {
    try {
      const challenge = this.pendingVerifications.get(peerId);
      if (!challenge) {
        throw new SecurityException(
          SecurityError.VERIFICATION_REQUIRED,
          'No pending verification for peer'
        );
      }

      // Both sides must confirm SAS match
      if (userConfirmedMatch && remoteConfirmedMatch) {
        this.verifiedPeers.add(peerId);
        this.pendingVerifications.delete(peerId);
        
        // Notify completion
        const callback = this.verificationCallbacks.get(peerId);
        if (callback) {
          callback(true);
          this.verificationCallbacks.delete(peerId);
        }
        
        return true;
      } else {
        // Verification failed - clear state
        this.pendingVerifications.delete(peerId);
        
        const callback = this.verificationCallbacks.get(peerId);
        if (callback) {
          callback(false);
          this.verificationCallbacks.delete(peerId);
        }
        
        return false;
      }
    } catch (error) {
      throw new SecurityException(
        SecurityError.VERIFICATION_REQUIRED,
        'SAS confirmation failed',
        error
      );
    }
  }

  /**
   * Check if peer is verified (required before send/receive)
   */
  isPeerVerified(peerId: string): boolean {
    return this.verifiedPeers.has(peerId);
  }

  /**
   * Get pending verification challenge for UI display
   */
  getPendingChallenge(peerId: string): VerificationChallenge | null {
    return this.pendingVerifications.get(peerId) || null;
  }

  /**
   * Register callback for verification completion
   */
  onVerificationComplete(peerId: string, callback: (verified: boolean) => void): void {
    this.verificationCallbacks.set(peerId, callback);
  }

  /**
   * Re-verify peer on key change or reinstall
   */
  async requireReVerification(peerId: string): Promise<void> {
    this.verifiedPeers.delete(peerId);
    this.pendingVerifications.delete(peerId);
    
    throw new SecurityException(
      SecurityError.VERIFICATION_REQUIRED,
      'Peer re-verification required due to key change'
    );
  }

  /**
   * Generate Short Authentication String from verification hash
   */
  private generateSAS(verificationHash: Uint8Array): string[] {
    // Use first 6 bytes for 3 phonetic words (2 bytes per word)
    const sasWords: string[] = [];
    
    for (let i = 0; i < 6; i += 2) {
      const wordIndex = (verificationHash[i] << 8) | verificationHash[i + 1];
      const phoneticIndex = wordIndex % this.phonetics.length;
      sasWords.push(this.phonetics[phoneticIndex]);
    }
    
    return sasWords;
  }

  /**
   * Generate unique challenge ID
   */
  private generateChallengeId(): string {
    const bytes = this.crypto.randomBytes(16);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Clean up expired verifications
   */
  cleanupExpired(): void {
    const now = Date.now();
    for (const [peerId, challenge] of this.pendingVerifications) {
      if (now > challenge.expires_at) {
        this.pendingVerifications.delete(peerId);
        
        // Notify callback of expiration
        const callback = this.verificationCallbacks.get(peerId);
        if (callback) {
          callback(false);
          this.verificationCallbacks.delete(peerId);
        }
      }
    }
  }

  /**
   * Get verification statistics
   */
  getStats(): {
    verifiedPeers: number;
    pendingVerifications: number;
    totalVerificationAttempts: number;
  } {
    return {
      verifiedPeers: this.verifiedPeers.size,
      pendingVerifications: this.pendingVerifications.size,
      totalVerificationAttempts: 0 // TODO: Track this metric
    };
  }

  /**
   * Clear all verification state (for testing)
   */
  clearAll(): void {
    this.verifiedPeers.clear();
    this.pendingVerifications.clear();
    this.verificationCallbacks.clear();
  }
}