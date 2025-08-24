// Hash Management - SHA-256 + Perceptual Hashes for Media
// Implements fast content fingerprinting for duplicate detection

import { CryptoPrimitives } from '../crypto/primitives';

export interface MediaHashes {
  sha256: Uint8Array;      // File content hash
  pHash?: Uint8Array;      // Perceptual hash for images/video
  aHash?: Uint8Array;      // Average hash for images
  timestamp: number;       // When hashes were computed
}

export interface PerceptualHashResult {
  pHash: Uint8Array;       // 8-byte perceptual hash
  aHash: Uint8Array;       // 8-byte average hash
  confidence: number;      // Hash quality confidence [0,1]
}

export interface HashManager {
  computeFileHash(file: File): Promise<Uint8Array>;
  computeMediaHashes(file: File): Promise<MediaHashes>;
  computePerceptualHash(image: ImageBitmap): Promise<PerceptualHashResult>;
  hammingDistance(hash1: Uint8Array, hash2: Uint8Array): number;
  isSimilar(hash1: Uint8Array, hash2: Uint8Array, threshold?: number): boolean;
}

export class HashManagerImpl implements HashManager {
  private crypto = CryptoPrimitives.getInstance();

  async computeFileHash(file: File): Promise<Uint8Array> {
    try {
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      return await this.crypto.blake2s(data);
    } catch (error) {
      throw new Error(`Failed to compute file hash: ${error}`);
    }
  }

  async computeMediaHashes(file: File): Promise<MediaHashes> {
    try {
      const sha256 = await this.computeFileHash(file);
      const result: MediaHashes = {
        sha256,
        timestamp: Date.now()
      };

      // Compute perceptual hashes for images and videos
      if (this.isImageFile(file)) {
        const pHashResult = await this.computeImagePerceptualHash(file);
        result.pHash = pHashResult.pHash;
        result.aHash = pHashResult.aHash;
      } else if (this.isVideoFile(file)) {
        const pHashResult = await this.computeVideoPerceptualHash(file);
        result.pHash = pHashResult.pHash;
        result.aHash = pHashResult.aHash;
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to compute media hashes: ${error}`);
    }
  }

  async computePerceptualHash(image: ImageBitmap): Promise<PerceptualHashResult> {
    try {
      // Create canvas for image processing
      const canvas = new OffscreenCanvas(32, 32);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Resize to 32x32 and convert to grayscale
      ctx.drawImage(image, 0, 0, 32, 32);
      const imageData = ctx.getImageData(0, 0, 32, 32);
      const grayscale = this.toGrayscale(imageData);

      // Compute perceptual hash (DCT-based)
      const pHash = this.computeDctHash(grayscale);
      
      // Compute average hash
      const aHash = this.computeAverageHash(grayscale);

      // Estimate confidence based on image complexity
      const confidence = this.estimateHashConfidence(grayscale);

      return { pHash, aHash, confidence };
    } catch (error) {
      throw new Error(`Failed to compute perceptual hash: ${error}`);
    }
  }

  hammingDistance(hash1: Uint8Array, hash2: Uint8Array): number {
    if (hash1.length !== hash2.length) {
      throw new Error('Hash lengths must match');
    }

    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
      const xor = hash1[i] ^ hash2[i];
      // Count set bits (Hamming weight)
      let bits = xor;
      while (bits) {
        distance += bits & 1;
        bits >>= 1;
      }
    }
    return distance;
  }

  isSimilar(hash1: Uint8Array, hash2: Uint8Array, threshold: number = 10): boolean {
    const distance = this.hammingDistance(hash1, hash2);
    return distance <= threshold;
  }

  private async computeImagePerceptualHash(file: File): Promise<PerceptualHashResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const bitmap = await createImageBitmap(img);
          const result = await this.computePerceptualHash(bitmap);
          bitmap.close();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private async computeVideoPerceptualHash(file: File): Promise<PerceptualHashResult> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      
      video.onloadedmetadata = async () => {
        try {
          // Seek to middle of video for representative frame
          video.currentTime = video.duration * 0.5;
          
          video.onseeked = async () => {
            try {
              const canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight);
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                throw new Error('Failed to get canvas context');
              }

              ctx.drawImage(video, 0, 0);
              const bitmap = await createImageBitmap(canvas);
              const result = await this.computePerceptualHash(bitmap);
              bitmap.close();
              
              URL.revokeObjectURL(video.src);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          };
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  private toGrayscale(imageData: ImageData): number[] {
    const { data, width, height } = imageData;
    const grayscale: number[] = [];
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Use luminance formula
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      grayscale.push(gray);
    }
    
    return grayscale;
  }

  private computeDctHash(grayscale: number[]): Uint8Array {
    // Simplified DCT-based perceptual hash
    // In production, use a proper DCT implementation
    const size = Math.sqrt(grayscale.length);
    const dct = this.simpleDct(grayscale, size);
    
    // Take low-frequency 8x8 block (excluding DC component)
    const lowFreq = dct.slice(1, 65); // Skip DC, take next 64
    
    // Compute median
    const sorted = [...lowFreq].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    // Generate 64-bit hash
    const hash = new Uint8Array(8);
    for (let i = 0; i < 64; i++) {
      if (lowFreq[i] > median) {
        const byteIndex = Math.floor(i / 8);
        const bitIndex = i % 8;
        hash[byteIndex] |= (1 << bitIndex);
      }
    }
    
    return hash;
  }

  private computeAverageHash(grayscale: number[]): Uint8Array {
    // Compute average pixel value
    const average = grayscale.reduce((sum, val) => sum + val, 0) / grayscale.length;
    
    // Generate 64-bit hash (assuming 32x32 = 1024 pixels, take every 16th)
    const hash = new Uint8Array(8);
    for (let i = 0; i < 64; i++) {
      const pixelIndex = i * 16; // Sample every 16th pixel
      if (pixelIndex < grayscale.length && grayscale[pixelIndex] > average) {
        const byteIndex = Math.floor(i / 8);
        const bitIndex = i % 8;
        hash[byteIndex] |= (1 << bitIndex);
      }
    }
    
    return hash;
  }

  private simpleDct(data: number[], size: number): number[] {
    // Simplified 2D DCT - in production use optimized DCT library
    const result: number[] = [];
    const N = size;
    
    for (let u = 0; u < N; u++) {
      for (let v = 0; v < N; v++) {
        let sum = 0;
        
        for (let x = 0; x < N; x++) {
          for (let y = 0; y < N; y++) {
            const val = data[x * N + y];
            const cosU = Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N));
            const cosV = Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
            sum += val * cosU * cosV;
          }
        }
        
        const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
        const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
        
        result.push((cu * cv * sum) / 4);
      }
    }
    
    return result;
  }

  private estimateHashConfidence(grayscale: number[]): number {
    // Estimate hash quality based on image complexity
    let variance = 0;
    const mean = grayscale.reduce((sum, val) => sum + val, 0) / grayscale.length;
    
    for (const val of grayscale) {
      variance += Math.pow(val - mean, 2);
    }
    variance /= grayscale.length;
    
    // Higher variance = more complex image = more reliable hash
    // Normalize to [0,1] range
    return Math.min(variance / 10000, 1.0);
  }

  private isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  private isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }
}

// Singleton instance
export const hashManager = new HashManagerImpl();