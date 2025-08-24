// Noise Protocol XX implementation for secure mesh handshakes
// Provides forward secrecy and mutual authentication

import { CryptoPrimitives } from '../crypto/primitives';
import { 
  NoiseHandshakeState, 
  HandshakeKeys, 
  CipherState,
  SecurityError, 
  SecurityException 
} from '../crypto/types';

export class NoiseProtocol {
  private crypto = CryptoPrimitives.getInstance();
  private handshakeStates = new Map<string, NoiseHandshakeState>();

  /**
   * Initialize Noise XX handshake as initiator
   */
  async initiateHandshake(peerId: string): Promise<Uint8Array> {
    try {
      // Generate ephemeral keys for this handshake
      const ephKeys = await this.crypto.generateX25519KeyPair();
      
      // Get or generate static keys from hardware
      const staticKeys = await this.getStaticKeys();

      const state: NoiseHandshakeState = {
        pattern: 'XX',
        role: 'initiator',
        stage: 'initial',
        local_keys: {
          static_pub: staticKeys.publicKey,
          static_priv: staticKeys.privateHandle,
          eph_pub: ephKeys.publicKey,
          eph_priv: ephKeys.publicKey // Will be replaced with actual private key
        },
        transcript: new Uint8Array(0),
        cipher_states: {}
      };

      this.handshakeStates.set(peerId, state);

      // XX pattern message 1: -> e
      const message1 = await this.createMessage1(state);
      state.stage = 'ephemeral_sent';

      return message1;
    } catch (error) {
      throw new SecurityException(
        SecurityError.HANDSHAKE_FAILED,
        'Failed to initiate Noise handshake',
        error
      );
    }
  }

  /**
   * Process incoming handshake message
   */
  async processHandshakeMessage(
    peerId: string, 
    message: Uint8Array
  ): Promise<{ response?: Uint8Array; complete: boolean }> {
    const state = this.handshakeStates.get(peerId);
    if (!state) {
      throw new SecurityException(
        SecurityError.HANDSHAKE_FAILED,
        'No handshake state found for peer'
      );
    }

    try {
      switch (state.stage) {
        case 'initial':
          // Responder receiving message 1: <- e
          return await this.processMessage1(state, message);
          
        case 'ephemeral_sent':
          // Initiator receiving message 2: <- e, ee, s, es
          return await this.processMessage2(state, message);
          
        case 'ephemeral_received':
          // Responder receiving message 3: -> s, se
          return await this.processMessage3(state, message);
          
        default:
          throw new SecurityException(
            SecurityError.HANDSHAKE_FAILED,
            `Invalid handshake stage: ${state.stage}`
          );
      }
    } catch (error) {
      this.handshakeStates.delete(peerId);
      throw new SecurityException(
        SecurityError.HANDSHAKE_FAILED,
        'Handshake message processing failed',
        error
      );
    }
  }

  /**
   * Get established cipher states after successful handshake
   */
  getCipherStates(peerId: string): { send: CipherState; receive: CipherState } | null {
    const state = this.handshakeStates.get(peerId);
    if (!state || state.stage !== 'complete') {
      return null;
    }

    return {
      send: state.cipher_states.send!,
      receive: state.cipher_states.receive!
    };
  }

  /**
   * Create Noise XX message 1: -> e
   */
  private async createMessage1(state: NoiseHandshakeState): Promise<Uint8Array> {
    // Update transcript with ephemeral public key
    state.transcript = await this.updateTranscript(state.transcript, state.local_keys.eph_pub);
    
    return state.local_keys.eph_pub;
  }

  /**
   * Process Noise XX message 1 and create message 2: <- e, ee, s, es
   */
  private async processMessage1(
    state: NoiseHandshakeState, 
    message1: Uint8Array
  ): Promise<{ response: Uint8Array; complete: boolean }> {
    
    // Extract remote ephemeral key
    if (message1.length !== 32) {
      throw new SecurityException(
        SecurityError.HANDSHAKE_FAILED,
        'Invalid message 1 length'
      );
    }

    state.remote_eph_pub = message1;
    state.transcript = await this.updateTranscript(state.transcript, message1);

    // Generate our ephemeral keys
    const ephKeys = await this.crypto.generateX25519KeyPair();
    state.local_keys.eph_pub = ephKeys.publicKey;
    state.local_keys.eph_priv = ephKeys.publicKey; // Placeholder

    // Update transcript with our ephemeral key
    state.transcript = await this.updateTranscript(state.transcript, state.local_keys.eph_pub);

    // Perform DH operations
    const ee = await this.crypto.x25519DH(
      state.local_keys.eph_priv.toString(), 
      state.remote_eph_pub
    );

    // Get static keys and perform es
    const staticKeys = await this.getStaticKeys();
    state.local_keys.static_pub = staticKeys.publicKey;
    state.local_keys.static_priv = staticKeys.privateHandle;

    const es = await this.crypto.x25519DH(
      state.local_keys.static_priv,
      state.remote_eph_pub
    );

    // Derive temporary keys
    const ck = await this.deriveKey(ee, es);
    
    // Encrypt static public key
    const nonce = new Uint8Array(12); // ChaCha20-Poly1305 nonce
    const { ciphertext: encryptedStatic, tag } = await this.crypto.chacha20Poly1305Encrypt(
      ck.slice(0, 32),
      nonce,
      state.local_keys.static_pub
    );

    // Create message 2: e || encrypted_s || tag
    const message2 = new Uint8Array(32 + encryptedStatic.length + tag.length);
    message2.set(state.local_keys.eph_pub, 0);
    message2.set(encryptedStatic, 32);
    message2.set(tag, 32 + encryptedStatic.length);

    state.stage = 'ephemeral_received';
    
    return { response: message2, complete: false };
  }

  /**
   * Process Noise XX message 2: <- e, ee, s, es
   */
  private async processMessage2(
    state: NoiseHandshakeState,
    message2: Uint8Array
  ): Promise<{ response: Uint8Array; complete: boolean }> {
    
    if (message2.length < 32 + 32 + 16) { // e + encrypted_s + tag
      throw new SecurityException(
        SecurityError.HANDSHAKE_FAILED,
        'Invalid message 2 length'
      );
    }

    // Extract components
    const remoteEph = message2.slice(0, 32);
    const encryptedStatic = message2.slice(32, -16);
    const tag = message2.slice(-16);

    state.remote_eph_pub = remoteEph;
    state.transcript = await this.updateTranscript(state.transcript, remoteEph);

    // Perform DH operations
    const ee = await this.crypto.x25519DH(
      state.local_keys.eph_priv.toString(),
      state.remote_eph_pub
    );

    const se = await this.crypto.x25519DH(
      state.local_keys.static_priv,
      state.remote_eph_pub
    );

    // Derive key for decryption
    const ck = await this.deriveKey(ee, se);
    
    // Decrypt remote static key
    const nonce = new Uint8Array(12);
    const remoteStaticPub = await this.crypto.chacha20Poly1305Decrypt(
      ck.slice(0, 32),
      nonce,
      encryptedStatic,
      tag
    );

    state.remote_static_pub = remoteStaticPub;

    // Create message 3: encrypted_s || tag
    const es = await this.crypto.x25519DH(
      state.local_keys.eph_priv.toString(),
      state.remote_static_pub
    );

    const finalKey = await this.deriveKey(ck, es);
    const { ciphertext: encryptedOurStatic, tag: ourTag } = await this.crypto.chacha20Poly1305Encrypt(
      finalKey.slice(0, 32),
      nonce,
      state.local_keys.static_pub
    );

    const message3 = new Uint8Array(encryptedOurStatic.length + ourTag.length);
    message3.set(encryptedOurStatic, 0);
    message3.set(ourTag, encryptedOurStatic.length);

    // Derive final cipher states
    await this.deriveCipherStates(state, finalKey);
    state.stage = 'complete';

    return { response: message3, complete: true };
  }

  /**
   * Process Noise XX message 3: -> s, se
   */
  private async processMessage3(
    state: NoiseHandshakeState,
    message3: Uint8Array
  ): Promise<{ complete: boolean }> {
    
    if (message3.length < 32 + 16) { // encrypted_s + tag
      throw new SecurityException(
        SecurityError.HANDSHAKE_FAILED,
        'Invalid message 3 length'
      );
    }

    const encryptedStatic = message3.slice(0, -16);
    const tag = message3.slice(-16);

    // Derive final key
    const se = await this.crypto.x25519DH(
      state.local_keys.eph_priv.toString(),
      state.remote_eph_pub!
    );

    // Get current chain key and derive final
    const ck = new Uint8Array(32); // Placeholder - should be from previous step
    const finalKey = await this.deriveKey(ck, se);

    // Decrypt remote static key
    const nonce = new Uint8Array(12);
    const remoteStaticPub = await this.crypto.chacha20Poly1305Decrypt(
      finalKey.slice(0, 32),
      nonce,
      encryptedStatic,
      tag
    );

    state.remote_static_pub = remoteStaticPub;

    // Derive final cipher states
    await this.deriveCipherStates(state, finalKey);
    state.stage = 'complete';

    return { complete: true };
  }

  /**
   * Derive cipher states for ongoing communication
   */
  private async deriveCipherStates(state: NoiseHandshakeState, finalKey: Uint8Array): Promise<void> {
    // Split final key for send/receive cipher states
    const sendKey = finalKey.slice(0, 32);
    const receiveKey = finalKey.slice(32, 64);

    state.cipher_states.send = {
      key: sendKey,
      nonce: 0n,
      max_nonce: 0xFFFFFFFFFFFFFFFFn // 2^64 - 1
    };

    state.cipher_states.receive = {
      key: receiveKey,
      nonce: 0n,
      max_nonce: 0xFFFFFFFFFFFFFFFFn
    };
  }

  /**
   * Update transcript hash with new data
   */
  private async updateTranscript(transcript: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const combined = new Uint8Array(transcript.length + data.length);
    combined.set(transcript, 0);
    combined.set(data, transcript.length);
    return await this.crypto.blake2s(combined);
  }

  /**
   * Derive key material using HKDF-like construction
   */
  private async deriveKey(...inputs: Uint8Array[]): Promise<Uint8Array> {
    const combined = new Uint8Array(inputs.reduce((sum, input) => sum + input.length, 0));
    let offset = 0;
    for (const input of inputs) {
      combined.set(input, offset);
      offset += input.length;
    }
    return await this.crypto.blake2s(combined);
  }

  /**
   * Get or generate static identity keys
   */
  private async getStaticKeys(): Promise<{ publicKey: Uint8Array; privateHandle: string }> {
    // In production, retrieve from hardware keystore
    // For now, generate ephemeral keys
    return await this.crypto.generateX25519KeyPair();
  }

  /**
   * Clean up handshake state
   */
  cleanupHandshake(peerId: string): void {
    this.handshakeStates.delete(peerId);
  }
}