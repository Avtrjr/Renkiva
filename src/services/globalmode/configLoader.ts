/**
 * Global Mode Configuration Loader
 * Loads and validates global_mode.yml configuration
 */

import yaml from 'js-yaml';

export interface GlobalModeYmlConfig {
  global_mode: {
    enabled: boolean;
    rendezvous: {
      pinned_key: string;
      endpoint: string;
      log_retention_hours: number;
      max_token_ttl_minutes: number;
    };
    ice: {
      direct_timeout_s: number;
      stun_servers: string[];
      relay_fallback_timeout_s: number;
      ice_gathering_timeout_s: number;
    };
    tunnel: {
      transport: 'quic' | 'webrtc';
      fallback: 'quic' | 'webrtc';
      keepalive_s: number;
      max_packet_size: number;
      congestion_control: string;
      rekey: {
        minutes: number;
        bytes: number;
      };
    };
    bridge: {
      attestation_required: boolean;
      max_concurrent_sessions: number;
      battery_threshold_percent: number;
      data_budget_mb_per_hour: number;
      priority_qos: boolean;
    };
    performance: {
      audio_latency_target_ms: number;
      video_latency_target_ms: number;
      file_transfer_min_speed_kbps: number;
      connection_timeout_s: number;
    };
    dos_protection: {
      rate_limit_packets_per_second: number;
      max_session_duration_hours: number;
      flood_detection_threshold: number;
    };
    safety: {
      enforce_manifests: boolean;
      propagate_bulletins: boolean;
      quarantine_unknown_origins: boolean;
    };
  };
}

class GlobalModeConfigLoader {
  private config?: GlobalModeYmlConfig;
  private configPath: string;

  constructor(configPath: string = '/global_mode.yml') {
    this.configPath = configPath;
  }

  async load(): Promise<GlobalModeYmlConfig> {
    try {
      // In a web environment, we'll load from a bundled config
      const defaultConfig: GlobalModeYmlConfig = {
        global_mode: {
          enabled: true,
          rendezvous: {
            pinned_key: "MCowBQYDK2VwAyEAZGVmYXVsdF9waW5uZWRfa2V5X2Zvcl9kZXZlbG9wbWVudA==",
            endpoint: "wss://rendezvous.meshtv.network:443/signal",
            log_retention_hours: 24,
            max_token_ttl_minutes: 15
          },
          ice: {
            direct_timeout_s: 2,
            stun_servers: [
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
              "stun:stun.meshtv.network:3478"
            ],
            relay_fallback_timeout_s: 3,
            ice_gathering_timeout_s: 5
          },
          tunnel: {
            transport: "quic",
            fallback: "webrtc",
            keepalive_s: 15,
            max_packet_size: 1200,
            congestion_control: "bbr",
            rekey: {
              minutes: 10,
              bytes: 33554432
            }
          },
          bridge: {
            attestation_required: true,
            max_concurrent_sessions: 4,
            battery_threshold_percent: 20,
            data_budget_mb_per_hour: 100,
            priority_qos: true
          },
          performance: {
            audio_latency_target_ms: 150,
            video_latency_target_ms: 250,
            file_transfer_min_speed_kbps: 512,
            connection_timeout_s: 5
          },
          dos_protection: {
            rate_limit_packets_per_second: 100,
            max_session_duration_hours: 4,
            flood_detection_threshold: 50
          },
          safety: {
            enforce_manifests: true,
            propagate_bulletins: true,
            quarantine_unknown_origins: true
          }
        }
      };

      this.config = defaultConfig;
      this.validate();
      
      console.log('✅ Global Mode configuration loaded successfully');
      return this.config;
    } catch (error) {
      console.error('Failed to load Global Mode configuration:', error);
      throw error;
    }
  }

  private validate(): void {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }

    const { global_mode } = this.config;

    // Validate required fields
    if (typeof global_mode.enabled !== 'boolean') {
      throw new Error('global_mode.enabled must be a boolean');
    }

    if (!global_mode.rendezvous.pinned_key) {
      throw new Error('global_mode.rendezvous.pinned_key is required');
    }

    if (!global_mode.rendezvous.endpoint) {
      throw new Error('global_mode.rendezvous.endpoint is required');
    }

    // Validate timeouts
    if (global_mode.ice.direct_timeout_s <= 0) {
      throw new Error('global_mode.ice.direct_timeout_s must be positive');
    }

    if (global_mode.ice.relay_fallback_timeout_s <= 0) {
      throw new Error('global_mode.ice.relay_fallback_timeout_s must be positive');
    }

    // Validate transport options
    const validTransports = ['quic', 'webrtc'];
    if (!validTransports.includes(global_mode.tunnel.transport)) {
      throw new Error(`Invalid transport: ${global_mode.tunnel.transport}`);
    }

    // Validate bridge limits
    if (global_mode.bridge.max_concurrent_sessions <= 0) {
      throw new Error('global_mode.bridge.max_concurrent_sessions must be positive');
    }

    if (global_mode.bridge.battery_threshold_percent < 0 || global_mode.bridge.battery_threshold_percent > 100) {
      throw new Error('global_mode.bridge.battery_threshold_percent must be between 0 and 100');
    }

    // Validate rekey parameters
    if (global_mode.tunnel.rekey.minutes <= 0) {
      throw new Error('global_mode.tunnel.rekey.minutes must be positive');
    }

    if (global_mode.tunnel.rekey.bytes <= 0) {
      throw new Error('global_mode.tunnel.rekey.bytes must be positive');
    }

    // Validate STUN servers
    if (!Array.isArray(global_mode.ice.stun_servers) || global_mode.ice.stun_servers.length === 0) {
      throw new Error('global_mode.ice.stun_servers must be a non-empty array');
    }

    // Validate performance targets
    if (global_mode.performance.audio_latency_target_ms <= 0) {
      throw new Error('Audio latency target must be positive');
    }

    if (global_mode.performance.file_transfer_min_speed_kbps <= 0) {
      throw new Error('File transfer minimum speed must be positive');
    }

    console.log('✅ Global Mode configuration validation passed');
  }

  getConfig(): GlobalModeYmlConfig | undefined {
    return this.config;
  }

  isEnabled(): boolean {
    return this.config?.global_mode.enabled ?? false;
  }

  getRendezvousConfig() {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.global_mode.rendezvous;
  }

  getBridgeConfig() {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.global_mode.bridge;
  }

  getTunnelConfig() {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.global_mode.tunnel;
  }

  getIceConfig() {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.global_mode.ice;
  }

  getPerformanceConfig() {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.global_mode.performance;
  }

  getSafetyConfig() {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.global_mode.safety;
  }

  // Hot reload configuration (for signed updates)
  async reload(): Promise<void> {
    console.log('🔄 Reloading Global Mode configuration...');
    await this.load();
  }

  // Generate configuration template
  static generateTemplate(): string {
    return `# Global Mode Configuration for Mesh TV Network
# Enables worldwide E2E encrypted communication across mesh networks

global_mode:
  enabled: true
  
  # Rendezvous signaling service (minimal, ephemeral tokens only)
  rendezvous:
    pinned_key: "MCowBQYDK2VwAyEA..." # Base64 encoded pinned public key
    endpoint: "wss://rendezvous.meshtv.network:443/signal"
    log_retention_hours: 24
    max_token_ttl_minutes: 15
    
  # ICE/STUN configuration for NAT traversal
  ice:
    direct_timeout_s: 2
    stun_servers: 
      - "stun:stun1.l.google.com:19302"
      - "stun:stun2.l.google.com:19302"
    relay_fallback_timeout_s: 3
    ice_gathering_timeout_s: 5
    
  # Transport layer settings
  tunnel:
    transport: "quic"           # Preferred: QUIC/UDP
    fallback: "webrtc"          # Fallback: WebRTC datachannel
    keepalive_s: 15
    max_packet_size: 1200       # Safe for most MTUs
    congestion_control: "bbr"
    
    # Rekey thresholds for forward secrecy
    rekey:
      minutes: 10
      bytes: 33554432          # 32 MiB
      
  # Bridge operator settings
  bridge:
    attestation_required: true
    max_concurrent_sessions: 4
    battery_threshold_percent: 20
    data_budget_mb_per_hour: 100
    priority_qos: true
    
  # Performance tuning
  performance:
    audio_latency_target_ms: 150
    video_latency_target_ms: 250
    file_transfer_min_speed_kbps: 512
    connection_timeout_s: 5
    
  # DoS protection (inherits from security.yml)
  dos_protection:
    rate_limit_packets_per_second: 100
    max_session_duration_hours: 4
    flood_detection_threshold: 50
    
  # Safety enforcement (same policies as local mesh)
  safety:
    enforce_manifests: true
    propagate_bulletins: true
    quarantine_unknown_origins: true`;
  }
}

// Singleton instance
let configLoader: GlobalModeConfigLoader | undefined;

export const getGlobalModeConfig = async (): Promise<GlobalModeYmlConfig> => {
  if (!configLoader) {
    configLoader = new GlobalModeConfigLoader();
  }
  return await configLoader.load();
};

export const reloadGlobalModeConfig = async (): Promise<void> => {
  if (configLoader) {
    await configLoader.reload();
  }
};

export { GlobalModeConfigLoader };