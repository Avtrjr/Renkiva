// Encryption service for private mesh channels
interface EncryptionKey {
  id: string;
  key: CryptoKey;
  algorithm: string;
  created: Date;
  expires?: Date;
}

interface EncryptedInvite {
  channelId: string;
  inviteCode: string;
  encryptedData: string;
  publicKey: string;
  expiresAt: Date;
  maxUses: number;
  currentUses: number;
  trustLevel: 'verified' | 'private' | 'anonymous';
}

interface PrivateChannel {
  id: string;
  name: string;
  description: string;
  encryptionKey: string;
  trustLevel: 'verified' | 'private' | 'anonymous';
  memberCount: number;
  isInviteOnly: boolean;
  created: Date;
  lastActivity: Date;
}

class EncryptionService {
  private keys: Map<string, EncryptionKey> = new Map();
  private channels: Map<string, PrivateChannel> = new Map();
  private invites: Map<string, EncryptedInvite> = new Map();

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    // Initialize with some demo channels
    const demoChannels: PrivateChannel[] = [
      {
        id: 'ch_verified_1',
        name: 'Verified Creators Hub',
        description: 'Exclusive channel for verified content creators',
        encryptionKey: 'key_verified_1',
        trustLevel: 'verified',
        memberCount: 127,
        isInviteOnly: true,
        created: new Date(Date.now() - 86400000 * 30), // 30 days ago
        lastActivity: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        id: 'ch_private_1',
        name: 'Tech Reviewers Circle',
        description: 'Private discussions for technology reviewers',
        encryptionKey: 'key_private_1',
        trustLevel: 'private',
        memberCount: 45,
        isInviteOnly: true,
        created: new Date(Date.now() - 86400000 * 15), // 15 days ago
        lastActivity: new Date(Date.now() - 1800000) // 30 minutes ago
      },
      {
        id: 'ch_anonymous_1',
        name: 'Anonymous Mesh Network',
        description: 'Fully anonymous content sharing',
        encryptionKey: 'key_anonymous_1',
        trustLevel: 'anonymous',
        memberCount: 89,
        isInviteOnly: false,
        created: new Date(Date.now() - 86400000 * 7), // 7 days ago
        lastActivity: new Date(Date.now() - 300000) // 5 minutes ago
      }
    ];

    demoChannels.forEach(channel => {
      this.channels.set(channel.id, channel);
    });

    // Generate some demo invites
    await this.generateDemoInvites();
  }

  private async generateDemoInvites() {
    const demoInvites: Omit<EncryptedInvite, 'encryptedData' | 'publicKey'>[] = [
      {
        channelId: 'ch_verified_1',
        inviteCode: 'VER-' + this.generateInviteCode(),
        expiresAt: new Date(Date.now() + 86400000 * 7), // 7 days
        maxUses: 10,
        currentUses: 3,
        trustLevel: 'verified'
      },
      {
        channelId: 'ch_private_1',
        inviteCode: 'PVT-' + this.generateInviteCode(),
        expiresAt: new Date(Date.now() + 86400000 * 3), // 3 days
        maxUses: 5,
        currentUses: 1,
        trustLevel: 'private'
      },
      {
        channelId: 'ch_anonymous_1',
        inviteCode: 'ANO-' + this.generateInviteCode(),
        expiresAt: new Date(Date.now() + 86400000 * 1), // 1 day
        maxUses: 50,
        currentUses: 23,
        trustLevel: 'anonymous'
      }
    ];

    for (const invite of demoInvites) {
      const { encryptedData, publicKey } = await this.encryptInviteData({
        channelId: invite.channelId,
        timestamp: Date.now(),
        trustLevel: invite.trustLevel
      });

      this.invites.set(invite.inviteCode, {
        ...invite,
        encryptedData,
        publicKey
      });
    }
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async generateKeyPair(): Promise<CryptoKeyPair> {
    return await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async encryptInviteData(data: any): Promise<{ encryptedData: string; publicKey: string }> {
    const keyPair = await this.generateKeyPair();
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      keyPair.publicKey,
      encodedData
    );

    const exportedPublicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    
    return {
      encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
      publicKey: btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)))
    };
  }

  async createPrivateChannel(
    name: string, 
    description: string, 
    trustLevel: 'verified' | 'private' | 'anonymous'
  ): Promise<PrivateChannel> {
    const channelId = `ch_${trustLevel}_${Date.now()}`;
    const encryptionKey = await this.generateChannelKey();
    
    const channel: PrivateChannel = {
      id: channelId,
      name,
      description,
      encryptionKey,
      trustLevel,
      memberCount: 1,
      isInviteOnly: true,
      created: new Date(),
      lastActivity: new Date()
    };

    this.channels.set(channelId, channel);
    return channel;
  }

  async generateChannelKey(): Promise<string> {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const exported = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  async createInvite(
    channelId: string,
    maxUses: number = 10,
    expirationHours: number = 24
  ): Promise<string> {
    const channel = this.channels.get(channelId);
    if (!channel) throw new Error('Channel not found');

    const inviteCode = `${channel.trustLevel.substring(0, 3).toUpperCase()}-${this.generateInviteCode()}`;
    const expiresAt = new Date(Date.now() + expirationHours * 3600000);

    const { encryptedData, publicKey } = await this.encryptInviteData({
      channelId,
      timestamp: Date.now(),
      trustLevel: channel.trustLevel
    });

    const invite: EncryptedInvite = {
      channelId,
      inviteCode,
      encryptedData,
      publicKey,
      expiresAt,
      maxUses,
      currentUses: 0,
      trustLevel: channel.trustLevel
    };

    this.invites.set(inviteCode, invite);
    return inviteCode;
  }

  async validateInvite(inviteCode: string): Promise<{ valid: boolean; channelId?: string; error?: string }> {
    const invite = this.invites.get(inviteCode);
    
    if (!invite) {
      return { valid: false, error: 'Invalid invite code' };
    }

    if (invite.expiresAt < new Date()) {
      return { valid: false, error: 'Invite has expired' };
    }

    if (invite.currentUses >= invite.maxUses) {
      return { valid: false, error: 'Invite has reached maximum uses' };
    }

    return { valid: true, channelId: invite.channelId };
  }

  async useInvite(inviteCode: string): Promise<{ success: boolean; channel?: PrivateChannel; error?: string }> {
    const validation = await this.validateInvite(inviteCode);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const invite = this.invites.get(inviteCode)!;
    const channel = this.channels.get(invite.channelId);
    
    if (!channel) {
      return { success: false, error: 'Channel not found' };
    }

    // Increment usage
    invite.currentUses++;
    channel.memberCount++;
    channel.lastActivity = new Date();

    return { success: true, channel };
  }

  getChannels(): PrivateChannel[] {
    return Array.from(this.channels.values());
  }

  getInvites(): EncryptedInvite[] {
    return Array.from(this.invites.values());
  }

  getChannelById(channelId: string): PrivateChannel | undefined {
    return this.channels.get(channelId);
  }

  async encryptMessage(message: string, channelKey: string): Promise<string> {
    // Simulate message encryption
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // In a real implementation, you'd use the actual channel key
    const encrypted = btoa(String.fromCharCode(...data));
    return `enc:${encrypted}`;
  }

  async decryptMessage(encryptedMessage: string, channelKey: string): Promise<string> {
    // Simulate message decryption
    if (!encryptedMessage.startsWith('enc:')) {
      return encryptedMessage; // Not encrypted
    }

    const encrypted = encryptedMessage.substring(4);
    try {
      const decoded = atob(encrypted);
      return decoded;
    } catch {
      return '[Decryption failed]';
    }
  }

  // QR Code generation for invites
  generateInviteQR(inviteCode: string): string {
    const inviteUrl = `meshtv://join/${inviteCode}`;
    // In a real implementation, you'd generate an actual QR code
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="none" stroke="black" stroke-width="2"/>
        <text x="100" y="100" text-anchor="middle" font-size="12" fill="black">QR: ${inviteCode}</text>
        <text x="100" y="120" text-anchor="middle" font-size="8" fill="gray">MeshTV Invite</text>
      </svg>
    `)}`;
  }

  // Analytics for private channels
  getChannelAnalytics(channelId: string) {
    const channel = this.channels.get(channelId);
    if (!channel) return null;

    return {
      memberCount: channel.memberCount,
      messageCount: Math.floor(Math.random() * 1000) + 500,
      activeUsers: Math.floor(channel.memberCount * 0.7),
      dataTransferred: `${(Math.random() * 100 + 50).toFixed(1)} GB`,
      encryptionLevel: channel.trustLevel === 'verified' ? 'Military Grade' : 
                     channel.trustLevel === 'private' ? 'Enterprise' : 'Standard',
      lastActivity: channel.lastActivity
    };
  }
}

export const encryptionService = new EncryptionService();
export type { PrivateChannel, EncryptedInvite, EncryptionKey };