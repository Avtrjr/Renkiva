// Core cryptographic type definitions for Mesh TV Network
// Implements hardware-backed security with clean interfaces

export interface HandshakeKeys {
  static_pub: Uint8Array;      // X25519 public key (32 bytes)
  static_priv: string;         // Hardware keystore handle (not raw key)
  eph_pub: Uint8Array;         // Ephemeral public key (32 bytes)  
  eph_priv: Uint8Array;        // Ephemeral private key (32 bytes, memory-only)
}

export interface FragmentHeader {
  streamId: number;            // UInt32 - unique stream identifier
  epoch: number;               // UInt32 - rekey epoch counter
  seqNo: bigint;              // UInt64 - monotonic sequence number
  totalFrags: number;          // UInt16 - total fragments in stream
}

export interface AeadPacket {
  header: FragmentHeader;      // Authenticated header
  payload: Uint8Array;         // Encrypted content
  tag: Uint8Array;            // ChaCha20-Poly1305 auth tag (16 bytes)
}

export interface OriginSignature {
  keyframe_hash: Uint8Array;   // BLAKE2s hash of keyframe (32 bytes)
  sig: Uint8Array;            // Ed25519 signature (64 bytes)
  timestamp: number;           // Unix timestamp for freshness
}

export interface NoiseHandshakeState {
  pattern: 'XX' | 'XK';        // Handshake pattern
  role: 'initiator' | 'responder';
  stage: 'initial' | 'ephemeral_sent' | 'ephemeral_received' | 'static_sent' | 'complete';
  local_keys: HandshakeKeys;
  remote_static_pub?: Uint8Array;
  remote_eph_pub?: Uint8Array;
  transcript: Uint8Array;      // Hash transcript for validation
  cipher_states: {
    send?: CipherState;
    receive?: CipherState;
  };
}

export interface CipherState {
  key: Uint8Array;            // ChaCha20 key (32 bytes)
  nonce: bigint;              // 64-bit counter
  max_nonce: bigint;          // Rekey threshold
}

export interface SecurityConfig {
  rekey_interval_ms: number;
  rekey_data_threshold: number;
  max_handshake_attempts: number;
  sliding_window_size: number;
  token_bucket_capacity: number;
  max_ttl_hops: number;
}

export interface PeerSecurityState {
  peer_id: string;
  verified: boolean;
  last_rekey: number;
  data_transferred: number;
  handshake_state?: NoiseHandshakeState;
  cipher_state?: CipherState;
  replay_window: ReplayWindow;
  rate_limiter: TokenBucket;
}

export interface ReplayWindow {
  highest_seq: bigint;
  window_mask: bigint;        // 64-bit sliding window
  window_size: number;
}

export interface TokenBucket {
  tokens: number;
  capacity: number;
  refill_rate: number;
  last_refill: number;
}

export interface VerificationChallenge {
  qr_data: string;            // Base64 encoded verification data
  sas_words: string[];        // Short authentication strings
  challenge_id: string;
  expires_at: number;
}

export interface AttestationResult {
  platform: 'android' | 'ios';
  strongbox_available: boolean;
  device_integrity: boolean;
  app_integrity: boolean;
  rooted: boolean;
  verdict: string;
}

// Error types for security operations
export enum SecurityError {
  CRYPTO_ERROR = 'CRYPTO_ERROR',
  HANDSHAKE_FAILED = 'HANDSHAKE_FAILED', 
  VERIFICATION_REQUIRED = 'VERIFICATION_REQUIRED',
  REPLAY_DETECTED = 'REPLAY_DETECTED',
  RATE_LIMITED = 'RATE_LIMITED',
  ATTESTATION_FAILED = 'ATTESTATION_FAILED',
  HARDWARE_UNAVAILABLE = 'HARDWARE_UNAVAILABLE',
  KEY_ROTATION_REQUIRED = 'KEY_ROTATION_REQUIRED'
}

export class SecurityException extends Error {
  constructor(
    public code: SecurityError,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SecurityException';
  }
}