# Rules of Engagement (RoE) - Security Testing

**Project:** RENKIVA Mesh TV Network  
**Client:** [Company Name]  
**Engagement Type:** Penetration Testing, Cryptographic Audit, Privacy Assessment  
**Version:** 1.0  
**Effective Date:** [Start Date]  
**Expiration:** [End Date]

---

## 1. Authorization & Legal

### 1.1 Authorized Testing
This document serves as **written authorization** for the security testing firm ("[Vendor]") to perform security assessments against the systems and applications listed in **Section 3 (Scope)** during the authorized testing window.

**Authorized Signatories:**
- **Client Representative:** [Name, Title]  
  Signature: _________________ Date: _______
  
- **Vendor Lead:** [Name, Title]  
  Signature: _________________ Date: _______

### 1.2 Legal Protections
- **Safe Harbor:** Testing conducted under this RoE is authorized and will not result in legal action, provided testers comply with these rules.
- **Non-Disclosure Agreement (NDA):** All findings and test artifacts are confidential and covered under NDA executed [Date].
- **Data Protection Addendum (DPA):** Vendor agrees to GDPR-compliant handling of any personal data encountered (signed [Date]).

### 1.3 Liability
- Vendor assumes responsibility for damages caused by **gross negligence or willful misconduct**.
- Client accepts risk of **service disruption** during authorized testing windows and will not hold Vendor liable for unavoidable impacts within scope.

---

## 2. Testing Windows & Coordination

### 2.1 Authorized Testing Periods
| Phase | Start Date/Time | End Date/Time | Timezone |
|-------|----------------|---------------|----------|
| **Reconnaissance** | [Date] 09:00 | [Date] 18:00 | UTC |
| **Active Testing (Staging)** | [Date] 09:00 | [Date] 18:00 | UTC |
| **Limited Production Testing** | [Date] 22:00 | [Date] 02:00 | UTC |
| **Mesh Protocol Testing** | [Date] 09:00 | [Date] 18:00 | UTC |
| **Retest & Validation** | [Date] 09:00 | [Date] 18:00 | UTC |

**Note:** Production testing restricted to off-peak hours (22:00–02:00 UTC). **No testing outside these windows without written approval.**

### 2.2 Emergency Stop Procedures
**If testing causes service degradation or unintended impact:**

1. **Immediately cease all testing activities**
2. **Notify emergency contact within 15 minutes:**
   - Primary: [Name], [Phone], [Signal/WhatsApp]
   - Secondary: [Name], [Phone]
   - Email: security-emergency@renkiva.com

3. **Document incident:** What was tested, observed impact, timestamp
4. **Await authorization** before resuming testing

### 2.3 Communication Channels
- **Daily Standups:** 09:00 UTC via [Video platform]
- **Real-Time Coordination:** Slack channel `#security-pentest`
- **Findings Submission:** Encrypted email to security@renkiva.com (PGP required)
- **Emergency:** Phone + Signal (see Section 2.2)

---

## 3. Scope Definition

### 3.1 In-Scope Assets

#### 3.1.1 Mobile Applications
- **iOS App:** `app.lovable.0ccf7e051f49421fa13aa2b6f9fde12f` (TestFlight build [version])
- **Android App:** `app.lovable.0ccf7e051f49421fa13aa2b6f9fde12f` (Internal track [version])
- **Platforms:** iOS 15+, Android 10+

#### 3.1.2 Web Application
- **Production:** `https://0ccf7e05-1f49-421f-a13a-a2b6f9fde12f.lovableproject.com`
- **Staging:** `https://staging.renkiva.com` (if separate)

#### 3.1.3 API & Backend
- **Supabase Project:** `btsriforcmdugnuemlhx`
- **Edge Functions:** All functions under `supabase/functions/`
  - ✅ content-webhook
  - ✅ join-channel
  - ✅ mass-import
  - ✅ movie-import
  - ✅ upload-content
  - ✅ mesh-fragment-sync
  - ✅ mnmp-sync

#### 3.1.4 Mesh Network Protocols
- **BLE Mesh:** Advertising, scanning, relay logic
- **Wi-Fi Direct:** Peer discovery, group formation
- **Noise Protocol:** Handshake, encryption (ChaCha20-Poly1305), key rotation
- **MNMP Protocol:** Packet structure, signing, fragmentation

#### 3.1.5 Authentication & Authorization
- Supabase Auth (email/password, magic link)
- Row-Level Security (RLS) policies
- Role-based access control (RBAC) - `user_roles` table

#### 3.1.6 Data Storage
- **Supabase Tables:** All tables listed in schema
- **Storage Buckets:** `meshtv-library`, `movies`, `ad-assets`
- **Client-Side Storage:** IndexedDB, LocalStorage, Keychain (iOS), KeyStore (Android)

### 3.2 Out-of-Scope (Do Not Test)
- ❌ Third-party infrastructure (Supabase cloud, archive.org servers)
- ❌ Physical attacks on devices or network equipment
- ❌ Social engineering attacks against employees or users
- ❌ Denial of Service (DoS) attacks exceeding Section 4.5 limits
- ❌ Production database modification (read-only access for schema review)
- ❌ Any system not explicitly listed in Section 3.1

### 3.3 Gray-Box vs. Black-Box
- **Black-Box Testing:** Mobile apps (APK/IPA analysis, dynamic testing)
- **Gray-Box Testing:** Web app and backend (source code access, schema provided)
- **White-Box Testing:** Cryptographic implementations (code review with test vectors)

---

## 4. Testing Constraints & Prohibited Actions

### 4.1 Data Handling
- **Synthetic Test Accounts:** Use only provided test accounts (`pentest-user-01@example.com` through `pentest-user-10@example.com`)
- **No Real User Data:** Do not access, modify, or exfiltrate data belonging to real users
- **Data Exfiltration:** Extraction of test data for PoC purposes is **permitted** but must be:
  - Limited to minimum necessary for demonstration
  - Encrypted in transit (GPG/S3 over TLS)
  - Deleted within 7 days of engagement end
- **Database Queries:** Read-only queries permitted; no `INSERT`, `UPDATE`, `DELETE` on production

### 4.2 Service Availability
- **Load Limits:** Do not exceed 100 requests/second to any endpoint
- **Staging Environment:** Primary target for destructive tests
- **Production:** Only non-destructive tests during off-peak hours
- **Mesh Network:** Limit simultaneous mesh nodes to 50 during testing to avoid network congestion

### 4.3 Prohibited Techniques
- ❌ **Destructive Attacks:** Wiping data, corrupting files, permanent deletion
- ❌ **Ransomware/Malware:** Deploying malicious payloads on client devices
- ❌ **Persistence Mechanisms:** Installing backdoors, rootkits, or persistence
- ❌ **Credential Stuffing:** Using known breach databases against real accounts
- ❌ **Physical Device Tampering:** Opening devices, JTAG/UART access (unless explicitly authorized)
- ❌ **Public Disclosure:** Sharing vulnerabilities publicly before coordinated disclosure

### 4.4 Acceptable Testing Techniques
- ✅ **Fuzzing:** Input validation, protocol fuzzing (AFL, Radamsa)
- ✅ **MITM Attacks:** Against test accounts in controlled environment
- ✅ **Bluetooth Sniffing:** Using Ubertooth/Nordic nRF sniffer on test mesh
- ✅ **Mobile App Analysis:** Static (APKTool, Hopper) and dynamic (Frida, objection)
- ✅ **Cryptographic Analysis:** Test vectors, timing attacks (local only)
- ✅ **Privilege Escalation:** Attempting to gain unauthorized role permissions
- ✅ **Injection Attacks:** SQL, NoSQL, XSS, command injection (on test data)

### 4.5 Rate Limiting & DoS
- **Maximum Request Rate:** 100 req/sec per endpoint
- **Mesh Packet Flooding:** Max 1000 packets/sec for flood resistance tests
- **Acceptable DoS:** Brief resource exhaustion tests (< 30 seconds) on staging only
- **Unacceptable DoS:** Sustained attacks, production downtime, third-party service abuse

---

## 5. Approved Tools & Techniques

### 5.1 Reconnaissance
- ✅ Nmap, Masscan (network mapping)
- ✅ Sublist3r, Amass (subdomain enumeration)
- ✅ Shodan, Censys (passive recon)
- ✅ Google dorking (public data only)

### 5.2 Web Application Testing
- ✅ Burp Suite Professional
- ✅ OWASP ZAP
- ✅ SQLMap (with rate limiting)
- ✅ Nuclei, FFuF

### 5.3 Mobile Application Testing
- ✅ **Android:** APKTool, Jadx, Frida, objection, Drozer, MobSF
- ✅ **iOS:** Hopper, Ghidra, Frida, objection, Needle, MobSF
- ✅ **Network:** mitmproxy, Charles Proxy, Wireshark

### 5.4 Bluetooth & Mesh Testing
- ✅ Ubertooth One (BLE sniffing)
- ✅ Nordic nRF52840 DK (protocol analysis)
- ✅ Wireshark with BLE plugin
- ✅ Bluez, hcitool (Linux Bluetooth stack)
- ✅ GATTacker (GATT attacks)

### 5.5 Cryptographic Analysis
- ✅ OpenSSL, LibreSSL (TLS/certificate testing)
- ✅ Test vectors from NIST, RFC test suites
- ✅ Timing attack frameworks (on local copies only)
- ✅ Entropy analysis tools (ENT, dieharder)

### 5.6 Exploitation Frameworks
- ⚠️ **Metasploit:** Staging environment only, no persistence
- ⚠️ **Cobalt Strike:** Pre-approval required, staging only
- ❌ **Ransomware/Wipers:** Prohibited

### 5.7 Reporting Tools
- ✅ Dradis, Faraday (collaboration)
- ✅ CVSS Calculator v4.0
- ✅ PlantUML (attack chain diagrams)

---

## 6. Reporting Requirements

### 6.1 Vulnerability Severity (CVSS v4.0)
| CVSS Score | Severity | Response SLA | Examples |
|------------|----------|--------------|----------|
| 9.0–10.0 | **Critical** | 7 days | RCE, authentication bypass, mass data breach |
| 7.0–8.9 | **High** | 30 days | Privilege escalation, XSS, crypto weakness |
| 4.0–6.9 | **Medium** | Next release | CSRF, info disclosure, weak session |
| 0.1–3.9 | **Low** | Backlog | Missing headers, verbose errors |

### 6.2 Report Deliverables
1. **Executive Summary** (non-technical, 2–3 pages)
   - Business impact of findings
   - Risk overview and remediation roadmap

2. **Technical Report** (detailed)
   - Methodology and tools used
   - Findings with CVSS scores, PoC steps, screenshots
   - Affected components and attack chains
   - Recommended mitigations (code snippets, config changes)

3. **Appendices**
   - Full test logs (sanitized)
   - SBOM (Software Bill of Materials)
   - Dependency scan results (npm audit, Snyk)
   - Cryptographic test vectors

4. **Retest Report** (post-remediation)
   - Verification of fixes
   - Acceptance criteria validation
   - Residual risk assessment

### 6.3 Submission Timeline
- **Daily Standup Updates:** Verbal summary of progress
- **Critical Findings:** Report within 4 hours of discovery
- **Draft Report:** 1 week after testing window closes
- **Final Report:** 2 weeks after client feedback on draft
- **Retest Report:** 1 week after remediation verification

### 6.4 Evidence Standards
- **Screenshots:** Full context (URL bar, timestamp visible)
- **PoC Code:** Working exploit (safeguarded, not weaponized)
- **Network Captures:** PCAPs sanitized (no real credentials)
- **Video Demos:** For complex attack chains (optional)

---

## 7. Incident Management

### 7.1 Critical Incident Triggers
A **critical incident** occurs if testing results in:
- Service outage > 5 minutes
- Data corruption or loss
- Unauthorized access to production data
- Legal/law enforcement inquiry

### 7.2 Incident Response Procedure
1. **Stop Testing:** Immediately halt all activities
2. **Notify Client:**
   - Emergency contact: [Name], [Phone]
   - Email: security-emergency@renkiva.com
   - Provide: Timestamp, action taken, observed impact

3. **Preserve Evidence:**
   - Retain all logs, PCAPs, commands executed
   - Do not destroy or alter evidence

4. **Collaborate on Resolution:**
   - Join incident call within 30 minutes
   - Provide technical assistance if requested

5. **Post-Incident Review:**
   - Document root cause
   - Update RoE if needed to prevent recurrence

---

## 8. Data Retention & Destruction

### 8.1 Test Artifacts
- **Retention Period:** 90 days after final report delivery
- **Storage:** Encrypted repository (AES-256), access restricted to engagement team
- **Transfer:** GPG-encrypted files via secure file share (not email)

### 8.2 Destruction Certificate
Upon engagement conclusion:
- Vendor must **certify in writing** that all test data, credentials, and artifacts have been securely deleted
- Client may audit vendor systems to verify deletion (with 14 days notice)

### 8.3 Exceptions
- **Legal Hold:** If litigation or regulatory inquiry occurs, data retained per legal counsel
- **Reference Samples:** Anonymized, non-sensitive findings may be retained for training (client approval required)

---

## 9. Personnel & Access

### 9.1 Authorized Testers
Only the following individuals are authorized to perform testing:

| Name | Role | Certifications | Contact |
|------|------|----------------|---------|
| [Name] | Lead Pentester | OSCP, CREST CRT | [email/phone] |
| [Name] | Mobile Specialist | OSCP, GPEN | [email/phone] |
| [Name] | Cryptographer | PhD Applied Crypto | [email/phone] |
| [Name] | DPIA Consultant | CIPP/E, CIPM | [email/phone] |

**Background Checks:** All testers have passed background checks (verification docs provided).

### 9.2 Credentials Provided
Client will provide:
- **Test Accounts:** 10 user accounts (various roles: admin, moderator, user)
- **API Keys:** Staging environment API keys
- **Source Code Access:** GitHub repo read access
- **VPN Access:** If internal testing required
- **Test Devices:** 2x Android, 2x iOS devices (loaned or BYOD reimbursement)

### 9.3 Credential Security
- **Storage:** Password manager (1Password/LastPass) with 2FA
- **Rotation:** All credentials changed immediately after engagement ends
- **Sharing:** Only via encrypted channels (Signal, PGP email)

---

## 10. Compliance & Ethics

### 10.1 Ethical Standards
Testers must:
- Act in good faith and professional manner
- Report all findings honestly (no withholding for personal gain)
- Respect user privacy and data protection laws
- Avoid conflicts of interest

### 10.2 Legal Compliance
- **CFAA (US):** Testing authorized under written agreement
- **Computer Misuse Act (UK):** Consent documented
- **GDPR (EU):** Data minimization, purpose limitation, security by design

### 10.3 Responsible Disclosure
- **Embargo Period:** 90 days from final report or until patch deployed (whichever is sooner)
- **Public Disclosure:** Only with client written approval
- **CVE Coordination:** Client handles CVE assignment; vendor assists if requested

---

## 11. Acceptance Criteria

Testing is considered **complete and successful** when:
- ✅ All in-scope assets tested per methodology
- ✅ Findings documented with CVSS scores and PoCs
- ✅ Critical and high findings reported within SLA
- ✅ Draft report reviewed and feedback incorporated
- ✅ Retest performed on remediated vulnerabilities
- ✅ Final report delivered with executive summary
- ✅ All test artifacts securely destroyed and certified

---

## 12. Amendments & Extensions

### 12.1 Scope Changes
Any additions to scope require:
- Written approval via email from both parties
- Updated RoE addendum signed
- Adjusted timeline and budget (if applicable)

### 12.2 Testing Window Extensions
If delays occur:
- Vendor requests extension 5 days before expiration
- Client approves or denies within 2 business days
- New RoE version issued if extended > 14 days

---

## 13. Signatures

**By signing below, both parties acknowledge and agree to the terms of this Rules of Engagement document.**

**Client:**
- Name: ___________________________
- Title: ___________________________
- Signature: ________________________
- Date: ___________________________

**Vendor:**
- Name: ___________________________
- Title: ___________________________
- Signature: ________________________
- Date: ___________________________

---

**Document Version:** 1.0  
**Classification:** Confidential  
**Distribution:** Client Security Team, Vendor Engagement Team Only

**Questions?** Contact security@renkiva.com or [Vendor Contact]
