// RBAC - Role-based access control with attestation gates
// Viewer, Member, Publisher, Moderator roles with progressive permissions

export enum UserRole {
  VIEWER = 'VIEWER',           // Read-only access
  MEMBER = 'MEMBER',           // Can interact, no publishing
  PUBLISHER = 'PUBLISHER',     // Can publish content
  MODERATOR = 'MODERATOR'      // Can moderate content
}

export interface UserPermissions {
  canView: boolean;
  canInteract: boolean;        // Like, share, comment
  canPublish: boolean;
  canModerate: boolean;
  maxPostsPerMinute: number;
  requiresAttestation: boolean;
}

export interface UserAccount {
  userId: string;
  role: UserRole;
  createdAt: number;
  lastActive: number;
  attestationLevel: string;
  cooloffExpiresAt?: number;
  rateLimit: {
    postsInLastMinute: number;
    lastPostTime: number;
  };
}

export class RoleManager {
  private accounts = new Map<string, UserAccount>();

  getPermissions(role: UserRole, attestationLevel: string): UserPermissions {
    const basePermissions: Record<UserRole, UserPermissions> = {
      [UserRole.VIEWER]: {
        canView: true,
        canInteract: false,
        canPublish: false,
        canModerate: false,
        maxPostsPerMinute: 0,
        requiresAttestation: false
      },
      [UserRole.MEMBER]: {
        canView: true,
        canInteract: true,
        canPublish: false,
        canModerate: false,
        maxPostsPerMinute: 0,
        requiresAttestation: false
      },
      [UserRole.PUBLISHER]: {
        canView: true,
        canInteract: true,
        canPublish: true,
        canModerate: false,
        maxPostsPerMinute: 2,
        requiresAttestation: true
      },
      [UserRole.MODERATOR]: {
        canView: true,
        canInteract: true,
        canPublish: true,
        canModerate: true,
        maxPostsPerMinute: 10,
        requiresAttestation: true
      }
    };

    return basePermissions[role];
  }

  canPublish(userId: string): { allowed: boolean; reason?: string } {
    const account = this.accounts.get(userId);
    if (!account) {
      return { allowed: false, reason: 'Account not found' };
    }

    // Check cooloff period
    if (account.cooloffExpiresAt && Date.now() < account.cooloffExpiresAt) {
      return { allowed: false, reason: 'Account in cooloff period' };
    }

    const permissions = this.getPermissions(account.role, account.attestationLevel);
    if (!permissions.canPublish) {
      return { allowed: false, reason: 'Insufficient role permissions' };
    }

    // Check rate limits
    const now = Date.now();
    if (now - account.rateLimit.lastPostTime < 60000) { // Within last minute
      if (account.rateLimit.postsInLastMinute >= permissions.maxPostsPerMinute) {
        return { allowed: false, reason: 'Rate limit exceeded' };
      }
    }

    return { allowed: true };
  }

  recordPost(userId: string): void {
    const account = this.accounts.get(userId);
    if (!account) return;

    const now = Date.now();
    if (now - account.rateLimit.lastPostTime >= 60000) {
      // Reset counter for new minute
      account.rateLimit.postsInLastMinute = 1;
    } else {
      account.rateLimit.postsInLastMinute++;
    }
    account.rateLimit.lastPostTime = now;
    account.lastActive = now;
  }
}