// NSFW Classifier - On-device content safety screening
// Offline neural network for adult content detection

export interface NsfwScore {
  score: number;           // [0,1] - probability of NSFW content
  confidence: number;      // [0,1] - model confidence in prediction
  categories: {
    neutral: number;
    suggestive: number;
    explicit: number;
  };
}

export interface NsfwClassifier {
  /** Returns NSFW probability [0,1]; must be fully offline */
  score(frame: ImageBitmap): Promise<NsfwScore>;
  
  /** Batch scoring for video frames */
  scoreFrames(frames: ImageBitmap[]): Promise<NsfwScore[]>;
  
  /** Check if model is loaded and ready */
  isReady(): boolean;
  
  /** Load the classifier model */
  initialize(): Promise<void>;
}

export interface VideoFrameSampler {
  sampleFrames(video: HTMLVideoElement, count?: number): Promise<ImageBitmap[]>;
  sampleKeyframes(video: HTMLVideoElement): Promise<ImageBitmap[]>;
}

export class NsfwClassifierImpl implements NsfwClassifier {
  private model: any = null;
  private isInitialized = false;
  private readonly modelUrl = '/models/nsfw-mobilenet.onnx'; // Placeholder URL

  async initialize(): Promise<void> {
    try {
      // In a real implementation, this would load an ONNX.js model
      // For demo purposes, we'll use a mock implementation
      console.log('Initializing NSFW classifier...');
      
      // Mock model loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.model = {
        predict: (tensor: any) => {
          // Mock prediction - in real implementation this would use ONNX.js
          const randomScore = Math.random();
          return {
            neutral: 1 - randomScore,
            suggestive: randomScore * 0.5,
            explicit: randomScore * 0.5
          };
        }
      };
      
      this.isInitialized = true;
      console.log('NSFW classifier initialized');
    } catch (error) {
      console.error('Failed to initialize NSFW classifier:', error);
      throw new Error(`NSFW classifier initialization failed: ${error}`);
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.model !== null;
  }

  async score(frame: ImageBitmap): Promise<NsfwScore> {
    if (!this.isReady()) {
      await this.initialize();
    }

    try {
      // Preprocess image for model input
      const tensor = await this.preprocessImage(frame);
      
      // Run inference
      const prediction = this.model.predict(tensor);
      
      // Calculate composite score
      const score = prediction.suggestive + prediction.explicit;
      const confidence = Math.max(prediction.neutral, prediction.suggestive, prediction.explicit);
      
      return {
        score,
        confidence,
        categories: {
          neutral: prediction.neutral,
          suggestive: prediction.suggestive,
          explicit: prediction.explicit
        }
      };
    } catch (error) {
      console.error('NSFW scoring failed:', error);
      // Return safe default on error
      return {
        score: 0.0,
        confidence: 0.0,
        categories: {
          neutral: 1.0,
          suggestive: 0.0,
          explicit: 0.0
        }
      };
    }
  }

  async scoreFrames(frames: ImageBitmap[]): Promise<NsfwScore[]> {
    const scores: NsfwScore[] = [];
    
    for (const frame of frames) {
      const score = await this.score(frame);
      scores.push(score);
    }
    
    return scores;
  }

  private async preprocessImage(frame: ImageBitmap): Promise<Float32Array> {
    try {
      // Resize to model input size (typically 224x224 for MobileNet)
      const canvas = new OffscreenCanvas(224, 224);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Draw and resize
      ctx.drawImage(frame, 0, 0, 224, 224);
      const imageData = ctx.getImageData(0, 0, 224, 224);
      
      // Normalize pixels to [0,1] and convert to CHW format
      const tensor = new Float32Array(3 * 224 * 224);
      const data = imageData.data;
      
      for (let i = 0; i < 224 * 224; i++) {
        const pixelOffset = i * 4;
        const tensorOffset = i;
        
        // Normalize RGB values [0,255] -> [0,1]
        tensor[tensorOffset] = data[pixelOffset] / 255.0;           // R
        tensor[tensorOffset + 224 * 224] = data[pixelOffset + 1] / 255.0;     // G
        tensor[tensorOffset + 2 * 224 * 224] = data[pixelOffset + 2] / 255.0; // B
      }
      
      return tensor;
    } catch (error) {
      throw new Error(`Image preprocessing failed: ${error}`);
    }
  }
}

export class VideoFrameSamplerImpl implements VideoFrameSampler {
  async sampleFrames(video: HTMLVideoElement, count: number = 5): Promise<ImageBitmap[]> {
    const frames: ImageBitmap[] = [];
    const duration = video.duration;
    
    if (!duration || duration <= 0) {
      throw new Error('Video duration not available');
    }

    try {
      for (let i = 0; i < count; i++) {
        // Sample frames evenly across video duration
        const timestamp = (duration * i) / (count - 1);
        const frame = await this.extractFrameAtTime(video, timestamp);
        frames.push(frame);
      }
      
      return frames;
    } catch (error) {
      // Clean up any allocated frames on error
      frames.forEach(frame => frame.close());
      throw new Error(`Frame sampling failed: ${error}`);
    }
  }

  async sampleKeyframes(video: HTMLVideoElement): Promise<ImageBitmap[]> {
    // For demo purposes, sample frames at key intervals
    // In production, this would analyze the video for actual keyframes
    const keyframeCount = Math.min(10, Math.ceil(video.duration / 5)); // One every 5 seconds
    return this.sampleFrames(video, keyframeCount);
  }

  private async extractFrameAtTime(video: HTMLVideoElement, timestamp: number): Promise<ImageBitmap> {
    return new Promise((resolve, reject) => {
      const originalTime = video.currentTime;
      
      const onSeeked = async () => {
        try {
          const canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          ctx.drawImage(video, 0, 0);
          const bitmap = await createImageBitmap(canvas);
          
          // Restore original time
          video.currentTime = originalTime;
          video.removeEventListener('seeked', onSeeked);
          
          resolve(bitmap);
        } catch (error) {
          video.removeEventListener('seeked', onSeeked);
          reject(error);
        }
      };
      
      video.addEventListener('seeked', onSeeked);
      video.currentTime = timestamp;
    });
  }
}

// Content safety utilities
export class ContentSafetyUtils {
  static async evaluateVideoSafety(
    video: HTMLVideoElement,
    classifier: NsfwClassifier,
    sampler: VideoFrameSampler,
    threshold: number = 0.85
  ): Promise<{ safe: boolean; maxScore: number; frameScores: NsfwScore[] }> {
    try {
      const frames = await sampler.sampleKeyframes(video);
      const scores = await classifier.scoreFrames(frames);
      
      // Clean up frames
      frames.forEach(frame => frame.close());
      
      const maxScore = Math.max(...scores.map(s => s.score));
      const safe = maxScore < threshold;
      
      return { safe, maxScore, frameScores: scores };
    } catch (error) {
      console.error('Video safety evaluation failed:', error);
      // Fail-safe: block on evaluation error
      return { 
        safe: false, 
        maxScore: 1.0, 
        frameScores: [] 
      };
    }
  }

  static async evaluateImageSafety(
    image: ImageBitmap,
    classifier: NsfwClassifier,
    threshold: number = 0.85
  ): Promise<{ safe: boolean; score: NsfwScore }> {
    try {
      const score = await classifier.score(image);
      const safe = score.score < threshold;
      
      return { safe, score };
    } catch (error) {
      console.error('Image safety evaluation failed:', error);
      // Fail-safe: block on evaluation error
      return { 
        safe: false, 
        score: { 
          score: 1.0, 
          confidence: 0.0, 
          categories: { neutral: 0.0, suggestive: 0.0, explicit: 1.0 } 
        }
      };
    }
  }

  static requiresConsecutiveSafeFrames(
    scores: NsfwScore[],
    threshold: number = 0.85,
    consecutiveRequired: number = 2
  ): boolean {
    if (scores.length < consecutiveRequired) {
      return false;
    }

    for (let i = 0; i <= scores.length - consecutiveRequired; i++) {
      let consecutiveSafe = true;
      
      for (let j = 0; j < consecutiveRequired; j++) {
        if (scores[i + j].score >= threshold) {
          consecutiveSafe = false;
          break;
        }
      }
      
      if (consecutiveSafe) {
        return true;
      }
    }
    
    return false;
  }
}

// Singleton instances
export const nsfwClassifier = new NsfwClassifierImpl();
export const videoFrameSampler = new VideoFrameSamplerImpl();