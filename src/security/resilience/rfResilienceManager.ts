// RF resilience with interference detection and adaptive fallback
// Implements auto fallback to audio-only and adaptive bitrate

export interface RFMetrics {
  signalStrength: number; // dBm
  noiseFloor: number; // dBm
  snr: number; // Signal-to-noise ratio
  packetLoss: number; // Percentage
  bitErrorRate: number; // BER
  channelUtilization: number; // Percentage
}

export interface AdaptiveConfig {
  interferenceThreshold: number; // dBm
  audioFallbackBitrate: number; // kbps
  bitrateStepPercent: number; // Percentage change per step
  minBitrate: number; // kbps
  maxBitrate: number; // kbps
  fallbackThresholdPacketLoss: number; // Percentage
}

export class RFResilienceManager {
  private rfMetrics: RFMetrics;
  private adaptiveConfig: AdaptiveConfig;
  private currentBitrate: number;
  private audioFallbackActive: boolean;
  private interferenceDetected: boolean;
  private channelMap: Map<number, number>; // channel -> quality score
  private currentChannel: number;
  private metricHistory: RFMetrics[];
  private readonly historySize = 10;

  constructor(config: Partial<AdaptiveConfig> = {}) {
    this.adaptiveConfig = {
      interferenceThreshold: -70, // dBm
      audioFallbackBitrate: 64, // kbps
      bitrateStepPercent: 20,
      minBitrate: 64,
      maxBitrate: 2000,
      fallbackThresholdPacketLoss: 5, // 5%
      ...config
    };

    this.rfMetrics = {
      signalStrength: -50,
      noiseFloor: -90,
      snr: 40,
      packetLoss: 0,
      bitErrorRate: 0,
      channelUtilization: 0
    };

    this.currentBitrate = 500; // Start at medium bitrate
    this.audioFallbackActive = false;
    this.interferenceDetected = false;
    this.channelMap = new Map();
    this.currentChannel = 1;
    this.metricHistory = [];
  }

  /**
   * Update RF metrics and trigger adaptations
   */
  updateMetrics(metrics: Partial<RFMetrics>): void {
    // Update current metrics
    this.rfMetrics = { ...this.rfMetrics, ...metrics };
    
    // Add to history
    this.metricHistory.push({ ...this.rfMetrics });
    if (this.metricHistory.length > this.historySize) {
      this.metricHistory.shift();
    }

    // Detect interference
    this.detectInterference();
    
    // Adapt bitrate and fallback strategy
    this.adaptTransmission();
    
    // Update channel quality mapping
    this.updateChannelQuality();
  }

  /**
   * Detect RF interference and signal degradation
   */
  private detectInterference(): void {
    const previousState = this.interferenceDetected;
    
    // Check signal strength threshold
    const signalTooWeak = this.rfMetrics.signalStrength < this.adaptiveConfig.interferenceThreshold;
    
    // Check SNR degradation
    const snrTooLow = this.rfMetrics.snr < 10; // dB
    
    // Check packet loss
    const highPacketLoss = this.rfMetrics.packetLoss > this.adaptiveConfig.fallbackThresholdPacketLoss;
    
    // Check channel utilization
    const channelCongested = this.rfMetrics.channelUtilization > 80;
    
    this.interferenceDetected = signalTooWeak || snrTooLow || highPacketLoss || channelCongested;
    
    if (this.interferenceDetected && !previousState) {
      console.warn('RF interference detected:', {
        signalStrength: this.rfMetrics.signalStrength,
        snr: this.rfMetrics.snr,
        packetLoss: this.rfMetrics.packetLoss,
        channelUtilization: this.rfMetrics.channelUtilization
      });
    }
  }

  /**
   * Adapt transmission parameters based on conditions
   */
  private adaptTransmission(): void {
    const avgPacketLoss = this.getAveragePacketLoss();
    
    // Check if audio fallback is needed
    if (avgPacketLoss > this.adaptiveConfig.fallbackThresholdPacketLoss || 
        this.rfMetrics.signalStrength < this.adaptiveConfig.interferenceThreshold - 10) {
      
      if (!this.audioFallbackActive) {
        console.warn('Activating audio-only fallback due to poor RF conditions');
        this.audioFallbackActive = true;
        this.currentBitrate = this.adaptiveConfig.audioFallbackBitrate;
      }
    } else if (this.audioFallbackActive && avgPacketLoss < 2) {
      // Re-enable video if conditions improve
      console.log('RF conditions improved, disabling audio fallback');
      this.audioFallbackActive = false;
      this.currentBitrate = 250; // Conservative restart bitrate
    }

    // Adaptive bitrate adjustment
    if (!this.audioFallbackActive) {
      this.adjustBitrate();
    }
  }

  /**
   * Adjust bitrate based on current conditions
   */
  private adjustBitrate(): void {
    const stepSize = this.currentBitrate * (this.adaptiveConfig.bitrateStepPercent / 100);
    
    if (this.interferenceDetected || this.rfMetrics.packetLoss > 2) {
      // Decrease bitrate
      const newBitrate = Math.max(
        this.adaptiveConfig.minBitrate,
        this.currentBitrate - stepSize
      );
      
      if (newBitrate !== this.currentBitrate) {
        console.log(`Decreasing bitrate: ${this.currentBitrate} -> ${newBitrate} kbps`);
        this.currentBitrate = newBitrate;
      }
    } else if (this.rfMetrics.packetLoss < 0.5 && this.rfMetrics.snr > 20) {
      // Increase bitrate gradually
      const newBitrate = Math.min(
        this.adaptiveConfig.maxBitrate,
        this.currentBitrate + stepSize
      );
      
      if (newBitrate !== this.currentBitrate) {
        console.log(`Increasing bitrate: ${this.currentBitrate} -> ${newBitrate} kbps`);
        this.currentBitrate = newBitrate;
      }
    }
  }

  /**
   * Update channel quality mapping for potential channel switching
   */
  private updateChannelQuality(): void {
    // Calculate quality score (0-100)
    const signalScore = Math.max(0, Math.min(100, (this.rfMetrics.signalStrength + 100) * 2));
    const snrScore = Math.max(0, Math.min(100, this.rfMetrics.snr * 2));
    const lossScore = Math.max(0, 100 - (this.rfMetrics.packetLoss * 10));
    const utilizationScore = Math.max(0, 100 - this.rfMetrics.channelUtilization);
    
    const overallScore = (signalScore + snrScore + lossScore + utilizationScore) / 4;
    this.channelMap.set(this.currentChannel, overallScore);
  }

  /**
   * Get best available channel
   */
  getBestChannel(): number {
    let bestChannel = this.currentChannel;
    let bestScore = this.channelMap.get(this.currentChannel) || 0;
    
    for (const [channel, score] of this.channelMap) {
      if (score > bestScore + 10) { // 10-point hysteresis
        bestChannel = channel;
        bestScore = score;
      }
    }
    
    return bestChannel;
  }

  /**
   * Switch to different channel if better available
   */
  switchToBestChannel(): boolean {
    const bestChannel = this.getBestChannel();
    if (bestChannel !== this.currentChannel) {
      console.log(`Switching from channel ${this.currentChannel} to ${bestChannel}`);
      this.currentChannel = bestChannel;
      return true;
    }
    return false;
  }

  /**
   * Get average packet loss over recent history
   */
  private getAveragePacketLoss(): number {
    if (this.metricHistory.length === 0) {
      return this.rfMetrics.packetLoss;
    }
    
    const totalLoss = this.metricHistory.reduce((sum, metrics) => sum + metrics.packetLoss, 0);
    return totalLoss / this.metricHistory.length;
  }

  /**
   * Get current transmission state
   */
  getTransmissionState(): {
    bitrate: number;
    audioFallbackActive: boolean;
    interferenceDetected: boolean;
    currentChannel: number;
    qualityScore: number;
  } {
    const qualityScore = this.channelMap.get(this.currentChannel) || 0;
    
    return {
      bitrate: this.currentBitrate,
      audioFallbackActive: this.audioFallbackActive,
      interferenceDetected: this.interferenceDetected,
      currentChannel: this.currentChannel,
      qualityScore
    };
  }

  /**
   * Force audio fallback (manual override)
   */
  forceAudioFallback(enable: boolean): void {
    this.audioFallbackActive = enable;
    if (enable) {
      this.currentBitrate = this.adaptiveConfig.audioFallbackBitrate;
      console.log('Manual audio fallback activated');
    } else {
      this.currentBitrate = 250; // Conservative restart
      console.log('Manual audio fallback deactivated');
    }
  }

  /**
   * Get RF resilience statistics
   */
  getStats(): {
    currentMetrics: RFMetrics;
    adaptiveState: any;
    channelQuality: Record<number, number>;
    averagePacketLoss: number;
    adaptationCount: number;
  } {
    const channelQuality: Record<number, number> = {};
    for (const [channel, quality] of this.channelMap) {
      channelQuality[channel] = quality;
    }

    return {
      currentMetrics: this.rfMetrics,
      adaptiveState: this.getTransmissionState(),
      channelQuality,
      averagePacketLoss: this.getAveragePacketLoss(),
      adaptationCount: 0 // TODO: Track adaptation events
    };
  }
}