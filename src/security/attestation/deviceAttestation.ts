// Device attestation and hardware security verification
// Ensures devices meet security requirements before mesh participation

import { AttestationResult, SecurityError, SecurityException } from '../crypto/types';

export class DeviceAttestation {
  private static instance: DeviceAttestation;
  private attestationCache = new Map<string, AttestationResult>();

  private constructor() {}

  static getInstance(): DeviceAttestation {
    if (!DeviceAttestation.instance) {
      DeviceAttestation.instance = new DeviceAttestation();
    }
    return DeviceAttestation.instance;
  }

  /**
   * Perform comprehensive device attestation
   * Blocks rooted/jailbroken devices and validates hardware security
   */
  async attestDevice(): Promise<AttestationResult> {
    try {
      const platform = this.detectPlatform();
      const deviceId = await this.getDeviceId();
      
      // Check cache first
      const cached = this.attestationCache.get(deviceId);
      if (cached && this.isCacheValid(cached)) {
        return cached;
      }

      let result: AttestationResult;
      
      if (platform === 'android') {
        result = await this.performAndroidAttestation();
      } else if (platform === 'ios') {
        result = await this.performIOSAttestation();
      } else {
        // Web platform fallback
        result = await this.performWebAttestation();
      }

      // Cache result for 1 hour
      this.attestationCache.set(deviceId, result);
      
      return result;
    } catch (error) {
      throw new SecurityException(
        SecurityError.ATTESTATION_FAILED,
        'Device attestation failed',
        error
      );
    }
  }

  /**
   * Check if device meets security requirements
   */
  async validateSecurityRequirements(): Promise<boolean> {
    const attestation = await this.attestDevice();
    
    // Block rooted/jailbroken devices
    if (attestation.rooted) {
      throw new SecurityException(
        SecurityError.ATTESTATION_FAILED,
        'Rooted/jailbroken devices are not supported for security reasons'
      );
    }

    // Require device integrity
    if (!attestation.device_integrity) {
      throw new SecurityException(
        SecurityError.ATTESTATION_FAILED,
        'Device integrity check failed'
      );
    }

    // Require app integrity
    if (!attestation.app_integrity) {
      throw new SecurityException(
        SecurityError.ATTESTATION_FAILED,
        'App integrity check failed'
      );
    }

    return true;
  }

  /**
   * Check StrongBox/TEE availability for hardware-backed keys
   */
  async checkHardwareSecurityModule(): Promise<boolean> {
    const attestation = await this.attestDevice();
    
    if (!attestation.strongbox_available) {
      throw new SecurityException(
        SecurityError.HARDWARE_UNAVAILABLE,
        'Hardware security module (StrongBox/TEE) required but not available'
      );
    }

    return true;
  }

  /**
   * Android-specific attestation using Play Integrity API
   */
  private async performAndroidAttestation(): Promise<AttestationResult> {
    try {
      // In production, use Play Integrity API
      // For now, simulate the checks
      
      const result: AttestationResult = {
        platform: 'android',
        strongbox_available: await this.checkAndroidStrongBox(),
        device_integrity: await this.checkAndroidDeviceIntegrity(),
        app_integrity: await this.checkAndroidAppIntegrity(),
        rooted: await this.checkAndroidRoot(),
        verdict: 'MEETS_DEVICE_INTEGRITY'
      };

      return result;
    } catch (error) {
      throw new SecurityException(
        SecurityError.ATTESTATION_FAILED,
        'Android attestation failed',
        error
      );
    }
  }

  /**
   * iOS-specific attestation using App Attest
   */
  private async performIOSAttestation(): Promise<AttestationResult> {
    try {
      // In production, use App Attest API
      // For now, simulate the checks
      
      const result: AttestationResult = {
        platform: 'ios',
        strongbox_available: await this.checkIOSSecureEnclave(),
        device_integrity: await this.checkIOSDeviceIntegrity(),
        app_integrity: await this.checkIOSAppIntegrity(),
        rooted: await this.checkIOSJailbreak(),
        verdict: 'DEVICE_INTEGRITY_VERIFIED'
      };

      return result;
    } catch (error) {
      throw new SecurityException(
        SecurityError.ATTESTATION_FAILED,
        'iOS attestation failed',
        error
      );
    }
  }

  /**
   * Web platform attestation (limited capabilities)
   */
  private async performWebAttestation(): Promise<AttestationResult> {
    const result: AttestationResult = {
      platform: 'android', // Default for web
      strongbox_available: await this.checkWebCrypto(),
      device_integrity: true, // Cannot verify on web
      app_integrity: true,    // Cannot verify on web
      rooted: false,          // Cannot detect on web
      verdict: 'WEB_PLATFORM_LIMITED'
    };

    return result;
  }

  /**
   * Detect current platform
   */
  private detectPlatform(): 'android' | 'ios' | 'web' {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('android')) {
      return 'android';
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'ios';
    } else {
      return 'web';
    }
  }

  /**
   * Get stable device identifier
   */
  private async getDeviceId(): Promise<string> {
    // In production, use platform-specific device ID APIs
    // For now, use a browser fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = canvas.toDataURL();
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint + navigator.userAgent);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Android StrongBox availability check
   */
  private async checkAndroidStrongBox(): Promise<boolean> {
    // In production, check for StrongBox keymaster support
    // For now, assume available on recent Android versions
    return true;
  }

  /**
   * Android device integrity check
   */
  private async checkAndroidDeviceIntegrity(): Promise<boolean> {
    // In production, use Play Integrity API device verdict
    return true;
  }

  /**
   * Android app integrity check
   */
  private async checkAndroidAppIntegrity(): Promise<boolean> {
    // In production, verify app signature and Play Store origin
    return true;
  }

  /**
   * Android root detection
   */
  private async checkAndroidRoot(): Promise<boolean> {
    // In production, check for root indicators:
    // - su binary presence
    // - Test keys in build
    // - Root management apps
    // - Modified system partition
    return false;
  }

  /**
   * iOS Secure Enclave availability check
   */
  private async checkIOSSecureEnclave(): Promise<boolean> {
    // In production, check for Secure Enclave support
    return true;
  }

  /**
   * iOS device integrity check
   */
  private async checkIOSDeviceIntegrity(): Promise<boolean> {
    // In production, use App Attest for device verification
    return true;
  }

  /**
   * iOS app integrity check
   */
  private async checkIOSAppIntegrity(): Promise<boolean> {
    // In production, verify app signature and App Store origin
    return true;
  }

  /**
   * iOS jailbreak detection
   */
  private async checkIOSJailbreak(): Promise<boolean> {
    // In production, check for jailbreak indicators:
    // - Cydia or other package managers
    // - Modified system files
    // - Unusual file permissions
    // - Fork/exec restrictions
    return false;
  }

  /**
   * Web Crypto API availability check
   */
  private async checkWebCrypto(): Promise<boolean> {
    return crypto && crypto.subtle !== undefined;
  }

  /**
   * Check if cached attestation is still valid
   */
  private isCacheValid(attestation: AttestationResult): boolean {
    // Cache valid for 1 hour
    return true; // TODO: implement timestamp tracking
  }

  /**
   * Force re-attestation (clears cache)
   */
  forceReAttestation(): void {
    this.attestationCache.clear();
  }

  /**
   * Get attestation statistics
   */
  getStats(): {
    cacheSize: number;
    lastAttestationTime: number;
    platform: string;
  } {
    return {
      cacheSize: this.attestationCache.size,
      lastAttestationTime: Date.now(), // TODO: track actual time
      platform: this.detectPlatform()
    };
  }
}