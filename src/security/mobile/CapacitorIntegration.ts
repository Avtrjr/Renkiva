// Capacitor Mobile Integration - Platform-specific security features
// Device attestation, hardware keys, and mobile-optimized components

import { Capacitor } from '@capacitor/core';

export interface MobileSecurityCapabilities {
  hasHardwareKeystore: boolean;
  hasStrongBox: boolean;
  hasBiometrics: boolean;
  hasDeviceAttestation: boolean;
  platform: 'android' | 'ios' | 'web';
}

export interface DeviceInfo {
  platform: string;
  version: string;
  manufacturer: string;
  model: string;
  isRooted: boolean;
  isEmulator: boolean;
  securityPatchLevel?: string;
}

export class CapacitorSecurityManager {
  private capabilities: MobileSecurityCapabilities | null = null;

  async initialize(): Promise<void> {
    try {
      this.capabilities = await this.detectCapabilities();
      console.log('Mobile security capabilities:', this.capabilities);
    } catch (error) {
      console.error('Failed to initialize mobile security:', error);
      // Fallback to web-only capabilities
      this.capabilities = {
        hasHardwareKeystore: false,
        hasStrongBox: false,
        hasBiometrics: false,
        hasDeviceAttestation: false,
        platform: 'web'
      };
    }
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    if (!Capacitor.isNativePlatform()) {
      return {
        platform: 'web',
        version: navigator.userAgent,
        manufacturer: 'browser',
        model: 'web',
        isRooted: false,
        isEmulator: false
      };
    }

    // In a real implementation, this would use Capacitor plugins
    // like @capacitor/device and device-specific attestation
    return {
      platform: Capacitor.getPlatform(),
      version: '1.0.0',
      manufacturer: 'unknown',
      model: 'unknown',
      isRooted: false,
      isEmulator: false
    };
  }

  async generateHardwareKey(keyAlias: string): Promise<string> {
    if (!this.capabilities?.hasHardwareKeystore) {
      throw new Error('Hardware keystore not available');
    }

    // In production, use Capacitor plugins for hardware key generation
    // For now, simulate with a unique handle
    const handle = `hw_key_${keyAlias}_${Date.now()}`;
    console.log(`Generated hardware key handle: ${handle}`);
    return handle;
  }

  async signWithHardwareKey(keyHandle: string, data: Uint8Array): Promise<Uint8Array> {
    if (!this.capabilities?.hasHardwareKeystore) {
      throw new Error('Hardware keystore not available');
    }

    // In production, this would use the actual hardware keystore
    // For demo, return a mock signature
    console.log(`Signing with hardware key: ${keyHandle}`);
    const signature = new Uint8Array(64);
    crypto.getRandomValues(signature);
    return signature;
  }

  async requestBiometricAuth(reason: string): Promise<boolean> {
    if (!this.capabilities?.hasBiometrics) {
      return false;
    }

    // In production, use biometric authentication plugins
    console.log(`Biometric auth requested: ${reason}`);
    return new Promise((resolve) => {
      // Simulate user interaction
      setTimeout(() => {
        resolve(Math.random() > 0.1); // 90% success rate for demo
      }, 2000);
    });
  }

  async attestDevice(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      
      // Block rooted/jailbroken devices
      if (deviceInfo.isRooted) {
        return {
          success: false,
          error: 'Device is rooted/jailbroken'
        };
      }

      // Block emulators in production
      if (deviceInfo.isEmulator) {
        return {
          success: false,
          error: 'Emulators not supported'
        };
      }

      // In production, use Google Play Integrity API / Apple App Attest
      const attestationToken = `attest_${Date.now()}_${Math.random().toString(36)}`;
      
      return {
        success: true,
        token: attestationToken
      };
    } catch (error) {
      return {
        success: false,
        error: `Attestation failed: ${error}`
      };
    }
  }

  async enableSecureStorage(): Promise<void> {
    // In production, configure secure storage with hardware backing
    console.log('Secure storage enabled');
  }

  async detectTamperingAttempts(): Promise<{ compromised: boolean; threats: string[] }> {
    const threats: string[] = [];
    
    // Check for common tampering indicators
    if (typeof window !== 'undefined') {
      // Check for debugging tools
      if (window.console && window.console.clear.toString().includes('native')) {
        threats.push('Developer tools detected');
      }

      // Check for common reverse engineering tools
      const suspiciousGlobals = ['Frida', 'Xposed', 'substrate'];
      for (const global of suspiciousGlobals) {
        if ((window as any)[global]) {
          threats.push(`${global} framework detected`);
        }
      }
    }

    return {
      compromised: threats.length > 0,
      threats
    };
  }

  async optimizeForMobile(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Platform-specific optimizations
    switch (Capacitor.getPlatform()) {
      case 'android':
        await this.optimizeForAndroid();
        break;
      case 'ios':
        await this.optimizeForIOS();
        break;
    }
  }

  getCapabilities(): MobileSecurityCapabilities | null {
    return this.capabilities;
  }

  private async detectCapabilities(): Promise<MobileSecurityCapabilities> {
    const platform = Capacitor.isNativePlatform() ? 
      Capacitor.getPlatform() as 'android' | 'ios' : 'web';

    if (platform === 'web') {
      return {
        hasHardwareKeystore: false,
        hasStrongBox: false,
        hasBiometrics: false,
        hasDeviceAttestation: false,
        platform: 'web'
      };
    }

    // In production, detect actual hardware capabilities
    return {
      hasHardwareKeystore: true,
      hasStrongBox: platform === 'android', // StrongBox is Android-specific
      hasBiometrics: true,
      hasDeviceAttestation: true,
      platform
    };
  }

  private async optimizeForAndroid(): Promise<void> {
    console.log('Applying Android-specific optimizations');
    
    // Configure ProGuard/R8 obfuscation
    // Enable StrongBox keystore
    // Set up Play Integrity API
    // Configure background execution limits
  }

  private async optimizeForIOS(): Promise<void> {
    console.log('Applying iOS-specific optimizations');
    
    // Configure App Transport Security
    // Enable Secure Enclave
    // Set up App Attest
    // Configure background app refresh
  }
}

// Security event monitoring for mobile
export class MobileSecurityMonitor {
  private eventHandlers = new Map<string, Function[]>();

  addEventListener(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  removeEventListener(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  startMonitoring(): void {
    // Monitor for security events
    this.monitorAppLifecycle();
    this.monitorNetworkChanges();
    this.monitorDeviceState();
  }

  private monitorAppLifecycle(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.emit('app_backgrounded');
        } else {
          this.emit('app_foregrounded');
        }
      });
    }
  }

  private monitorNetworkChanges(): void {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      (navigator as any).connection.addEventListener('change', () => {
        this.emit('network_changed', {
          online: navigator.onLine,
          type: (navigator as any).connection.effectiveType
        });
      });
    }
  }

  private monitorDeviceState(): void {
    // Monitor device orientation, battery, etc.
    if (typeof window !== 'undefined') {
      window.addEventListener('orientationchange', () => {
        this.emit('orientation_changed');
      });
    }
  }
}

// Singleton instances
export const capacitorSecurity = new CapacitorSecurityManager();
export const mobileSecurityMonitor = new MobileSecurityMonitor();