# Mesh TV Network - Security Architecture

## Overview

This implementation provides a security-hardened mesh network for video streaming with the following key protections:

- **Out-of-Band Identity Verification**: QR + SAS verification before any communication
- **Noise Protocol Handshake**: X25519 + ChaCha20-Poly1305 + BLAKE2s with automatic rekeying
- **Per-Fragment AEAD**: Each fragment encrypted with sequence-based nonce
- **Anti-Replay Protection**: Sliding window with duplicate detection
- **Origin Signing**: Ed25519 signatures on keyframes for broadcast verification
- **Hardware-Backed Security**: TEE/StrongBox key storage with device attestation

## Security Model

### Trust Assumptions
1. Hardware security module (StrongBox/TEE) is trusted
2. Device attestation service is trusted
3. Physical access to devices during OOB verification

### Threat Model
- **Network Attackers**: Cannot decrypt traffic, inject false data, or replay packets
- **Compromised Peers**: Cannot impersonate verified identities or access group content
- **Device Compromise**: Long-term keys protected by hardware; session keys forward-secure
- **Traffic Analysis**: Padded packets and rotating pseudonyms limit metadata leakage

## Module Architecture

```
src/security/
├── crypto/           # Core cryptographic primitives
├── handshake/        # Noise protocol implementation  
├── mesh/             # P2P mesh networking
├── routing/          # Secure routing with anti-Sybil
├── framing/          # Fragment AEAD and reassembly
├── ratecontrol/      # Flood protection and QoS
├── oob/              # Out-of-band verification
├── attestation/      # Device and hardware attestation
├── ui/               # Security UX components
└── tests/            # Security test suite
```

## Quick Start

### Development Setup
```bash
npm install
npx cap init
npx cap add android
npm run build
npx cap sync
```

### Running Tests
```bash
npm run test:security
npm run test:fuzz
npm run test:conformance
```

### Demo Flow
1. **Join Group**: Scan QR code or enter invite
2. **OOB Verification**: Exchange SAS codes and verify visually
3. **Stream**: Send/receive with origin verification indicators

## Security Controls

### Mandatory Verification (R1-R3)
- Non-skippable QR + SAS verification
- Two-sided confirmation required
- Re-verification on key changes

### Cryptographic Rekeying (R4-R5)  
- Rekey every 10 minutes OR 32 MiB
- Ephemeral session keys
- Perfect forward secrecy

### Fragment Protection (R8-R9)
- Headers: {stream_id, epoch, seq_no, total_frags}
- Nonce: nonce_prefix || seq_no
- Sliding window ≤128 with timeout

### Broadcast Security (R12-R13)
- Ed25519 signatures on keyframes (≥1/sec)
- Pubkey via OOB or pinned directory
- TOFU warnings for unknown sources

## Configuration

Security parameters are defined in `security.yml` with runtime validation. Key settings:

- `crypto.rekey_interval_minutes`: 10
- `fragmentation.sliding_window_size`: 128  
- `anti_replay.max_ttl_hops`: 6
- `bloom_filters.target_false_positive_rate`: 0.01

## Testing & Validation

### Security Test Categories
1. **Handshake Vectors**: Protocol conformance
2. **Fragmentation Fuzz**: Property-based testing with packet loss/reorder
3. **Replay Protection**: Duplicate rejection validation
4. **Flood Resistance**: 10× throughput within resource limits
5. **Origin Verification**: Forged content rejection
6. **Privacy**: No stable identifier leakage

### Acceptance Criteria
- ✅ Unverified peers blocked from send/receive
- ✅ Rekey preserves session continuity  
- ✅ ≤5% video degradation at 5% packet loss
- ✅ ≤1% replay acceptance under attack
- ✅ CPU ≤50%, battery ≤30%/hr under flood
- ✅ Forged broadcasts never render
- ✅ Rooted devices blocked

## Production Deployment

### Required Capabilities
- Android: `BLUETOOTH`, `BLUETOOTH_ADMIN`, `CAMERA` (QR only)
- Hardware: StrongBox/TEE support
- Network: BLE 5.0+ with mesh extensions

### Update Security
- Code signing with pinned certificates
- Monotonic version enforcement
- Rollback prevention

### Privacy Controls  
- Local-first analytics with 30-day retention
- Opt-in consent before any data sync
- Rotating pseudonyms for network identity