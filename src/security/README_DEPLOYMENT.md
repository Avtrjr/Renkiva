# Mesh TV Network - Security Layer Deployment Guide

## Production Deployment Checklist

### 1. Mobile App Build

```bash
# Install dependencies
npm install

# Build the web assets
npm run build

# Sync with native platforms
npx cap sync

# Build for Android
npx cap run android

# Build for iOS (requires macOS)
npx cap run ios
```

### 2. Security Configuration

#### Required Files
- `content_policy.yml` - Content moderation policy
- `security.yml` - Security parameters
- `/public/models/nsfw-mobilenet.onnx` - NSFW classifier model

#### Environment Variables
```bash
# Add to your build environment
VITE_SECURITY_ENABLED=true
VITE_CONTENT_POLICY_URL=/content_policy.yml
VITE_NSFW_MODEL_URL=/models/nsfw-mobilenet.onnx
```

### 3. Hardware Security Setup

#### Android Requirements
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

#### iOS Requirements
```xml
<!-- ios/App/App/Info.plist -->
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID for secure content verification</string>
```

### 4. Capacitor Plugins

Required plugins for full security functionality:

```bash
npm install @capacitor/device
npm install @capacitor/app
npm install @capacitor/network
npm install @capacitor-community/biometric
```

### 5. NSFW Model Deployment

Download a pre-trained NSFW detection model (ONNX format):

```bash
# Example: Download NSFW classifier model
curl -o public/models/nsfw-mobilenet.onnx \
  https://huggingface.co/onnx-community/nsfw-mobilenet/resolve/main/model.onnx
```

### 6. Moderator Key Setup

Initialize trusted moderator keys:

```typescript
import { bulletinQuorum } from '@/security/bulletin/ModerationBulletin';

// Add trusted moderator public keys
const moderatorKeys = [
  new Uint8Array([/* moderator 1 public key */]),
  new Uint8Array([/* moderator 2 public key */]),
  new Uint8Array([/* moderator 3 public key */])
];

moderatorKeys.forEach(key => bulletinQuorum.addTrustedModerator(key));
```

### 7. Integration with Existing Supabase

#### Add Security Tables

```sql
-- Content reports table
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  moderator_notes TEXT
);

-- Moderation bulletins table
CREATE TABLE moderation_bulletins (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  subject_hash TEXT NOT NULL,
  reasons TEXT[] NOT NULL,
  signatures JSONB NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_bulletins ENABLE ROW LEVEL SECURITY;

-- Only moderators can see reports
CREATE POLICY "Moderators can view reports" ON content_reports
  FOR SELECT USING (auth.jwt() ->> 'user_metadata' ->> 'role' = 'moderator');

-- Bulletins are public but only moderators can insert
CREATE POLICY "Bulletins are viewable by all" ON moderation_bulletins
  FOR SELECT USING (true);

CREATE POLICY "Only moderators can create bulletins" ON moderation_bulletins
  FOR INSERT WITH CHECK (auth.jwt() ->> 'user_metadata' ->> 'role' = 'moderator');
```

#### Update Edge Functions

```typescript
// supabase/functions/content-safety/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { action, data } = await req.json()
    
    switch (action) {
      case 'submit_report':
        // Handle content report submission
        break;
      case 'create_bulletin':
        // Handle moderation bulletin creation
        break;
      case 'verify_manifest':
        // Handle safety manifest verification
        break;
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
})
```

### 8. Testing in Production

#### Security Test Suite
```bash
# Run security tests before deployment
npm run test:security

# Run performance benchmarks
npm run test:performance

# Run privacy validation
npm run test:privacy
```

#### Manual Testing Checklist
- [ ] Device attestation blocks rooted devices
- [ ] NSFW classifier correctly identifies test content
- [ ] Manifests signatures verify correctly
- [ ] Moderation bulletins propagate and block content
- [ ] Report flow captures evidence correctly
- [ ] Sandboxed renderer strips metadata
- [ ] Rate limiting prevents spam
- [ ] Hardware keys work on target devices

### 9. Monitoring & Analytics

#### Security Metrics Dashboard
```typescript
// Track key security metrics
const securityMetrics = {
  attestationFailures: 0,
  nsfwBlockedContent: 0,
  invalidManifests: 0,
  activeBulletins: 0,
  reportsSubmitted: 0,
  tamperingAttempts: 0
};

// Report to analytics (privacy-safe)
function reportSecurityMetric(metric: string, value: number) {
  // Only report aggregated, anonymized data
  console.log(`Security metric: ${metric} = ${value}`);
}
```

### 10. Privacy Compliance

#### Data Handling
- **No Content Storage**: Media files never leave the device
- **Pseudonymous IDs**: Rotating identifiers prevent tracking
- **Local Processing**: All NSFW detection happens on-device
- **Minimal Metadata**: Only essential security data is shared

#### GDPR/Privacy Controls
```typescript
// Privacy settings enforcement
const privacySettings = {
  logContentHashes: false,     // Never log content hashes
  logUserActions: true,        // Log moderation actions only
  retentionDays: 30,          // Auto-delete old data
  requireOptIn: true          // Explicit consent required
};
```

### 11. Update Mechanism

#### Secure Updates
```typescript
// Verify update signatures before applying
async function verifyUpdate(updatePackage: Blob, signature: Uint8Array) {
  const publicKey = await getUpdateSigningKey();
  return await crypto.subtle.verify(
    'Ed25519',
    publicKey,
    signature,
    await updatePackage.arrayBuffer()
  );
}
```

### 12. Performance Optimization

#### Mobile Optimizations
- **Lazy Loading**: Load security modules only when needed
- **Background Processing**: Offload heavy operations
- **Memory Management**: Clean up temporary resources
- **Battery Optimization**: Minimize crypto operations

```typescript
// Performance monitoring
const performanceMetrics = {
  nsfwClassifierLatency: 0,
  manifestSigningTime: 0,
  attestationTime: 0,
  memoryUsage: 0
};
```

## Troubleshooting

### Common Issues

1. **NSFW Model Loading Fails**
   - Check model file exists at `/public/models/`
   - Verify ONNX.js compatibility
   - Test with smaller model first

2. **Hardware Keystore Unavailable**
   - Fallback to software crypto
   - Check device compatibility
   - Verify permissions granted

3. **Device Attestation Fails**
   - Check Play Integrity API setup
   - Verify app signing certificates
   - Test on non-rooted devices

4. **Performance Issues**
   - Profile NSFW classifier performance
   - Optimize image preprocessing
   - Cache computed hashes

### Debug Mode

Enable debug logging in development:

```typescript
window.MESH_TV_DEBUG = {
  security: true,
  crypto: true,
  nsfw: true,
  reports: true
};
```

This comprehensive deployment guide ensures the security layer is properly configured and integrated with your production Mesh TV Network deployment.