// Content Ingest Pipeline - Sender-side validation and signing
// Preflight checks → NSFW scan → manifest creation → sign → publish

import { policyManager, MimeType } from '../policy/PolicyManager';
import { hashManager } from '../hashes/HashManager';
import { nsfwClassifier, ContentSafetyUtils } from '../nsfw/NsfwClassifier';
import { manifestSigner } from '../safetymanifest/ManifestSigner';

export interface IngestResult {
  success: boolean;
  manifest?: any;
  errors: string[];
  warnings: string[];
}

export class ContentIngest {
  async validateAndSign(file: File, originKeyHandle: string, originPubKey: Uint8Array): Promise<IngestResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. MIME validation
      const mime = this.detectMimeType(file);
      if (!policyManager.isAllowed(mime)) {
        errors.push(`Blocked MIME type: ${mime}`);
        return { success: false, errors, warnings };
      }

      // 2. Compute hashes
      const hashes = await hashManager.computeMediaHashes(file);

      // 3. NSFW screening for media files
      let nsfwScore = 0.0;
      if (file.type.startsWith('image/')) {
        const bitmap = await this.createImageBitmap(file);
        const result = await ContentSafetyUtils.evaluateImageSafety(bitmap, nsfwClassifier);
        nsfwScore = result.score.score;
        bitmap.close();
      } else if (file.type.startsWith('video/')) {
        const video = await this.createVideoElement(file);
        const result = await ContentSafetyUtils.evaluateVideoSafety(video, nsfwClassifier, undefined as any);
        nsfwScore = result.maxScore;
      }

      // 4. Check NSFW threshold
      const threshold = policyManager.getNsfwThreshold();
      if (nsfwScore >= threshold) {
        errors.push(`Content blocked: NSFW score ${nsfwScore.toFixed(3)} >= ${threshold}`);
        return { success: false, errors, warnings };
      }

      // 5. Create and sign manifest
      const manifestData = await manifestSigner.createManifest(file, hashes, nsfwScore, originPubKey);
      const manifest = await manifestSigner.sign(manifestData, originKeyHandle);

      return { success: true, manifest, errors, warnings };
    } catch (error) {
      errors.push(`Ingest failed: ${error}`);
      return { success: false, errors, warnings };
    }
  }

  private detectMimeType(file: File): MimeType {
    // In production, would use magic bytes detection
    return file.type as MimeType || MimeType.UNKNOWN;
  }

  private async createImageBitmap(file: File): Promise<ImageBitmap> {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    return createImageBitmap(img);
  }

  private async createVideoElement(file: File): Promise<HTMLVideoElement> {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
    });
    return video;
  }
}

export const contentIngest = new ContentIngest();