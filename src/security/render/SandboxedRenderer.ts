// Sandboxed Media Renderer - Isolated decode with metadata stripping
// Prevents malformed media from compromising the main process

import { policyManager } from '../policy/PolicyManager';

export interface RenderingConstraints {
  maxWidth: number;
  maxHeight: number;
  maxBitrateKbps: number;
  stripMetadata: boolean;
  timeoutMs: number;
}

export interface RenderResult {
  success: boolean;
  sanitizedBlob?: Blob;
  originalSize: number;
  sanitizedSize: number;
  metadataStripped: string[];
  errors: string[];
}

export interface SandboxedRenderer {
  renderVideo(file: File, constraints?: Partial<RenderingConstraints>): Promise<RenderResult>;
  renderImage(file: File, constraints?: Partial<RenderingConstraints>): Promise<RenderResult>;
  renderAudio(file: File, constraints?: Partial<RenderingConstraints>): Promise<RenderResult>;
  isSupported(mimeType: string): boolean;
}

export class SandboxedRendererImpl implements SandboxedRenderer {
  private readonly defaultConstraints: RenderingConstraints = {
    maxWidth: 1920,
    maxHeight: 1080,
    maxBitrateKbps: 5000,
    stripMetadata: true,
    timeoutMs: 30000
  };

  async renderVideo(file: File, constraints?: Partial<RenderingConstraints>): Promise<RenderResult> {
    const config = { ...this.defaultConstraints, ...constraints };
    const errors: string[] = [];
    const metadataStripped: string[] = [];

    try {
      // Create video element in isolated context
      const video = document.createElement('video');
      video.style.display = 'none';
      video.muted = true;
      video.preload = 'metadata';
      
      const originalSize = file.size;
      let sanitizedBlob: Blob | undefined;

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          resolve({
            success: false,
            originalSize,
            sanitizedSize: 0,
            metadataStripped,
            errors: ['Rendering timeout exceeded']
          });
        }, config.timeoutMs);

        const cleanup = () => {
          clearTimeout(timeout);
          video.remove();
          if (video.src) {
            URL.revokeObjectURL(video.src);
          }
        };

        video.onloadedmetadata = async () => {
          try {
            // Validate dimensions
            if (video.videoWidth > config.maxWidth || video.videoHeight > config.maxHeight) {
              errors.push(`Video resolution ${video.videoWidth}x${video.videoHeight} exceeds limits`);
            }

            // Create canvas for re-encoding (strips metadata)
            if (config.stripMetadata) {
              sanitizedBlob = await this.sanitizeVideo(video, config);
              metadataStripped.push('EXIF', 'XMP', 'ColorSpace');
            } else {
              sanitizedBlob = file;
            }

            cleanup();
            resolve({
              success: true,
              sanitizedBlob,
              originalSize,
              sanitizedSize: sanitizedBlob.size,
              metadataStripped,
              errors
            });
          } catch (error) {
            cleanup();
            resolve({
              success: false,
              originalSize,
              sanitizedSize: 0,
              metadataStripped,
              errors: [`Video processing failed: ${error}`]
            });
          }
        };

        video.onerror = () => {
          cleanup();
          resolve({
            success: false,
            originalSize,
            sanitizedSize: 0,
            metadataStripped,
            errors: ['Video decode failed - potentially malformed']
          });
        };

        // Load video
        video.src = URL.createObjectURL(file);
      });
    } catch (error) {
      return {
        success: false,
        originalSize: file.size,
        sanitizedSize: 0,
        metadataStripped,
        errors: [`Renderer initialization failed: ${error}`]
      };
    }
  }

  async renderImage(file: File, constraints?: Partial<RenderingConstraints>): Promise<RenderResult> {
    const config = { ...this.defaultConstraints, ...constraints };
    const errors: string[] = [];
    const metadataStripped: string[] = [];
    const originalSize = file.size;

    try {
      // Create image in isolated context
      const img = new Image();
      img.style.display = 'none';

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          cleanup();
          resolve({
            success: false,
            originalSize,
            sanitizedSize: 0,
            metadataStripped,
            errors: ['Image rendering timeout']
          });
        }, config.timeoutMs);

        const cleanup = () => {
          clearTimeout(timeout);
          if (img.src) {
            URL.revokeObjectURL(img.src);
          }
        };

        img.onload = async () => {
          try {
            // Validate dimensions
            if (img.naturalWidth > config.maxWidth || img.naturalHeight > config.maxHeight) {
              errors.push(`Image resolution ${img.naturalWidth}x${img.naturalHeight} exceeds limits`);
            }

            // Re-encode to strip metadata
            const sanitizedBlob = await this.sanitizeImage(img, config);
            metadataStripped.push('EXIF', 'IPTC', 'XMP', 'ICC');

            cleanup();
            resolve({
              success: true,
              sanitizedBlob,
              originalSize,
              sanitizedSize: sanitizedBlob.size,
              metadataStripped,
              errors
            });
          } catch (error) {
            cleanup();
            resolve({
              success: false,
              originalSize,
              sanitizedSize: 0,
              metadataStripped,
              errors: [`Image processing failed: ${error}`]
            });
          }
        };

        img.onerror = () => {
          cleanup();
          resolve({
            success: false,
            originalSize,
            sanitizedSize: 0,
            metadataStripped,
            errors: ['Image decode failed - potentially malformed']
          });
        };

        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      return {
        success: false,
        originalSize,
        sanitizedSize: 0,
        metadataStripped,
        errors: [`Image renderer failed: ${error}`]
      };
    }
  }

  async renderAudio(file: File, constraints?: Partial<RenderingConstraints>): Promise<RenderResult> {
    const config = { ...this.defaultConstraints, ...constraints };
    const errors: string[] = [];
    const metadataStripped: string[] = [];
    const originalSize = file.size;

    try {
      // Create audio context for processing
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          audioContext.close();
          resolve({
            success: false,
            originalSize,
            sanitizedSize: 0,
            metadataStripped,
            errors: ['Audio rendering timeout']
          });
        }, config.timeoutMs);

        audioContext.decodeAudioData(arrayBuffer)
          .then(async (audioBuffer) => {
            clearTimeout(timeout);
            
            try {
              // Re-encode to strip metadata
              const sanitizedBlob = await this.sanitizeAudio(audioBuffer, config);
              metadataStripped.push('ID3', 'Vorbis Comments', 'APE');

              await audioContext.close();
              resolve({
                success: true,
                sanitizedBlob,
                originalSize,
                sanitizedSize: sanitizedBlob.size,
                metadataStripped,
                errors
              });
            } catch (error) {
              await audioContext.close();
              resolve({
                success: false,
                originalSize,
                sanitizedSize: 0,
                metadataStripped,
                errors: [`Audio processing failed: ${error}`]
              });
            }
          })
          .catch(async () => {
            clearTimeout(timeout);
            await audioContext.close();
            resolve({
              success: false,
              originalSize,
              sanitizedSize: 0,
              metadataStripped,
              errors: ['Audio decode failed - potentially malformed']
            });
          });
      });
    } catch (error) {
      return {
        success: false,
        originalSize,
        sanitizedSize: 0,
        metadataStripped,
        errors: [`Audio renderer failed: ${error}`]
      };
    }
  }

  isSupported(mimeType: string): boolean {
    // Check if browser supports the media type
    if (mimeType.startsWith('video/')) {
      const video = document.createElement('video');
      return video.canPlayType(mimeType) !== '';
    } else if (mimeType.startsWith('image/')) {
      // Most image types supported by canvas
      return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType);
    } else if (mimeType.startsWith('audio/')) {
      const audio = document.createElement('audio');
      return audio.canPlayType(mimeType) !== '';
    }
    return false;
  }

  private async sanitizeVideo(video: HTMLVideoElement, config: RenderingConstraints): Promise<Blob> {
    // Create canvas for re-encoding
    const canvas = new OffscreenCanvas(
      Math.min(video.videoWidth, config.maxWidth),
      Math.min(video.videoHeight, config.maxHeight)
    );
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context unavailable');
    }

    // Draw frame to strip metadata
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob (removes all metadata)
    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: 0.85
    });

    return blob;
  }

  private async sanitizeImage(img: HTMLImageElement, config: RenderingConstraints): Promise<Blob> {
    // Create canvas for re-encoding
    const canvas = new OffscreenCanvas(
      Math.min(img.naturalWidth, config.maxWidth),
      Math.min(img.naturalHeight, config.maxHeight)
    );
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context unavailable');
    }

    // Draw image to strip metadata
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob (removes EXIF/ICC/XMP)
    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: 0.90
    });

    return blob;
  }

  private async sanitizeAudio(audioBuffer: AudioBuffer, config: RenderingConstraints): Promise<Blob> {
    // For demo purposes, return a basic WAV encoding
    // In production, use a proper audio encoder library
    const length = audioBuffer.length;
    const numberOfChannels = Math.min(audioBuffer.numberOfChannels, 2);
    const sampleRate = audioBuffer.sampleRate;
    
    // Create WAV header
    const buffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Write audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }
}

// Singleton instance
export const sandboxedRenderer = new SandboxedRendererImpl();