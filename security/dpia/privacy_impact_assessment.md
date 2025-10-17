# Data Protection Impact Assessment (DPIA)
## RENKIVA Mesh TV Network - Location Tracking Features

**Assessment Date:** 2025-10-17  
**Version:** 1.0  
**Classification:** Internal/Confidential  
**Assessment Team:** Privacy Officer, DPO, Security Lead, Legal Counsel

---

## Executive Summary

This Data Protection Impact Assessment (DPIA) evaluates the privacy risks associated with location tracking features in the RENKIVA Mesh TV Network application. The assessment identifies **HIGH RISK** for privacy due to precise GPS coordinate collection combined with device fingerprinting, enabling potential surveillance of individual users' movements.

**Key Findings:**
- 🔴 **High Risk:** Exact GPS coordinates + device fingerprints enable individual tracking
- 🟡 **Medium Risk:** Indefinite retention of location history without user awareness
- 🟢 **Low Risk:** Data access properly restricted via RLS policies

**Recommendation:** Implement coordinate rounding (0.01° precision), automatic data expiration (90 days), and explicit opt-in consent before production deployment.

---

## 1. Overview of Processing Activity

### 1.1 Purpose of Processing
**Business Objective:** Enable content creators and sponsors to understand geographic distribution of their audience for:
- Regional content recommendations
- Targeted advertising campaigns
- Mesh network density mapping
- Offline distribution optimization

**User-Facing Features:**
- "Content popular near you" discovery
- Local mesh node visualization
- Regional analytics dashboards (for creators)

### 1.2 Nature of Processing

| Element | Description |
|---------|-------------|
| **Data Controller** | [Company Name] |
| **Data Processor** | Supabase Inc. (cloud database provider) |
| **Data Subjects** | All app users (age 13+, assume global audience) |
| **Data Categories** | Location data (GPS coordinates), device identifiers, viewing behavior |
| **Processing Operations** | Collection, storage, aggregation, analysis, display to content creators |
| **Retention Period** | Currently: Indefinite. Proposed: 90 days (raw), aggregated thereafter |
| **Geographic Scope** | Global (EU, US, other jurisdictions) |

### 1.3 Legal Basis for Processing (GDPR Art. 6)

**Primary Legal Basis:** 
- **Consent (Art. 6(1)(a))** - Required for precise location tracking
  - ⚠️ **Current Gap:** No explicit consent mechanism in app UI
  - ✅ **Proposed:** Location permission prompt + in-app consent flow

**Secondary Legal Basis (Analytics):**
- **Legitimate Interest (Art. 6(1)(f))** - For aggregated, anonymized analytics only
  - Legitimate interest: Network optimization, content distribution efficiency
  - Balancing test: User privacy > business interest if granular tracking
  - **Conclusion:** Legitimate interest insufficient for precise location; consent required

### 1.4 Special Category Data?
- **Location Data:** Not "special category" under GDPR Art. 9, but **high privacy risk** per EDPB guidelines
- **Children (COPPA):** If users < 13 years old targeted, parental consent required (currently not applicable - age gate at 13+)

---

## 2. Data Flow Mapping

### 2.1 System Architecture

```
┌─────────────┐
│   User      │
│  (Mobile/   │
│   Web App)  │
└──────┬──────┘
       │ GPS Coordinates
       │ Device Fingerprint
       │ Video ID + Timestamp
       ▼
┌─────────────────────────┐
│   Frontend Code         │
│  • navigator.geolocation│
│  • Device fingerprinting│
└──────┬──────────────────┘
       │ HTTP POST
       │ (TLS encrypted)
       ▼
┌─────────────────────────┐
│  Supabase Edge Function │
│  (upload-content, etc.) │
└──────┬──────────────────┘
       │ INSERT
       ▼
┌─────────────────────────┐
│  view_stats Table       │
│  • location_lat         │
│  • location_lng         │
│  • device_fingerprint   │
│  • viewed_at            │
│  • video_id             │
└──────┬──────────────────┘
       │ RLS Policy: Content creator = owner
       ▼
┌─────────────────────────┐
│  Creator Dashboard      │
│  • Map view of viewers  │
│  • Location analytics   │
└─────────────────────────┘
```

### 2.2 Data Collection Points

**Client-Side (JavaScript):**
```javascript
// Current implementation (example)
navigator.geolocation.getCurrentPosition((position) => {
  const location = {
    lat: position.coords.latitude,  // Precise: 37.7749295
    lng: position.coords.longitude  // Precise: -122.4194155
  };
  // Stored without rounding
});
```

**Database Schema (view_stats table):**
- `location_lat`: `numeric` (unlimited precision)
- `location_lng`: `numeric` (unlimited precision)  
- `device_fingerprint`: `text` (browser/device ID)
- `viewed_at`: `timestamp with time zone`
- `video_id`: `uuid` (links to content)
- `viewer_node_id`: `uuid` (mesh network identifier)

### 2.3 Third-Party Data Sharing
- ❌ **No third-party sharing** of raw location data
- ⚠️ **Supabase (processor):** Stores encrypted data at rest (AES-256), processes in EU region
- ⚠️ **Future risk:** If analytics providers added (e.g., Google Analytics with location dimension)

---

## 3. Privacy Risk Assessment

### 3.1 Necessity and Proportionality Test

| Question | Answer | Justification |
|----------|--------|---------------|
| Is data collection **necessary** for stated purpose? | ⚠️ **Partially** | City-level location sufficient for most use cases; precise GPS excessive |
| Could purpose be achieved with **less intrusive** means? | ✅ **Yes** | Coordinate rounding (0.01° ≈ 1.1km) or city codes meet needs |
| Is retention period **justified**? | ❌ **No** | Indefinite retention disproportionate; 90 days adequate |
| Are users **informed**? | ❌ **No** | Current privacy policy generic; lacks specificity on location use |
| Can users **opt-out**? | ❌ **No** | No granular control over location sharing vs. app usage |

**Conclusion:** Processing fails proportionality test. Precision and retention excessive.

### 3.2 Risk to Rights and Freedoms

#### **Risk 1: Individual Surveillance (HIGH)**
- **Scenario:** Content creator queries all views of their videos, extracts (device_fingerprint, lat, lng, timestamp) tuples
- **Impact:** Reveals individual movement patterns, home/work addresses, daily routines
- **Likelihood:** High (SQL query trivial with RLS policy allowing creator access)
- **Severity:** High (stalking, discrimination, physical safety risk)
- **GDPR Article:** Right to privacy (Art. 8 CFHR), data minimization (Art. 5(1)(c))

**Attack Vector Example:**
```sql
-- Content creator runs this query
SELECT device_fingerprint, location_lat, location_lng, viewed_at 
FROM view_stats 
WHERE video_id IN (SELECT id FROM videos WHERE creator_id = 'creator-uuid')
ORDER BY device_fingerprint, viewed_at;

-- Result: Complete movement timeline for Device-X:
-- 2025-01-15 08:00 → 37.7749, -122.4194 (home address)
-- 2025-01-15 09:00 → 37.7850, -122.4050 (commute)
-- 2025-01-15 17:00 → 37.7900, -122.4100 (work address)
```

#### **Risk 2: Inference of Sensitive Activities (MEDIUM)**
- **Scenario:** Location + timestamp correlates to sensitive locations (clinics, religious sites, protests)
- **Impact:** Reveals health status, religious beliefs, political affiliation (special category data by inference)
- **Likelihood:** Medium (depends on user behavior)
- **Severity:** High (discrimination, persecution in hostile jurisdictions)

#### **Risk 3: Data Breach Exposure (MEDIUM)**
- **Scenario:** Database breach leaks view_stats table
- **Impact:** Mass deanonymization of users via location history
- **Likelihood:** Low (good security practices, but breaches occur)
- **Severity:** Critical (permanent compromise, cannot change past locations)

#### **Risk 4: Mesh Network Context (HIGH)**
- **Scenario:** Peer-to-peer network used in regions with surveillance/censorship
- **Impact:** Location data reveals protest movements, dissident activity, organizing patterns
- **Likelihood:** High (if app gains traction in such regions)
- **Severity:** Critical (physical harm, arrest, persecution)

**Special Concern:** Mesh networks inherently associate location with content consumption. If videos contain political or activist content, location tracking becomes **extremely high risk**.

### 3.3 Risk Matrix

| Risk | Likelihood | Impact | Overall | Mitigation Priority |
|------|------------|--------|---------|---------------------|
| Individual surveillance | High | High | **CRITICAL** | 🔴 Immediate |
| Sensitive location inference | Medium | High | **HIGH** | 🟡 Near-term |
| Data breach exposure | Low | Critical | **HIGH** | 🟡 Near-term |
| Mesh context (activism) | Medium | Critical | **CRITICAL** | 🔴 Immediate |
| Function creep (future use) | Medium | Medium | **MEDIUM** | 🟢 Ongoing |

---

## 4. Data Subject Rights (GDPR Chapter III)

### 4.1 Right to be Informed (Art. 13/14)
**Current State:** ❌ **Non-Compliant**
- Privacy policy mentions "usage analytics" but not specific location collection
- No layered notice (just-in-time alert) when location permission requested

**Required Actions:**
- Update privacy policy with:
  - Precise description of location data collected (GPS coordinates vs. city)
  - Purposes (analytics, mesh optimization)
  - Retention period (90 days)
  - Recipients (content creators see aggregated data)
  - User rights (opt-out, deletion, portability)
- Implement in-app consent modal (see Section 5.2)

### 4.2 Right of Access (Art. 15)
**Current State:** ⚠️ **Partial**
- Users can export their profile data (username, email)
- ❌ Cannot access their location history via UI

**Required Actions:**
- Add "Download My Location Data" button in settings
- Provide CSV/JSON export of `view_stats` entries for that user

### 4.3 Right to Erasure (Art. 17)
**Current State:** ⚠️ **Partial**
- Account deletion removes profile
- ❌ Unclear if location data in `view_stats` deleted (may persist via `device_fingerprint`)

**Required Actions:**
- Ensure account deletion triggers:
  ```sql
  DELETE FROM view_stats WHERE device_fingerprint = <user_device_hash>;
  ```
- Provide "Delete My Location History" button (independent of account deletion)

### 4.4 Right to Data Portability (Art. 20)
**Current State:** ❌ **Non-Compliant**
- No machine-readable export of location data

**Required Actions:**
- Export feature returns JSON:
  ```json
  {
    "location_history": [
      {"timestamp": "2025-01-15T08:00:00Z", "lat": 37.77, "lng": -122.42, "video_title": "..."}
    ]
  }
  ```

### 4.5 Right to Object (Art. 21)
**Current State:** ❌ **Non-Compliant**
- No opt-out mechanism for location tracking (all-or-nothing: grant permission or can't use app)

**Required Actions:**
- Implement tiered permissions:
  - **Option A:** Use app without location (no personalized recommendations)
  - **Option B:** Share approximate location (city-level)
  - **Option C:** Share precise location (full consent)

---

## 5. Recommended Safeguards

### 5.1 Technical Measures

#### **Measure 1: Coordinate Rounding (IMMEDIATE)**
**Implementation:**
```javascript
// Frontend: Round before transmission
function roundCoordinates(lat, lng, precision = 2) {
  return {
    lat: Math.round(lat * (10 ** precision)) / (10 ** precision),
    lng: Math.round(lng * (10 ** precision)) / (10 ** precision)
  };
}

// 0.01° ≈ 1.1 km precision (city-level)
const location = roundCoordinates(position.coords.latitude, position.coords.longitude, 2);
```

**Backend Validation:**
```sql
-- Ensure DB rejects over-precise coordinates
ALTER TABLE view_stats 
  ADD CONSTRAINT location_precision_check 
  CHECK (
    location_lat = ROUND(location_lat::numeric, 2) AND 
    location_lng = ROUND(location_lng::numeric, 2)
  );
```

**Privacy Gain:** Reduces individual identification from 10m radius to ~1km radius (100x area increase)

#### **Measure 2: Automatic Data Expiration (IMMEDIATE)**
```sql
-- Scheduled job: Delete location data older than 90 days
CREATE OR REPLACE FUNCTION delete_old_location_data()
RETURNS void AS $$
BEGIN
  DELETE FROM view_stats 
  WHERE viewed_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql;

-- Run daily via pg_cron or edge function
SELECT cron.schedule('delete-old-locations', '0 2 * * *', 'SELECT delete_old_location_data()');
```

**Privacy Gain:** Prevents indefinite location history accumulation

#### **Measure 3: Pseudonymous Device IDs (NEAR-TERM)**
```javascript
// Rotate device fingerprint every 24 hours
const dailySalt = new Date().toISOString().split('T')[0]; // "2025-01-15"
const pseudonymousID = await crypto.subtle.digest('SHA-256', 
  new TextEncoder().encode(deviceFingerprint + dailySalt)
);
```

**Privacy Gain:** Breaks cross-day tracking linkage

#### **Measure 4: Aggregation for Creators (NEAR-TERM)**
Instead of exposing raw location points, show:
- **Heatmap:** Aggregated 10km grid squares with view counts
- **City-Level Stats:** "150 views from San Francisco"
- **No Individual Points:** Hide device-level data entirely

**Database Change:**
```sql
-- New aggregated table (replace raw access)
CREATE TABLE view_stats_aggregated (
  video_id uuid,
  region_code text,  -- e.g., "US-CA-SF" or H3 geohash
  view_date date,
  view_count integer,
  unique_devices_approx integer  -- HyperLogLog estimate
);

-- RLS: Content creators see only aggregated data
CREATE POLICY "Creators see aggregated stats" 
ON view_stats_aggregated FOR SELECT 
USING (video_id IN (SELECT id FROM videos WHERE creator_id IN 
  (SELECT id FROM creators WHERE user_id IN 
    (SELECT id FROM users WHERE auth_user_id = auth.uid()))));
```

#### **Measure 5: Differential Privacy (LONG-TERM)**
Add noise to aggregated counts:
```sql
-- Add Laplace noise to view counts
SELECT 
  region_code, 
  view_count + (random() - 0.5) * 10 AS noisy_count  -- ε = 0.1 privacy budget
FROM view_stats_aggregated;
```

### 5.2 Organizational Measures

#### **Consent Flow (IMMEDIATE)**
**UI Mockup - Location Permission Modal:**
```
┌──────────────────────────────────────────┐
│  📍 Location Data Collection             │
│                                          │
│  We'd like to use your location to:     │
│  • Show nearby content                   │
│  • Help creators see regional stats      │
│                                          │
│  Your choice:                            │
│  ○ Share approximate location (city)     │
│  ○ Share precise location (GPS)          │
│  ○ Don't share location                  │
│                                          │
│  [Privacy Policy] [Learn More]           │
│                                          │
│         [Continue]   [Later]             │
└──────────────────────────────────────────┘
```

**Data Recorded:**
```sql
CREATE TABLE user_consent_log (
  user_id uuid,
  consent_type text,  -- 'location_precise', 'location_approximate', 'location_none'
  consented_at timestamp,
  consent_version text,  -- '1.0' for audit trail
  ip_address inet,
  user_agent text
);
```

#### **Privacy Policy Updates (IMMEDIATE)**
**Required Sections:**
1. **What We Collect:**
   > "When you watch content, we collect your approximate location (city-level, ~1km precision) to provide regional recommendations. We do NOT collect your exact GPS coordinates unless you explicitly opt in for precise location features."

2. **Why We Collect:**
   > "Location data helps content creators understand their audience geography and optimize mesh network distribution."

3. **Who Sees Your Data:**
   > "Content creators see aggregated location statistics (e.g., '50 views from San Francisco') but NEVER individual viewer locations or identities."

4. **How Long We Keep It:**
   > "Raw location data is automatically deleted after 90 days. Aggregated, anonymized statistics are retained indefinitely."

5. **Your Rights:**
   > "You can download your location history, delete it, or opt out of location sharing at any time in Settings > Privacy."

#### **Staff Training (NEAR-TERM)**
- Privacy training for engineers: Data minimization principles
- Product managers: Privacy-by-design in feature planning
- Support team: Handling GDPR requests (access, erasure)

#### **Data Protection Officer (DPO) (If Required)**
- **GDPR Art. 37:** DPO required if "core activities consist of... regular and systematic monitoring of data subjects on a large scale"
- **Assessment:** If app scales >100k users with location tracking, **DPO likely required**
- **Action:** Appoint DPO or outsource to privacy consultancy

---

## 6. Compliance Obligations

### 6.1 GDPR (EU Users)
| Requirement | Status | Action |
|-------------|--------|--------|
| Legal basis (consent) | ❌ Missing | Implement opt-in modal |
| Data minimization | ❌ Excessive precision | Round coordinates |
| Storage limitation | ❌ Indefinite retention | 90-day expiration |
| Transparency | ❌ Incomplete | Update privacy policy |
| Data subject rights | ⚠️ Partial | Add export/delete features |
| DPIA conducted | ✅ Complete | This document |
| Processor agreement | ✅ Complete | Supabase DPA signed |

### 6.2 CCPA (California Users)
| Requirement | Status | Action |
|-------------|--------|--------|
| Notice at collection | ❌ Missing | In-app disclosure |
| Right to know | ⚠️ Partial | Add data export |
| Right to delete | ⚠️ Partial | Verify cascade delete |
| Right to opt-out (sale) | ✅ N/A | Not selling data |
| Do Not Track | ⚠️ Recommended | Honor DNT header |

### 6.3 COPPA (If Children <13)
**Current Status:** Not applicable (age gate at 13+)

**If Lowering Age Limit:**
- Parental consent required before location collection
- Additional restrictions on geolocation precision
- No behavioral advertising to children

### 6.4 Other Jurisdictions
- **Brazil (LGPD):** Similar to GDPR; consent required
- **Canada (PIPEDA):** Consent + meaningful withdrawal mechanism
- **Australia (Privacy Act):** APP guidelines for location data
- **China (PIPL):** Separate consent for "sensitive personal information" (location qualifies)

---

## 7. Accountability & Monitoring

### 7.1 Compliance Audit Trail
**Logs to Maintain:**
- User consent records (timestamp, version, user IP)
- Location data access logs (who queried view_stats, when)
- Data deletion logs (automated expiration + user requests)
- Privacy policy version history

**Retention:** 6 years (GDPR statute of limitations)

### 7.2 Privacy Metrics (Monthly Review)
| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| % users consented to location | >60% | [TBD] | - |
| Avg. location precision (degrees) | 0.01° | ~0.0001° | 🔴 Too precise |
| Location data retention (days) | <90 | ∞ | 🔴 Non-compliant |
| GDPR requests response time (days) | <30 | [TBD] | - |
| Data breach incidents | 0 | 0 | ✅ |

### 7.3 Incident Response (Location Breach)
**If Breach Occurs:**
1. **Containment:** Revoke database access, rotate credentials
2. **Assessment:** How many users affected? What precision level?
3. **Notification:**
   - Users: Within 72 hours (GDPR Art. 33)
   - Supervisory authority (if high risk): Within 72 hours
4. **Remediation:** Force password reset, offer credit monitoring (if identity theft risk)
5. **Post-Mortem:** Update security controls, inform DPO

---

## 8. Decision & Sign-Off

### 8.1 Risk Acceptance Decision

**Question:** Can the identified risks be mitigated to an acceptable level?

**Answer:** ✅ **YES**, with implementation of recommended safeguards:
- Coordinate rounding (0.01°)
- 90-day data expiration
- Explicit opt-in consent
- Aggregated creator dashboards

**Residual Risk:** 
- Even rounded coordinates can reveal patterns if enough data points
- Determined attacker with auxiliary data (social media check-ins) may deanonymize
- **Acceptance:** Acceptable for general consumer app; **NOT acceptable** for activist/high-risk user populations without further hardening

### 8.2 Approval Required

**This DPIA must be approved by:**
- [ ] Data Protection Officer (DPO) / Privacy Lead
- [ ] Chief Technology Officer (CTO) / Engineering Lead
- [ ] Legal Counsel
- [ ] Chief Executive Officer (CEO) / Accountable Executive

**Signatures:**

Data Protection Officer: _________________ Date: _______

CTO: _________________ Date: _______

Legal: _________________ Date: _______

CEO: _________________ Date: _______

### 8.3 Review Schedule
- **Next Review:** 6 months or upon material change (whichever sooner)
- **Triggers for Re-Assessment:**
  - New location features (e.g., real-time tracking)
  - Data sharing with third parties
  - Regulatory changes (new privacy laws)
  - Security incident involving location data
  - Expansion to new high-risk jurisdictions

---

## 9. References

- **GDPR:** Regulation (EU) 2016/679
- **EDPB Guidelines 3/2019:** Processing of Personal Data through Video Devices (analogous for location)
- **Article 29 WP Opinion 13/2011:** Geolocation services on smart mobile devices
- **ICO Guidance:** Location data and privacy
- **NIST Privacy Framework:** [https://www.nist.gov/privacy-framework](https://www.nist.gov/privacy-framework)

---

**Document Version:** 1.0  
**Classification:** Internal/Confidential  
**Distribution:** Leadership, Privacy Team, Legal

**Questions?** Contact DPO at privacy@renkiva.com
