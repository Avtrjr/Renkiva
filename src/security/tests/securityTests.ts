// Comprehensive security test suite for Mesh TV Network
import { CryptoPrimitives } from '../crypto/primitives';
import { NoiseProtocol } from '../handshake/noiseProtocol';
import { AeadFramer } from '../framing/aeadFramer';
import { VerificationManager } from '../oob/verificationManager';
import { DeviceAttestation } from '../attestation/deviceAttestation';
import { RateLimiter } from '../ratecontrol/tokenBucket';
import { AntiSybilRouter } from '../routing/antiSybilRouter';
import { OriginSigner } from '../signing/originSigner';
import { RotatingBloomFilter } from '../bloom/rotatingBloomFilter';
import { RFResilienceManager } from '../resilience/rfResilienceManager';
import { PrivacyManager } from '../privacy/privacyManager';

export class SecurityTestSuite {
  private crypto = CryptoPrimitives.getInstance();
  private noise = new NoiseProtocol();
  private framer = new AeadFramer();
  private verification = new VerificationManager();
  private attestation = DeviceAttestation.getInstance();

  async runAllTests(): Promise<{ passed: number; failed: number; results: any[] }> {
    const tests = [
      { name: 'Handshake Vector Test', fn: () => this.testHandshakeVectors() },
      { name: 'Fragment Encryption Test', fn: () => this.testFragmentEncryption() },
      { name: 'Replay Protection Test', fn: () => this.testReplayProtection() },
      { name: 'OOB Verification Test', fn: () => this.testOOBVerification() },
      { name: 'Device Attestation Test', fn: () => this.testDeviceAttestation() },
      { name: 'Rate Limiting Test', fn: () => this.testRateLimiting() },
      { name: 'Anti-Sybil Routing Test', fn: () => this.testAntiSybilRouting() },
      { name: 'Origin Signing Test', fn: () => this.testOriginSigning() },
      { name: 'Bloom Filters Test', fn: () => this.testBloomFilters() },
      { name: 'RF Resilience Test', fn: () => this.testRFResilience() },
      { name: 'Privacy Protection Test', fn: () => this.testPrivacyProtection() },
      { name: 'Constant Time Operations', fn: () => this.testConstantTimeOps() }
    ];

    const results = [];
    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        await test.fn();
        results.push({ name: test.name, status: 'PASSED' });
        passed++;
      } catch (error) {
        results.push({ name: test.name, status: 'FAILED', error: error.message });
        failed++;
      }
    }

    return { passed, failed, results };
  }

  private async testHandshakeVectors(): Promise<void> {
    // Test Noise XX handshake completion
    const peerId = 'test-peer';
    
    // Initiate handshake
    const message1 = await this.noise.initiateHandshake(peerId);
    if (message1.length !== 32) {
      throw new Error('Invalid message 1 length');
    }

    // Process handshake messages
    const result2 = await this.noise.processHandshakeMessage(peerId, message1);
    if (!result2.response || result2.complete) {
      throw new Error('Invalid handshake state after message 1');
    }

    console.log('✓ Handshake vector test passed');
  }

  private async testFragmentEncryption(): Promise<void> {
    // Test AEAD fragment encryption/decryption
    const sessionKey = this.crypto.randomBytes(32);
    const payload = new TextEncoder().encode('Test fragment data');
    
    const packet = await this.framer.encryptFragment(
      1, // streamId
      1, // epoch
      1n, // seqNo
      1, // totalFrags
      payload,
      sessionKey
    );

    const result = await this.framer.decryptFragment(packet, sessionKey, 'test-peer');
    
    if (!this.crypto.constantTimeEqual(result.payload, payload)) {
      throw new Error('Fragment decryption failed');
    }

    console.log('✓ Fragment encryption test passed');
  }

  private async testReplayProtection(): Promise<void> {
    // Test replay attack prevention
    const sessionKey = this.crypto.randomBytes(32);
    const payload = new TextEncoder().encode('Test data');
    
    const packet = await this.framer.encryptFragment(1, 1, 1n, 1, payload, sessionKey);
    
    // First decryption should succeed
    await this.framer.decryptFragment(packet, sessionKey, 'test-peer');
    
    // Second decryption should fail (replay)
    try {
      await this.framer.decryptFragment(packet, sessionKey, 'test-peer');
      throw new Error('Replay protection failed - duplicate packet accepted');
    } catch (error) {
      if (!error.message.includes('Replay detected')) {
        throw error;
      }
    }

    console.log('✓ Replay protection test passed');
  }

  private async testOOBVerification(): Promise<void> {
    // Test out-of-band verification flow
    const localKey = this.crypto.randomBytes(32);
    const remoteKey = this.crypto.randomBytes(32);
    
    const challenge = await this.verification.initiateVerification(
      'test-peer',
      localKey,
      remoteKey
    );
    
    if (!challenge.qr_data || challenge.sas_words.length !== 3) {
      throw new Error('Invalid verification challenge');
    }

    // Test QR verification
    const qrValid = await this.verification.verifyQRCode('test-peer', challenge.qr_data);
    if (!qrValid) {
      throw new Error('QR verification failed');
    }

    console.log('✓ OOB verification test passed');
  }

  private async testDeviceAttestation(): Promise<void> {
    // Test device security validation
    const attestation = await this.attestation.attestDevice();
    
    if (!attestation.platform || typeof attestation.device_integrity !== 'boolean') {
      throw new Error('Invalid attestation result');
    }

    console.log('✓ Device attestation test passed');
  }

  private async testConstantTimeOps(): Promise<void> {
    // Test constant-time comparison
    const data1 = this.crypto.randomBytes(32);
    const data2 = new Uint8Array(data1);
    const data3 = this.crypto.randomBytes(32);

    // Same data should be equal
    if (!this.crypto.constantTimeEqual(data1, data2)) {
      throw new Error('Constant time equal failed for identical data');
    }

    // Different data should not be equal
    if (this.crypto.constantTimeEqual(data1, data3)) {
      throw new Error('Constant time equal failed for different data');
    }

    console.log('✓ Constant time operations test passed');
  }

  private async testRateLimiting(): Promise<void> {
    const rateLimiter = new RateLimiter(10, 2); // 10 tokens, 2/sec refill
    
    // Test normal operation
    if (!rateLimiter.checkRateLimit('peer1', 5)) {
      throw new Error('Rate limit should allow initial request');
    }
    
    // Test rate limit enforcement
    if (rateLimiter.checkRateLimit('peer1', 10)) {
      throw new Error('Rate limit should block oversized request');
    }
    
    // Test auth failure backoff
    rateLimiter.recordAuthFailure('peer2');
    rateLimiter.recordAuthFailure('peer2');
    
    if (rateLimiter.checkRateLimit('peer2', 1)) {
      throw new Error('Should be in backoff period');
    }
    
    console.log('✓ Rate limiting test passed');
  }

  private async testAntiSybilRouting(): Promise<void> {
    const router = new AntiSybilRouter();
    
    // Test normal peer
    router.updatePeerLink('peer1', -50, 20, 1, true);
    
    // Test potential wormhole (low latency, high hop count)
    router.updatePeerLink('peer2', -60, 5, 5, true);
    
    const path = router.getBestPath('destination');
    if (path.includes('peer2')) {
      throw new Error('Wormhole peer should not be in best path');
    }
    
    // Test identity creation rate limit
    if (!router.checkIdentityCreationRate('device1')) {
      throw new Error('First identity creation should be allowed');
    }
    
    console.log('✓ Anti-Sybil routing test passed');
  }

  private async testOriginSigning(): Promise<void> {
    const signer = new OriginSigner();
    const keys = await signer.generateBroadcasterKeys('broadcaster1');
    
    const frameData = new TextEncoder().encode('Test keyframe data');
    const signature = await signer.signKeyframe('broadcaster1', frameData, 1);
    
    const verification = await signer.verifyOriginSignature(
      frameData,
      signature,
      keys.publicKey,
      1
    );
    
    if (!verification.valid || !verification.trusted) {
      throw new Error('Origin signature verification failed');
    }
    
    console.log('✓ Origin signing test passed');
  }

  private async testBloomFilters(): Promise<void> {
    const filter = new RotatingBloomFilter(1000, 0.01, 100); // 1sec rotation for testing
    
    const testData = new Uint8Array([1, 2, 3, 4]);
    
    // Test add/contains
    filter.add(testData);
    if (!filter.contains(testData)) {
      throw new Error('Filter should contain added item');
    }
    
    // Test false positive rate
    const stats = filter.getStats();
    if (stats.estimatedFalsePositiveRate > 0.02) {
      throw new Error('False positive rate too high');
    }
    
    console.log('✓ Bloom filter test passed');
  }

  private async testRFResilience(): Promise<void> {
    const rfManager = new RFResilienceManager();
    
    // Test good conditions
    rfManager.updateMetrics({
      signalStrength: -50,
      snr: 25,
      packetLoss: 0.5
    });
    
    let state = rfManager.getTransmissionState();
    if (state.audioFallbackActive) {
      throw new Error('Should not be in audio fallback with good conditions');
    }
    
    // Test poor conditions
    rfManager.updateMetrics({
      signalStrength: -85,
      snr: 5,
      packetLoss: 8
    });
    
    state = rfManager.getTransmissionState();
    if (!state.audioFallbackActive) {
      throw new Error('Should activate audio fallback with poor conditions');
    }
    
    console.log('✓ RF resilience test passed');
  }

  private async testPrivacyProtection(): Promise<void> {
    const privacy = new PrivacyManager();
    
    // Test opt-in requirement
    const recorded = privacy.recordMetric('usage', { action: 'test' });
    if (recorded) {
      throw new Error('Should not record without opt-in');
    }
    
    // Test with opt-in
    privacy.setOptInStatus('usage', true);
    const recordedWithOptIn = privacy.recordMetric('usage', { action: 'test' });
    if (!recordedWithOptIn) {
      throw new Error('Should record with opt-in');
    }
    
    // Test data sanitization
    const exported = privacy.exportMetrics(['usage']);
    if (!exported || exported.metrics.length === 0) {
      throw new Error('Should export metrics when opted in');
    }
    
    console.log('✓ Privacy protection test passed');
  }
}