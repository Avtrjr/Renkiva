/**
 * Rendezvous Client - Minimal signaling for global mesh connections
 * Handles offer/answer exchange with ephemeral tokens
 */

import { CryptoPrimitives } from '@/security/crypto/primitives';

export interface RendezvousConfig {
  endpoint: string;
  pinnedKey: string;
  maxTokenTtlMinutes: number;
}

export interface SessionOffer {
  offerId: string;
  publicKey: Uint8Array;
  timestamp: number;
  signature: Uint8Array;
}

export interface SessionAnswer {
  answerId: string;
  publicKey: Uint8Array;
  timestamp: number;
  signature: Uint8Array;
}

export class RendezvousClient {
  private config: RendezvousConfig;
  private crypto: CryptoPrimitives;
  private websocket?: WebSocket;
  private connected = false;

  constructor(config: RendezvousConfig) {
    this.config = config;
    this.crypto = CryptoPrimitives.getInstance();
  }

  async connect(): Promise<{ success: boolean; error?: string }> {
    try {
      return new Promise((resolve) => {
        this.websocket = new WebSocket(this.config.endpoint);
        
        this.websocket.onopen = () => {
          this.connected = true;
          console.log('🤝 Connected to rendezvous server');
          resolve({ success: true });
        };

        this.websocket.onerror = (error) => {
          console.error('Rendezvous connection failed:', error);
          resolve({ success: false, error: 'Connection failed' });
        };

        this.websocket.onclose = () => {
          this.connected = false;
          console.log('🤝 Disconnected from rendezvous server');
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!this.connected) {
            this.websocket?.close();
            resolve({ success: false, error: 'Connection timeout' });
          }
        }, 5000);
      });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async publishOffer(offer: Uint8Array, token: string): Promise<{ success: boolean; error?: string }> {
    if (!this.connected || !this.websocket) {
      return { success: false, error: 'Not connected to rendezvous server' };
    }

    try {
      // Validate token TTL
      if (!this.isValidToken(token)) {
        return { success: false, error: 'Invalid or expired token' };
      }

      const message = {
        type: 'offer',
        token,
        offer: Array.from(offer),
        timestamp: Date.now()
      };

      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          resolve({ success: false, error: 'Publish timeout' });
        }, 10000);

        const handleMessage = (event: MessageEvent) => {
          try {
            const response = JSON.parse(event.data);
            if (response.type === 'offer_ack' && response.token === token) {
              clearTimeout(timeoutId);
              this.websocket!.removeEventListener('message', handleMessage);
              
              if (response.success) {
                resolve({ success: true });
              } else {
                resolve({ success: false, error: response.error || 'Server rejected offer' });
              }
            }
          } catch (error) {
            // Ignore parse errors for other messages
          }
        };

        this.websocket!.addEventListener('message', handleMessage);
        this.websocket!.send(JSON.stringify(message));
      });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to publish offer' };
    }
  }

  async fetchAnswer(token: string): Promise<{ success: boolean; answer?: Uint8Array; error?: string }> {
    if (!this.connected || !this.websocket) {
      return { success: false, error: 'Not connected to rendezvous server' };
    }

    try {
      // Validate token TTL
      if (!this.isValidToken(token)) {
        return { success: false, error: 'Invalid or expired token' };
      }

      const message = {
        type: 'fetch_answer',
        token,
        timestamp: Date.now()
      };

      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          resolve({ success: false, error: 'Fetch timeout' });
        }, 30000); // Longer timeout for answer fetching

        const handleMessage = (event: MessageEvent) => {
          try {
            const response = JSON.parse(event.data);
            if (response.type === 'answer' && response.token === token) {
              clearTimeout(timeoutId);
              this.websocket!.removeEventListener('message', handleMessage);
              
              if (response.success && response.answer) {
                const answer = new Uint8Array(response.answer);
                resolve({ success: true, answer });
              } else {
                resolve({ success: false, error: response.error || 'No answer available' });
              }
            }
          } catch (error) {
            // Ignore parse errors for other messages
          }
        };

        this.websocket!.addEventListener('message', handleMessage);
        this.websocket!.send(JSON.stringify(message));
      });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch answer' };
    }
  }

  async generateEphemeralToken(): Promise<string> {
    const randomBytes = this.crypto.randomBytes(32);
    const timestamp = Date.now();
    const tokenData = new TextEncoder().encode(`${timestamp}_${Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('')}`);
    
    return Array.from(tokenData, b => b.toString(16).padStart(2, '0')).join('');
  }

  private isValidToken(token: string): boolean {
    try {
      // Extract timestamp from token
      const parts = token.split('_');
      if (parts.length !== 2) return false;
      
      const timestamp = parseInt(parts[0], 16);
      const now = Date.now();
      const maxAge = this.config.maxTokenTtlMinutes * 60 * 1000;
      
      return (now - timestamp) <= maxAge;
    } catch {
      return false;
    }
  }

  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = undefined;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Verify server's pinned key (placeholder implementation)
  private async verifyPinnedKey(serverKey: string): Promise<boolean> {
    // In production, this would verify the server's public key
    // against the pinned key in configuration
    return serverKey === this.config.pinnedKey;
  }
}