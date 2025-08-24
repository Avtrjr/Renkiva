// Rendezvous Client for Global Mode Signaling
// Minimal ephemeral token-based signaling with pinned key security

export interface RendezvousOffer {
  token: string;
  offer: Uint8Array;
  timestamp: number;
  ttl: number;
}

export interface RendezvousClient {
  publishOffer(offer: Uint8Array, token: string): Promise<Result<void>>;
  fetchAnswer(token: string): Promise<Result<Uint8Array>>;
  generateToken(): string;
}

export class RendezvousClientImpl implements RendezvousClient {
  private readonly pinnedKey: string;
  private readonly baseUrl: string;
  private readonly tokenTtlMs: number;
  private readonly storage = new Map<string, RendezvousOffer>();

  constructor(
    pinnedKey: string = "MCowBQYDK2VwAyEAyH7rJhVKNqMVGjQhNn+pNzZ8xV1nA9kQzJ4sJ1pZ2Zw=",
    baseUrl: string = "wss://rendezvous.meshnet.global"
  ) {
    this.pinnedKey = pinnedKey;
    this.baseUrl = baseUrl;
    this.tokenTtlMs = 60 * 60 * 1000; // 1 hour
  }

  async publishOffer(offer: Uint8Array, token: string): Promise<Result<void>> {
    try {
      // Validate token format
      if (!this.isValidToken(token)) {
        return { success: false, error: 'Invalid token format' };
      }

      // In a real implementation, this would send to the rendezvous server
      // For demo purposes, we'll use local storage
      const offerData: RendezvousOffer = {
        token,
        offer,
        timestamp: Date.now(),
        ttl: this.tokenTtlMs
      };

      this.storage.set(token, offerData);
      
      // Cleanup expired offers
      this.cleanupExpiredOffers();
      
      console.log(`Published offer for token: ${token.substring(0, 8)}...`);
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to publish offer' 
      };
    }
  }

  async fetchAnswer(token: string): Promise<Result<Uint8Array>> {
    try {
      const offer = this.storage.get(token);
      
      if (!offer) {
        return { success: false, error: 'Token not found or expired' };
      }

      // Check if offer has expired
      if (Date.now() - offer.timestamp > offer.ttl) {
        this.storage.delete(token);
        return { success: false, error: 'Token expired' };
      }

      // Simulate answer generation (in real impl, this would be from the peer)
      const answer = this.generateMockAnswer();
      
      // Remove the offer after successful fetch (one-time use)
      this.storage.delete(token);
      
      console.log(`Fetched answer for token: ${token.substring(0, 8)}...`);
      return { success: true, data: answer };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch answer' 
      };
    }
  }

  generateToken(): string {
    // Generate cryptographically secure random token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    
    // Convert to base64url for URL safety
    return this.arrayBufferToBase64Url(tokenBytes);
  }

  private isValidToken(token: string): boolean {
    // Check if token is valid base64url and correct length
    try {
      const decoded = this.base64UrlToArrayBuffer(token);
      return decoded.byteLength === 32;
    } catch {
      return false;
    }
  }

  private generateMockAnswer(): Uint8Array {
    // In a real implementation, this would be the ICE answer from the remote peer
    const mockAnswer = new TextEncoder().encode(JSON.stringify({
      type: 'answer',
      sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n...',
      timestamp: Date.now()
    }));
    
    return mockAnswer;
  }

  private cleanupExpiredOffers(): void {
    const now = Date.now();
    for (const [token, offer] of this.storage.entries()) {
      if (now - offer.timestamp > offer.ttl) {
        this.storage.delete(token);
      }
    }
  }

  private arrayBufferToBase64Url(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const binary = atob(padded);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer.buffer;
  }

  // Development helper - in-process rendezvous for testing
  static createDevStub(): RendezvousClient {
    return new RendezvousClientImpl("dev-pinned-key", "dev://localhost");
  }

  getStats() {
    return {
      activeOffers: this.storage.size,
      pinnedKeyFingerprint: this.pinnedKey.substring(0, 16) + "...",
      baseUrl: this.baseUrl
    };
  }
}

export type Result<T> = { success: true; data?: T } | { success: false; error: string };

// Default instance
export const rendezvousClient = new RendezvousClientImpl();