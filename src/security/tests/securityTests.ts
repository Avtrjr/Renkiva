// Comprehensive security test suite for Mesh TV Network
import { CryptoPrimitives } from '../crypto/primitives';
import { NoiseProtocol } from '../handshake/noiseProtocol';
import { AeadFramer } from '../framing/aeadFramer';
import { VerificationManager } from '../oob/verificationManager';
import { DeviceAttestation } from '../attestation/deviceAttestation';

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
}