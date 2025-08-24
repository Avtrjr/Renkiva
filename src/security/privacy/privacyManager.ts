// Privacy manager with local-first metrics and rotating pseudonyms
// Implements opt-in data collection with retention limits

export interface PrivacyConfig {
  pseudonymRotationHours: number;
  defaultRetentionDays: number;
  requireOptIn: boolean;
  localOnlyByDefault: boolean;
  allowedDataTypes: string[];
}

export interface MetricEntry {
  timestamp: number;
  type: string;
  data: any;
  pseudonym: string;
  localOnly: boolean;
}

export interface PseudonymRotation {
  currentPseudonym: string;
  lastRotation: number;
  rotationCount: number;
}

export class PrivacyManager {
  private config: PrivacyConfig;
  private localMetrics: Map<string, MetricEntry[]>;
  private optInStatus: Map<string, boolean>; // data type -> opt-in status
  private pseudonymState: PseudonymRotation;
  private retentionTimers: Map<string, number>;

  constructor(config: Partial<PrivacyConfig> = {}) {
    this.config = {
      pseudonymRotationHours: 24,
      defaultRetentionDays: 30,
      requireOptIn: true,
      localOnlyByDefault: true,
      allowedDataTypes: [
        'performance',
        'usage',
        'security_events',
        'rf_metrics',
        'crash_reports'
      ],
      ...config
    };

    this.localMetrics = new Map();
    this.optInStatus = new Map();
    this.retentionTimers = new Map();
    
    // Initialize pseudonym
    this.pseudonymState = {
      currentPseudonym: this.generatePseudonym(),
      lastRotation: Date.now(),
      rotationCount: 0
    };

    // Set up automatic pseudonym rotation
    this.startPseudonymRotation();
  }

  /**
   * Record metrics with privacy controls
   */
  recordMetric(type: string, data: any, forceLocal: boolean = false): boolean {
    // Check if data type is allowed
    if (!this.config.allowedDataTypes.includes(type)) {
      console.warn(`Data type '${type}' not in allowed list`);
      return false;
    }

    // Check opt-in status
    if (this.config.requireOptIn && !this.isOptedIn(type) && !forceLocal) {
      console.log(`Skipping metric '${type}' - user not opted in`);
      return false;
    }

    // Check pseudonym rotation
    this.checkPseudonymRotation();

    // Create metric entry
    const entry: MetricEntry = {
      timestamp: Date.now(),
      type,
      data: this.sanitizeData(data),
      pseudonym: this.pseudonymState.currentPseudonym,
      localOnly: forceLocal || this.config.localOnlyByDefault
    };

    // Store locally
    const entries = this.localMetrics.get(type) || [];
    entries.push(entry);
    this.localMetrics.set(type, entries);

    // Set retention timer
    this.setRetentionTimer(type, entry.timestamp);

    return true;
  }

  /**
   * Set opt-in status for data type
   */
  setOptInStatus(dataType: string, optedIn: boolean): void {
    this.optInStatus.set(dataType, optedIn);
    
    if (!optedIn) {
      // Clear existing data if user opts out
      this.clearDataType(dataType);
    }
    
    console.log(`Privacy opt-in for '${dataType}': ${optedIn}`);
  }

  /**
   * Get opt-in status for data type
   */
  isOptedIn(dataType: string): boolean {
    return this.optInStatus.get(dataType) || false;
  }

  /**
   * Get all opt-in statuses
   */
  getAllOptInStatuses(): Record<string, boolean> {
    const statuses: Record<string, boolean> = {};
    for (const dataType of this.config.allowedDataTypes) {
      statuses[dataType] = this.isOptedIn(dataType);
    }
    return statuses;
  }

  /**
   * Export anonymized metrics (if opted in)
   */
  exportMetrics(dataTypes?: string[]): { metrics: any[]; metadata: any } | null {
    const typesToExport = dataTypes || this.config.allowedDataTypes;
    const exportedMetrics: any[] = [];
    
    for (const type of typesToExport) {
      if (!this.isOptedIn(type)) {
        continue;
      }
      
      const entries = this.localMetrics.get(type) || [];
      for (const entry of entries) {
        if (!entry.localOnly) {
          exportedMetrics.push({
            timestamp: entry.timestamp,
            type: entry.type,
            data: entry.data,
            pseudonym: entry.pseudonym
          });
        }
      }
    }

    if (exportedMetrics.length === 0) {
      return null;
    }

    return {
      metrics: exportedMetrics,
      metadata: {
        exportTime: Date.now(),
        rotationCount: this.pseudonymState.rotationCount,
        privacyVersion: '1.0'
      }
    };
  }

  /**
   * Clear all data for specific type
   */
  clearDataType(dataType: string): void {
    this.localMetrics.delete(dataType);
    console.log(`Cleared all data for type: ${dataType}`);
  }

  /**
   * Clear all stored metrics
   */
  clearAllData(): void {
    this.localMetrics.clear();
    this.optInStatus.clear();
    console.log('Cleared all privacy data');
  }

  /**
   * Generate rotating pseudonym
   */
  private generatePseudonym(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if pseudonym needs rotation
   */
  private checkPseudonymRotation(): void {
    const now = Date.now();
    const rotationIntervalMs = this.config.pseudonymRotationHours * 60 * 60 * 1000;
    
    if (now - this.pseudonymState.lastRotation >= rotationIntervalMs) {
      this.rotatePseudonym();
    }
  }

  /**
   * Rotate pseudonym
   */
  private rotatePseudonym(): void {
    const oldPseudonym = this.pseudonymState.currentPseudonym;
    this.pseudonymState = {
      currentPseudonym: this.generatePseudonym(),
      lastRotation: Date.now(),
      rotationCount: this.pseudonymState.rotationCount + 1
    };
    
    console.log(`Pseudonym rotated: ${oldPseudonym.substring(0, 8)}... -> ${this.pseudonymState.currentPseudonym.substring(0, 8)}...`);
  }

  /**
   * Start automatic pseudonym rotation
   */
  private startPseudonymRotation(): void {
    const rotationIntervalMs = this.config.pseudonymRotationHours * 60 * 60 * 1000;
    
    setInterval(() => {
      this.rotatePseudonym();
    }, rotationIntervalMs);
  }

  /**
   * Sanitize data to remove potential identifiers
   */
  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    
    // Remove common identifying fields
    const identifyingFields = [
      'deviceId', 'userId', 'sessionId', 'ip', 'mac', 'imei',
      'phoneNumber', 'email', 'name', 'address', 'location'
    ];

    for (const field of identifyingFields) {
      if (field in sanitized) {
        delete sanitized[field];
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Set retention timer for data cleanup
   */
  private setRetentionTimer(dataType: string, timestamp: number): void {
    const retentionMs = this.config.defaultRetentionDays * 24 * 60 * 60 * 1000;
    const expireTime = timestamp + retentionMs;
    
    const existingTimer = this.retentionTimers.get(dataType);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.cleanupExpiredData(dataType, expireTime);
    }, retentionMs) as unknown as number;

    this.retentionTimers.set(dataType, timer);
  }

  /**
   * Clean up expired data based on retention policy
   */
  private cleanupExpiredData(dataType: string, expireTime: number): void {
    const entries = this.localMetrics.get(dataType) || [];
    const filtered = entries.filter(entry => entry.timestamp >= expireTime);
    
    const removedCount = entries.length - filtered.length;
    if (removedCount > 0) {
      this.localMetrics.set(dataType, filtered);
      console.log(`Cleaned up ${removedCount} expired entries for type: ${dataType}`);
    }
  }

  /**
   * Get privacy statistics
   */
  getPrivacyStats(): {
    currentPseudonym: string;
    rotationCount: number;
    totalMetrics: number;
    optedInTypes: string[];
    retentionDays: number;
  } {
    let totalMetrics = 0;
    for (const entries of this.localMetrics.values()) {
      totalMetrics += entries.length;
    }

    const optedInTypes = this.config.allowedDataTypes.filter(type => this.isOptedIn(type));

    return {
      currentPseudonym: this.pseudonymState.currentPseudonym.substring(0, 8) + '...',
      rotationCount: this.pseudonymState.rotationCount,
      totalMetrics,
      optedInTypes,
      retentionDays: this.config.defaultRetentionDays
    };
  }
}