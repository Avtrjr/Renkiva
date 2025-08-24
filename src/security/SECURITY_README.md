# Mesh TV Network - Offline Content Safety Layer

## Overview

This security layer provides comprehensive offline content moderation without requiring internet connectivity. It prevents distribution of inappropriate content and enables fast community moderation through distributed consensus.

## Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Sender    │───▶│    Ingest    │───▶│   Network   │
│ (Publisher) │    │   Pipeline   │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
                           │                     │
                           ▼                     ▼
                   ┌──────────────┐    ┌─────────────┐
                   │    Safety    │    │  Receiver   │
                   │   Manifest   │    │  Pipeline   │
                   └──────────────┘    └─────────────┘
                                              │
                                              ▼
                                      ┌─────────────┐
                                      │   Render    │
                                      │  (Sandbox)  │
                                      └─────────────┘
```

## Key Features

### 1. Media-Only Policy (Deny by Default)
- **Allowed**: mp4, webm, mov, mp3, aac, opus, jpg, png, gif, webp
- **Blocked**: zip, rar, exe, apk, js, html, dll, and unknowns
- **Magic Bytes**: MIME detection via file headers, not extensions

### 2. Offline NSFW Screening
- On-device neural network classification
- Samples keyframes/thumbnails for video
- Configurable thresholds (0.85 default, 0.60 youth mode)
- Requires ≥2 consecutive "safe" frames for video

### 3. Safety Manifests (Signed)
```json
{
  "originPubKey": "<base64>",
  "sha256": "<hex>", 
  "pHash": "<hex>",
  "nsfwScore": 0.1,
  "timestamp": "2024-08-24T10:30:00Z",
  "policyFlags": ["media_only"],
  "version": 1,
  "signature": "<base64-Ed25519>"
}
```

### 4. Moderation Bulletins
- **Hash Blocks**: Block specific content by SHA-256
- **Origin Revokes**: Revoke publisher's signing key
- **Multi-sig Quorum**: Default 2-of-3 moderator signatures
- **TTL**: Hash blocks expire in 14 days, revokes in 30 days

### 5. RBAC & Publish Gates
- **Viewer**: Read-only access
- **Member**: Can interact (like, share)  
- **Publisher**: Can publish (requires attestation)
- **Moderator**: Can issue bulletins
- **Cooloff**: 24h read-only period for new accounts

### 6. Safe Rendering
- Sandboxed MediaCodec decode
- EXIF/ICC metadata stripping
- Resolution/bitrate caps
- Malformed frame rejection

## Usage

### Initialize Security Layer
```typescript
import { policyManager } from './security/policy/PolicyManager';
import { contentIngest } from './security/ingest/ContentIngest';

// Load content policy
await policyManager.load();

// Validate and sign content
const result = await contentIngest.validateAndSign(
  file, 
  originKeyHandle, 
  originPubKey
);
```

### Sender Pipeline (Publishing)
```typescript
// 1. MIME validation
if (!policyManager.isAllowed(file.type)) {
  throw new Error('Blocked file type');
}

// 2. NSFW screening  
const frames = await sampler.sampleKeyframes(video);
const scores = await classifier.scoreFrames(frames);
const safe = ContentSafetyUtils.requiresConsecutiveSafeFrames(scores);

// 3. Create signed manifest
const manifest = await manifestSigner.sign(manifestData, keyHandle);

// 4. Publish with manifest attached
await meshPublish(file, manifest);
```

### Receiver Pipeline (Verification)
```typescript
// 1. Verify signature
const valid = await manifestSigner.verify(manifest);

// 2. Check hash integrity  
const actualHash = await hashManager.computeFileHash(file);
const hashMatch = actualHash.equals(manifest.sha256);

// 3. Check moderation bulletins
const blocked = await bulletinStore.isBlocked(manifest.sha256, BulletinType.HASH_BLOCK);

// 4. Apply policy (youth mode, etc.)
const safe = manifest.nsfwScore < policyManager.getNsfwThreshold();

// 5. Render in sandbox if all checks pass
if (valid && hashMatch && !blocked && safe) {
  await sandboxedRender(file);
}
```

## Testing

Run the security test suite:
```typescript
import { securityTestSuite } from './security/tests/SecurityTestSuite';

const results = await securityTestSuite.runAllTests();
console.log(`Tests: ${results.passed} passed, ${results.failed} failed`);
```

## Configuration

Edit `content_policy.yml` to adjust thresholds:
```yaml
content:
  nsfw:
    threshold_block: 0.85      # Block if NSFW score >= 0.85
    youth_mode: false          # Stricter thresholds when enabled
  moderation:
    bulletin_quorum: "2of3"    # Moderator signature requirement
    bulletin_ttl_hours: 72     # Bulletin expiration
```

## Moderator Workflow

1. **Review Reports**: User-generated content reports with evidence
2. **Issue Bulletins**: Create hash blocks or origin revokes  
3. **Multi-sig**: Requires 2-of-3 moderator signatures
4. **Propagation**: Bulletins spread via mesh network
5. **Expiration**: Automatic cleanup of expired bulletins

## Privacy & Security

- **Local-First**: All processing happens on-device
- **No Content Upload**: Never transmits actual media files
- **Rotating Pseudonyms**: No stable device identifiers
- **Rate-Limited Logs**: Prevent log flooding attacks
- **Hardware Keys**: Ed25519 keys stored in StrongBox/TEE

## Production Deployment

1. **Mobile Build**: `npx cap sync && npx cap run android`
2. **NSFW Model**: Deploy optimized ONNX.js model to `/public/models/`
3. **Moderator Setup**: Initialize with trusted moderator public keys
4. **Policy Tuning**: Adjust thresholds based on community standards
5. **Monitoring**: Track bulletin propagation and false positive rates

This implementation provides comprehensive offline content safety with strong cryptographic guarantees and distributed governance.