# Security Policy - RENKIVA Mesh TV Network

**Version:** 1.0  
**Effective Date:** 2025-10-17  
**Classification:** Public

## 1. Overview

RENKIVA Mesh TV Network (OfflineLink) is a peer-to-peer mesh networking platform enabling offline content distribution via BLE mesh, Wi-Fi Direct, and hybrid internet modes. This policy outlines our security program, incident response, and vulnerability disclosure procedures.

## 2. Security Contact

**Primary Security Contact:**  
- Email: security@renkiva.com (create this alias)
- PGP Key: [Link to public key]
- Response SLA: 24 hours for critical, 72 hours for high

**Emergency Security Contact (After Hours):**  
- Phone: [Emergency number]
- Signal: [Secure messaging contact]

**Responsible Disclosure Portal:**  
- HackerOne: [program URL] (if applicable)
- GitHub Security Advisories: [repo]/security/advisories

## 3. Scope of Security Program

### 3.1 In Scope
- Mobile applications (iOS/Android) - all versions
- Web application (production domain)
- BLE mesh protocol implementation
- Wi-Fi Direct fallback mechanisms
- Edge functions and API endpoints
- Database layer (Supabase)
- Content delivery and fragment synchronization
- Authentication and authorization flows
- Cryptographic implementations (Noise XX, ChaCha20-Poly1305)

### 3.2 Out of Scope
- Third-party services we don't control (Supabase infrastructure, archive.org)
- Physical security of end-user devices
- Social engineering attacks against end users
- Attacks requiring physical device access

## 4. Responsible Vulnerability Disclosure

### 4.1 Reporting Process
1. **Submit Report:** Email security@renkiva.com with:
   - Vulnerability description and impact
   - Steps to reproduce (PoC code welcomed)
   - Affected versions/components
   - Suggested severity (CVSS score if available)
   
2. **Acknowledgment:** We respond within 24 hours (critical) or 72 hours (all others)

3. **Investigation:** Our team validates and assesses impact within 5 business days

4. **Remediation:** We provide estimated fix timeline:
   - Critical: 7 days
   - High: 30 days
   - Medium: next quarterly release
   - Low: backlog

5. **Disclosure:** Coordinated disclosure 90 days after fix or by mutual agreement

### 4.2 Safe Harbor
We support security research conducted in good faith and will not pursue legal action against researchers who:
- Make a good-faith effort to avoid privacy violations and service disruption
- Only interact with accounts they own or with explicit permission
- Do not publicly disclose vulnerabilities before coordinated disclosure
- Do not exfiltrate, modify, or delete production user data

### 4.3 Recognition
Security researchers who responsibly disclose valid vulnerabilities will be:
- Listed in our Security Hall of Fame (with permission)
- Credited in release notes (unless anonymous)
- Considered for bug bounty rewards (if program active)

## 5. Security Assurance Activities

### 5.1 Ongoing Controls
- **Daily:** Automated dependency scanning (Dependabot, npm audit)
- **Weekly:** Static analysis (SAST) on all PRs
- **Monthly:** Penetration testing of new features
- **Quarterly:** Comprehensive vulnerability assessments
- **Annually:** Full penetration test and cryptographic audit

### 5.2 Third-Party Audits
Last security audit: [Date]  
Audit firm: [Firm name]  
Scope: [Penetration testing / Crypto audit / Compliance]  
Next scheduled audit: [Date]

### 5.3 Compliance & Privacy
- **GDPR:** Data Protection Impact Assessment completed [Date]
- **COPPA:** Parental consent mechanisms reviewed [Date]
- **SOC 2:** [Not applicable / In progress / Certified]

## 6. Incident Response Plan

### 6.1 Severity Classification

| Severity | Definition | Response Time | Examples |
|----------|------------|---------------|----------|
| **Critical** | Active exploitation, data breach, complete service compromise | < 1 hour | RCE, mass data exfiltration, crypto key compromise |
| **High** | Likely exploitation, significant impact to availability/integrity | < 4 hours | Authentication bypass, privilege escalation, XSS |
| **Medium** | Exploitation possible with moderate effort, limited impact | < 24 hours | CSRF, information disclosure, weak crypto config |
| **Low** | Difficult to exploit or minimal impact | < 5 days | Minor info leak, missing security headers |

### 6.2 Incident Response Workflow
1. **Detection** → Alert security team
2. **Containment** → Isolate affected systems, block attack vectors
3. **Eradication** → Patch vulnerability, remove backdoors
4. **Recovery** → Restore service, verify integrity
5. **Post-Incident** → Root cause analysis, lessons learned, update controls

### 6.3 Communication
- Internal stakeholders notified within 2 hours
- Affected users notified within 72 hours (GDPR requirement)
- Public disclosure after remediation (if applicable)

## 7. Cryptographic Standards

### 7.1 Approved Algorithms
- **Key Exchange:** X25519 (ECDH)
- **Signing:** Ed25519
- **Encryption:** ChaCha20-Poly1305 (AEAD)
- **Hashing:** BLAKE2s (SHA-256 fallback)
- **Protocol:** Noise XX

### 7.2 Key Management
- Ephemeral session keys with 10-minute rotation
- Hardware-backed key storage (StrongBox/Secure Enclave)
- Out-of-band verification (QR + SAS) for identity keys
- Perfect forward secrecy guaranteed

### 7.3 Deprecated/Forbidden
- ❌ MD5, SHA-1 (collision attacks)
- ❌ RSA < 2048 bits
- ❌ DES, 3DES
- ❌ RC4, ECB mode
- ❌ Hardcoded secrets

## 8. Privacy & Data Protection

### 8.1 Data Minimization
- Location data rounded to 0.01° (~1.1km) precision
- Device fingerprints hashed and rotated every 24 hours
- View statistics aggregated after 90 days, raw data deleted
- No persistent identifiers unless user consents

### 8.2 User Rights (GDPR)
- **Access:** Export all personal data via settings
- **Rectification:** Edit profile/preferences in-app
- **Erasure:** Account deletion removes all PII within 30 days
- **Portability:** JSON export of user-generated content
- **Objection:** Opt-out of location tracking and analytics

### 8.3 Data Retention
| Data Type | Retention Period | Justification |
|-----------|------------------|---------------|
| Authentication logs | 90 days | Security monitoring |
| Content metadata | User lifetime + 30 days | Service delivery |
| Location data (raw) | 90 days | Analytics, then aggregated |
| Crash reports | 1 year | Quality assurance |
| Mesh network logs | 7 days | Network diagnostics |

## 9. Dependency Management

### 9.1 Software Bill of Materials (SBOM)
- Auto-generated on each release (see `/security/sbom/`)
- Format: CycloneDX JSON
- Includes transitive dependencies

### 9.2 Vulnerability Scanning
- Automated: GitHub Dependabot, npm audit
- Manual: Quarterly review of NIST NVD
- SLA: Patch critical dependencies within 48 hours

### 9.3 Approved Libraries
- Cryptography: `libsodium`, Web Crypto API
- Networking: `wrtc`, `simple-peer`
- Database: `@supabase/supabase-js`

**Pre-approval required for:** New crypto libraries, native modules, dependencies with C/C++ bindings

## 10. Secure Development Lifecycle

### 10.1 Code Review
- All PRs require 1 security-focused reviewer for security-critical paths
- Automated checks: ESLint security rules, Semgrep, CodeQL

### 10.2 Security Testing Gates
- **Pre-Commit:** Secret scanning (git-secrets)
- **PR:** SAST (CodeQL), dependency check
- **Staging:** DAST (OWASP ZAP), crypto config tests
- **Production:** Penetration test for major releases

### 10.3 Training
- Annual security training for all engineers
- Quarterly threat modeling workshops
- Monthly security newsletters with recent CVEs

## 11. Third-Party Risk Management

### 11.1 Vendor Assessment
Before integrating third-party services:
- Review security certifications (SOC 2, ISO 27001)
- Assess data processing agreements (DPA)
- Verify encryption in transit and at rest
- Check incident response SLAs

### 11.2 Current Critical Vendors
| Vendor | Service | Data Classification | Security Review Date |
|--------|---------|---------------------|----------------------|
| Supabase | Database, Auth, Storage | PII, Content | [Date] |
| Archive.org | Content source | Public data | N/A |

## 12. Compliance Matrix

| Regulation | Applicable? | Status | Last Review | Controls |
|------------|-------------|--------|-------------|----------|
| **GDPR** | ✅ Yes (EU users) | Compliant | [Date] | DPIA, consent, data portability, RLS policies |
| **COPPA** | ⚠️ If <13 users | Not targeted | [Date] | Age verification required if enabled |
| **CCPA** | ✅ Yes (CA users) | Compliant | [Date] | Data export, deletion, opt-out |
| **HIPAA** | ❌ No | N/A | N/A | Not handling PHI |

## 13. Metrics & Reporting

### 13.1 Security KPIs
- Mean Time to Detect (MTTD) vulnerabilities: < 7 days
- Mean Time to Remediate (MTTR): < 30 days (high severity)
- % of dependencies up-to-date: > 95%
- Code coverage for security tests: > 80%

### 13.2 Quarterly Security Report
Published to stakeholders:
- Vulnerabilities discovered and remediated
- Security audit findings
- Incident summary (anonymized)
- Compliance status updates

## 14. Acceptable Use & Terms

Users must not:
- Attempt unauthorized access to other users' data
- Exploit vulnerabilities for malicious purposes
- Reverse engineer security controls for evasion
- Distribute malware or illegal content through the mesh

Violations result in account suspension and potential legal action.

## 15. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-17 | Initial security policy | Security Team |

## 16. Acknowledgments

We thank the security research community and all contributors who help keep RENKIVA secure.

---

**Questions?** Contact security@renkiva.com
