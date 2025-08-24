// Content Policy Manager - Load and enforce content_policy.yml
// Handles MIME filtering, NSFW thresholds, and safety rules

import { z } from 'zod';

// Content Policy Schema
const ContentPolicySchema = z.object({
  content: z.object({
    allow_types: z.array(z.string()),
    block_types: z.array(z.string()),
    nsfw: z.object({
      enabled: z.boolean(),
      threshold_block: z.number().min(0).max(1),
      threshold_warn: z.number().min(0).max(1),
      youth_mode: z.boolean(),
      youth_threshold_block: z.number().min(0).max(1)
    }),
    safety_manifest: z.object({
      require_signed: z.boolean(),
      include_sha256: z.boolean(),
      include_phash: z.boolean(),
      max_age_hours: z.number()
    }),
    moderation: z.object({
      bulletin_quorum: z.string(),
      bulletin_ttl_hours: z.number(),
      hash_block_expiry_days: z.number(),
      origin_revoke_expiry_days: z.number()
    }),
    publisher_controls: z.object({
      new_account_cooloff_hours: z.number(),
      max_posts_per_minute: z.number(),
      require_attestation: z.boolean()
    }),
    attestation: z.object({
      required_for_publish: z.boolean(),
      min_security_level: z.string()
    }),
    rendering: z.object({
      max_resolution_width: z.number(),
      max_resolution_height: z.number(),
      max_bitrate_kbps: z.number(),
      strip_metadata: z.boolean(),
      sandbox_decode: z.boolean()
    }),
    privacy: z.object({
      log_content_hashes: z.boolean(),
      log_user_actions: z.boolean(),
      retention_days: z.number(),
      rate_limit_logs_per_minute: z.number()
    })
  })
});

export type ContentPolicy = z.infer<typeof ContentPolicySchema>;

export enum MimeType {
  MP4 = 'video/mp4',
  WEBM = 'video/webm',
  MOV = 'video/quicktime',
  MP3 = 'audio/mpeg',
  AAC = 'audio/aac',
  OPUS = 'audio/opus',
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  GIF = 'image/gif',
  WEBP = 'image/webp',
  ZIP = 'application/zip',
  RAR = 'application/x-rar-compressed',
  SEVENZ = 'application/x-7z-compressed',
  EXE = 'application/x-msdownload',
  APK = 'application/vnd.android.package-archive',
  JAVASCRIPT = 'application/javascript',
  HTML = 'text/html',
  UNKNOWN = 'application/octet-stream'
}

export interface PolicyManager {
  load(): Promise<ContentPolicy>;
  isAllowed(mime: MimeType): boolean;
  isBlocked(mime: MimeType): boolean;
  getNsfwThreshold(): number;
  getYouthMode(): boolean;
  getQuorumRequirement(): string;
  getBulletinTtl(): number;
  getPublisherCooloff(): number;
  getMaxPostsPerMinute(): number;
  requiresAttestation(): boolean;
  getRenderingLimits(): RenderingLimits;
  getPrivacySettings(): PrivacySettings;
}

export interface RenderingLimits {
  maxWidth: number;
  maxHeight: number;
  maxBitrateKbps: number;
  stripMetadata: boolean;
  sandboxDecode: boolean;
}

export interface PrivacySettings {
  logContentHashes: boolean;
  logUserActions: boolean;
  retentionDays: number;
  rateLimitLogsPerMinute: number;
}

export class PolicyManagerImpl implements PolicyManager {
  private policy: ContentPolicy | null = null;
  private allowedMimes: Set<string> = new Set();
  private blockedMimes: Set<string> = new Set();

  async load(): Promise<ContentPolicy> {
    try {
      // In a real implementation, this would load from the file system
      // For web, we'll load from a fetch request or embedded config
      const response = await fetch('/content_policy.yml');
      if (!response.ok) {
        throw new Error(`Failed to load policy: ${response.status}`);
      }
      
      const yamlText = await response.text();
      const parsed = this.parseYaml(yamlText);
      
      this.policy = ContentPolicySchema.parse(parsed);
      this.buildMimeSets();
      
      return this.policy;
    } catch (error) {
      console.error('Failed to load content policy:', error);
      // Return restrictive defaults
      return this.getDefaultPolicy();
    }
  }

  isAllowed(mime: MimeType): boolean {
    if (!this.policy) {
      // Restrictive default - only allow basic media types
      return [MimeType.MP4, MimeType.WEBM, MimeType.MP3, MimeType.JPEG, MimeType.PNG].includes(mime);
    }
    
    const mimeStr = mime.toString();
    const extension = this.mimeToExtension(mime);
    
    return this.policy.content.allow_types.includes(extension) && 
           !this.policy.content.block_types.includes(extension);
  }

  isBlocked(mime: MimeType): boolean {
    return !this.isAllowed(mime);
  }

  getNsfwThreshold(): number {
    if (!this.policy) return 0.85;
    
    return this.policy.content.nsfw.youth_mode 
      ? this.policy.content.nsfw.youth_threshold_block
      : this.policy.content.nsfw.threshold_block;
  }

  getYouthMode(): boolean {
    return this.policy?.content.nsfw.youth_mode ?? false;
  }

  getQuorumRequirement(): string {
    return this.policy?.content.moderation.bulletin_quorum ?? '2of3';
  }

  getBulletinTtl(): number {
    return this.policy?.content.moderation.bulletin_ttl_hours ?? 72;
  }

  getPublisherCooloff(): number {
    return this.policy?.content.publisher_controls.new_account_cooloff_hours ?? 24;
  }

  getMaxPostsPerMinute(): number {
    return this.policy?.content.publisher_controls.max_posts_per_minute ?? 2;
  }

  requiresAttestation(): boolean {
    return this.policy?.content.attestation.required_for_publish ?? true;
  }

  getRenderingLimits(): RenderingLimits {
    const defaults = {
      maxWidth: 1920,
      maxHeight: 1080,
      maxBitrateKbps: 5000,
      stripMetadata: true,
      sandboxDecode: true
    };

    if (!this.policy) return defaults;

    const r = this.policy.content.rendering;
    return {
      maxWidth: r.max_resolution_width,
      maxHeight: r.max_resolution_height,
      maxBitrateKbps: r.max_bitrate_kbps,
      stripMetadata: r.strip_metadata,
      sandboxDecode: r.sandbox_decode
    };
  }

  getPrivacySettings(): PrivacySettings {
    const defaults = {
      logContentHashes: false,
      logUserActions: true,
      retentionDays: 30,
      rateLimitLogsPerMinute: 60
    };

    if (!this.policy) return defaults;

    const p = this.policy.content.privacy;
    return {
      logContentHashes: p.log_content_hashes,
      logUserActions: p.log_user_actions,
      retentionDays: p.retention_days,
      rateLimitLogsPerMinute: p.rate_limit_logs_per_minute
    };
  }

  private buildMimeSets(): void {
    if (!this.policy) return;
    
    this.allowedMimes.clear();
    this.blockedMimes.clear();
    
    for (const ext of this.policy.content.allow_types) {
      const mime = this.extensionToMime(ext);
      if (mime) this.allowedMimes.add(mime);
    }
    
    for (const ext of this.policy.content.block_types) {
      const mime = this.extensionToMime(ext);
      if (mime) this.blockedMimes.add(mime);
    }
  }

  private mimeToExtension(mime: MimeType): string {
    const mapping: Record<string, string> = {
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/quicktime': 'mov',
      'audio/mpeg': 'mp3',
      'audio/aac': 'aac',
      'audio/opus': 'opus',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'application/zip': 'zip',
      'application/x-rar-compressed': 'rar',
      'application/x-7z-compressed': '7z',
      'application/x-msdownload': 'exe',
      'application/vnd.android.package-archive': 'apk',
      'application/javascript': 'js',
      'text/html': 'html'
    };
    
    return mapping[mime.toString()] || 'unknown';
  }

  private extensionToMime(extension: string): string | null {
    const mapping: Record<string, string> = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
      'mp3': 'audio/mpeg',
      'aac': 'audio/aac',
      'opus': 'audio/opus',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      'exe': 'application/x-msdownload',
      'apk': 'application/vnd.android.package-archive',
      'js': 'application/javascript',
      'html': 'text/html'
    };
    
    return mapping[extension.toLowerCase()] || null;
  }

  private parseYaml(yamlText: string): any {
    // Simple YAML parser for our structured config
    // In production, use a proper YAML library
    const lines = yamlText.split('\n').filter(line => 
      line.trim() && !line.trim().startsWith('#')
    );
    
    const result: any = {};
    let currentPath: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      const indent = line.length - line.trimStart().length;
      const level = Math.floor(indent / 2);
      
      if (trimmed.includes(':')) {
        const [key, value] = trimmed.split(':', 2);
        const cleanKey = key.trim();
        const cleanValue = value ? value.trim() : null;
        
        // Adjust current path based on indentation
        currentPath = currentPath.slice(0, level);
        currentPath.push(cleanKey);
        
        if (cleanValue) {
          // Parse value
          this.setNestedValue(result, currentPath, this.parseValue(cleanValue));
        }
      } else if (trimmed.startsWith('- ')) {
        // Array item
        const value = trimmed.substring(2).trim();
        const arrayPath = [...currentPath];
        
        if (!this.getNestedValue(result, arrayPath)) {
          this.setNestedValue(result, arrayPath, []);
        }
        
        this.getNestedValue(result, arrayPath).push(this.parseValue(value));
      }
    }
    
    return result;
  }

  private parseValue(value: string): any {
    // Parse boolean
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Parse number
    if (/^\d+(\.\d+)?$/.test(value)) {
      return value.includes('.') ? parseFloat(value) : parseInt(value);
    }
    
    // Parse string (remove quotes if present)
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }
    
    // Parse array
    if (value.startsWith('[') && value.endsWith(']')) {
      const items = value.slice(1, -1).split(',').map(item => 
        this.parseValue(item.trim())
      );
      return items;
    }
    
    return value;
  }

  private setNestedValue(obj: any, path: string[], value: any): void {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!(path[i] in current)) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  }

  private getNestedValue(obj: any, path: string[]): any {
    let current = obj;
    for (const key of path) {
      if (!(key in current)) return undefined;
      current = current[key];
    }
    return current;
  }

  private getDefaultPolicy(): ContentPolicy {
    return {
      content: {
        allow_types: ['mp4', 'webm', 'mp3', 'jpg', 'png'],
        block_types: ['zip', 'exe', 'apk', 'js', 'html'],
        nsfw: {
          enabled: true,
          threshold_block: 0.85,
          threshold_warn: 0.70,
          youth_mode: false,
          youth_threshold_block: 0.60
        },
        safety_manifest: {
          require_signed: true,
          include_sha256: true,
          include_phash: true,
          max_age_hours: 24
        },
        moderation: {
          bulletin_quorum: '2of3',
          bulletin_ttl_hours: 72,
          hash_block_expiry_days: 14,
          origin_revoke_expiry_days: 30
        },
        publisher_controls: {
          new_account_cooloff_hours: 24,
          max_posts_per_minute: 2,
          require_attestation: true
        },
        attestation: {
          required_for_publish: true,
          min_security_level: 'strongbox'
        },
        rendering: {
          max_resolution_width: 1920,
          max_resolution_height: 1080,
          max_bitrate_kbps: 5000,
          strip_metadata: true,
          sandbox_decode: true
        },
        privacy: {
          log_content_hashes: false,
          log_user_actions: true,
          retention_days: 30,
          rate_limit_logs_per_minute: 60
        }
      }
    };
  }
}

// Singleton instance
export const policyManager = new PolicyManagerImpl();