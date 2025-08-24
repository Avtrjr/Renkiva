// Report Manager - User reporting flow with evidence collection
// Bundles manifest + proof sample for moderator review

import { SafetyManifest } from '../safetymanifest/ManifestSigner';
import { hashManager } from '../hashes/HashManager';

export enum ReportReason {
  NSFW_CONTENT = 'NSFW_CONTENT',
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  MISINFORMATION = 'MISINFORMATION',
  COPYRIGHT = 'COPYRIGHT',
  MALWARE = 'MALWARE',
  OTHER = 'OTHER'
}

export interface ContentReport {
  id: string;
  reportedAt: number;
  reporterId: string;               // Anonymous/pseudonymous ID
  reason: ReportReason;
  description: string;
  evidence: ReportEvidence;
  status: ReportStatus;
  moderatorNotes?: string;
  resolvedAt?: number;
  resolvedBy?: string;
}

export interface ReportEvidence {
  manifest: SafetyManifest;         // Original manifest
  contentHash: Uint8Array;          // SHA-256 of reported content
  proofSample: Uint8Array;          // Small proof sample (first 1KB)
  screenshots?: Uint8Array[];       // Optional screenshots
  timestamp: number;                // When evidence was collected
  reporterSignature: Uint8Array;    // Ed25519 signature by reporter
}

export enum ReportStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CONFIRMED = 'CONFIRMED',
  DISMISSED = 'DISMISSED',
  ESCALATED = 'ESCALATED'
}

export interface ReportManager {
  createReport(
    manifest: SafetyManifest,
    content: File,
    reason: ReportReason,
    description: string,
    reporterKeyHandle: string
  ): Promise<ContentReport>;
  
  submitReport(report: ContentReport): Promise<boolean>;
  getReports(status?: ReportStatus): Promise<ContentReport[]>;
  updateReportStatus(reportId: string, status: ReportStatus, moderatorNotes?: string): Promise<boolean>;
  generateEvidence(manifest: SafetyManifest, content: File, reporterKeyHandle: string): Promise<ReportEvidence>;
}

export class ReportManagerImpl implements ReportManager {
  private reports = new Map<string, ContentReport>();
  
  async createReport(
    manifest: SafetyManifest,
    content: File,
    reason: ReportReason,
    description: string,
    reporterKeyHandle: string
  ): Promise<ContentReport> {
    try {
      // Generate evidence bundle
      const evidence = await this.generateEvidence(manifest, content, reporterKeyHandle);
      
      const report: ContentReport = {
        id: this.generateReportId(),
        reportedAt: Date.now(),
        reporterId: await this.generatePseudonymousId(reporterKeyHandle),
        reason,
        description,
        evidence,
        status: ReportStatus.PENDING
      };

      this.reports.set(report.id, report);
      return report;
    } catch (error) {
      throw new Error(`Failed to create report: ${error}`);
    }
  }

  async submitReport(report: ContentReport): Promise<boolean> {
    try {
      // In a real implementation, this would submit to moderator queue
      // For now, we'll just store locally and log
      console.log(`Report submitted: ${report.id} for ${report.reason}`);
      
      // Update status
      report.status = ReportStatus.UNDER_REVIEW;
      this.reports.set(report.id, report);
      
      return true;
    } catch (error) {
      console.error('Failed to submit report:', error);
      return false;
    }
  }

  async getReports(status?: ReportStatus): Promise<ContentReport[]> {
    const allReports = Array.from(this.reports.values());
    
    if (status) {
      return allReports.filter(report => report.status === status);
    }
    
    return allReports.sort((a, b) => b.reportedAt - a.reportedAt);
  }

  async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    moderatorNotes?: string
  ): Promise<boolean> {
    const report = this.reports.get(reportId);
    if (!report) {
      return false;
    }

    report.status = status;
    if (moderatorNotes) {
      report.moderatorNotes = moderatorNotes;
    }
    
    if (status === ReportStatus.CONFIRMED || status === ReportStatus.DISMISSED) {
      report.resolvedAt = Date.now();
    }

    this.reports.set(reportId, report);
    return true;
  }

  async generateEvidence(
    manifest: SafetyManifest,
    content: File,
    reporterKeyHandle: string
  ): Promise<ReportEvidence> {
    try {
      // Compute content hash
      const contentHash = await hashManager.computeFileHash(content);
      
      // Create proof sample (first 1KB of file)
      const proofSize = Math.min(1024, content.size);
      const proofBuffer = await content.slice(0, proofSize).arrayBuffer();
      const proofSample = new Uint8Array(proofBuffer);
      
      // Create evidence payload for signing
      const evidencePayload = this.createEvidencePayload(manifest, contentHash, proofSample);
      
      // Sign the evidence (in production, use actual crypto)
      const reporterSignature = new Uint8Array(64); // Placeholder signature
      crypto.getRandomValues(reporterSignature);

      return {
        manifest,
        contentHash,
        proofSample,
        timestamp: Date.now(),
        reporterSignature
      };
    } catch (error) {
      throw new Error(`Failed to generate evidence: ${error}`);
    }
  }

  private generateReportId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async generatePseudonymousId(reporterKeyHandle: string): Promise<string> {
    // Generate pseudonymous ID that rotates daily
    const date = new Date().toDateString();
    const payload = new TextEncoder().encode(`${reporterKeyHandle}:${date}`);
    
    // In production, use actual hash function
    const hash = await crypto.subtle.digest('SHA-256', payload);
    const hashArray = new Uint8Array(hash);
    
    // Use first 8 bytes as pseudonymous ID
    return Array.from(hashArray.slice(0, 8))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private createEvidencePayload(
    manifest: SafetyManifest,
    contentHash: Uint8Array,
    proofSample: Uint8Array
  ): Uint8Array {
    // Create deterministic payload for signing
    const manifestHash = Array.from(manifest.sha256);
    const contentHashArray = Array.from(contentHash);
    const proofArray = Array.from(proofSample);
    
    const payload = {
      manifestHash,
      contentHash: contentHashArray,
      proofSample: proofArray,
      timestamp: Date.now()
    };

    const jsonString = JSON.stringify(payload, Object.keys(payload).sort());
    return new TextEncoder().encode(jsonString);
  }
}

// Report utilities
export class ReportUtils {
  static summarizeReport(report: ContentReport): string {
    const age = Date.now() - report.reportedAt;
    const ageHours = Math.floor(age / (60 * 60 * 1000));
    
    const contentHashHex = Array.from(report.evidence.contentHash.slice(0, 8))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return `${report.reason} | Hash: ${contentHashHex}... | Reporter: ${report.reporterId.slice(0, 8)}... | Age: ${ageHours}h | Status: ${report.status}`;
  }

  static getReasonDisplayName(reason: ReportReason): string {
    const names: Record<ReportReason, string> = {
      [ReportReason.NSFW_CONTENT]: 'Adult Content',
      [ReportReason.SPAM]: 'Spam',
      [ReportReason.HARASSMENT]: 'Harassment',
      [ReportReason.MISINFORMATION]: 'Misinformation',
      [ReportReason.COPYRIGHT]: 'Copyright Violation',
      [ReportReason.MALWARE]: 'Malware',
      [ReportReason.OTHER]: 'Other'
    };
    
    return names[reason] || reason;
  }

  static validateReport(report: ContentReport): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!report.id || typeof report.id !== 'string') {
      errors.push('Invalid report ID');
    }

    if (!report.reportedAt || report.reportedAt <= 0) {
      errors.push('Invalid reported timestamp');
    }

    if (!report.reporterId || typeof report.reporterId !== 'string') {
      errors.push('Invalid reporter ID');
    }

    if (!Object.values(ReportReason).includes(report.reason)) {
      errors.push('Invalid report reason');
    }

    if (!report.description || report.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!report.evidence || !report.evidence.manifest) {
      errors.push('Evidence is required');
    }

    if (!Object.values(ReportStatus).includes(report.status)) {
      errors.push('Invalid report status');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static canModerate(userRole: string, report: ContentReport): boolean {
    // Only moderators can update report status
    return userRole === 'MODERATOR';
  }
}

// Singleton instance
export const reportManager = new ReportManagerImpl();