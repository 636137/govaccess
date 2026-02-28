# GovAccess

**Digital Identity & Authentication Gateway for Government Services**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NIST 800-63-4](https://img.shields.io/badge/NIST%20800--63--4-Compliant-blue)](https://pages.nist.gov/800-63-4/)
[![FedRAMP](https://img.shields.io/badge/FedRAMP-Ready-green)](https://fedramp.gov)

## Background

Identity verification is a make-or-break factor for digital government experiences—when digital identity systems fail, fraud risk increases and confidence in government services erodes. Login.gov achieved IAL2 certification, and ID.me expanded to Medicare.gov for beneficiary verification. NIST SP 800-63-4 now provides updated guidance covering digital wallets and passkeys. The VA fully transitioned away from legacy sign-in options, removing My HealtheVet in March 2025 and DS Logon in November 2025.

**The Identity Challenge:**
- Authentication abandonment rates exceed 30% for complex flows
- Identity proofing friction drives citizens to in-person verification
- Agencies struggle to integrate multiple identity providers
- Legacy authentication systems create security vulnerabilities
- No unified experience across federal services

**Regulatory Context:**
- NIST SP 800-63-4 (updated 2024) - Digital identity guidelines
- Executive Order on zero-trust architecture
- OMB M-22-09 - Moving the U.S. Government toward zero trust
- FedRAMP authorization requirements
- Privacy Act and PII protection mandates

## Need

While Login.gov and ID.me serve as primary platforms, agencies need middleware that simplifies integration, supports the latest NIST standards including passkeys and digital wallets, and provides a unified authentication experience across multiple identity providers.

**Key Pain Points:**
- **Integration Complexity**: Each IdP requires custom integration
- **Inconsistent UX**: Different login flows confuse citizens
- **Authentication Abandonment**: 30%+ drop-off during sign-in
- **Limited Assurance Levels**: Hard to implement IAL2/AAL2 step-up
- **No Passkey Support**: Modern authentication methods not available
- **Vendor Lock-In**: Difficult to switch identity providers
- **Fraud Risk**: Weak authentication enables account takeover

**Current State:**
- Login.gov: 100M+ accounts, IAL2 certified
- ID.me: 130M+ users, biometric verification
- VA transition complete (March/November 2025)
- NIST 800-63-4 adds passkeys and digital wallets

## Solution

A federated identity middleware layer that abstracts Login.gov, ID.me, and agency-specific identity providers behind a single integration point. Supports NIST SP 800-63-4 assurance levels, passkey enrollment, digital wallet credential verification, and adaptive multi-factor authentication with risk-based step-up.

**Core Capabilities:**
- **Federated Identity**: Single integration for multiple IdPs
- **NIST 800-63-4 Compliance**: IAL1/2/3 and AAL1/2/3 support
- **Passkey Support**: WebAuthn/FIDO2 passwordless authentication
- **Digital Wallets**: Verify credentials from mobile wallets
- **Adaptive MFA**: Risk-based step-up authentication
- **Session Management**: Unified SSO across agency services
- **Consent Management**: Privacy-preserving attribute release

## Design

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Agency Applications & Services                 │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              GovAccess Middleware (OIDC/SAML)               │
│         Unified Authentication & Authorization              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        │            │            │            │
┌───────▼──────┐ ┌──▼──────┐ ┌──▼─────┐ ┌────▼────┐
│  Login.gov   │ │ ID.me   │ │Passkey │ │ Agency  │
│   Adapter    │ │ Adapter │ │ (FIDO2)│ │   IdP   │
└──────────────┘ └─────────┘ └────────┘ └─────────┘
```

### Technology Stack

- **Protocol Layer**: OpenID Connect (OIDC) + SAML 2.0
- **Backend**: Node.js (Express) or Python (FastAPI)
- **Session Store**: Redis with encryption
- **Database**: PostgreSQL for user mappings
- **WebAuthn**: @simplewebauthn/server for passkeys
- **Cryptography**: Node.js crypto or Python cryptography
- **Frontend**: React + USWDS 3.0
- **Infrastructure**: AWS GovCloud or Azure Government

### Identity Provider Adapters

**Login.gov Adapter:**
```javascript
const loginGovAdapter = {
  provider: 'login.gov',
  protocol: 'oidc',
  discoveryUrl: 'https://idp.int.identitysandbox.gov/.well-known/openid-configuration',
  clientId: process.env.LOGIN_GOV_CLIENT_ID,
  clientSecret: process.env.LOGIN_GOV_CLIENT_SECRET,
  scopes: ['openid', 'email', 'profile', 'social_security_number'],
  acrValues: ['http://idmanagement.gov/ns/assurance/ial/2']
};
```

**ID.me Adapter:**
```javascript
const idMeAdapter = {
  provider: 'id.me',
  protocol: 'oidc',
  discoveryUrl: 'https://api.id.me/.well-known/openid-configuration',
  clientId: process.env.IDME_CLIENT_ID,
  clientSecret: process.env.IDME_CLIENT_SECRET,
  scopes: ['openid', 'email', 'profile'],
  acrValues: ['http://idmanagement.gov/ns/assurance/ial/2']
};
```

**Passkey Adapter:**
```javascript
const passkeyAdapter = {
  provider: 'webauthn',
  rpName: 'U.S. Government',
  rpID: 'login.usa.gov',
  origin: 'https://login.usa.gov',
  attestation: 'none',
  authenticatorSelection: {
    authenticatorAttachment: 'platform',
    userVerification: 'required'
  }
};
```

### NIST 800-63-4 Assurance Levels

**Identity Assurance Levels (IAL):**
- **IAL1**: Self-asserted identity (no verification)
- **IAL2**: Remote identity proofing (Login.gov, ID.me)
- **IAL3**: In-person identity proofing (supervised)

**Authenticator Assurance Levels (AAL):**
- **AAL1**: Single-factor authentication
- **AAL2**: Multi-factor authentication (MFA)
- **AAL3**: Hardware-based cryptographic authenticator

**Federation Assurance Levels (FAL):**
- **FAL1**: Bearer assertion, signed by IdP
- **FAL2**: Bearer assertion, signed and encrypted
- **FAL3**: Holder-of-key assertion

### Authentication Flows

**Standard Flow:**
```
┌─────────────┐
│   Citizen   │
│ Visits App  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  GovAccess  │
│   Gateway   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Select    │
│     IdP     │
│(Login/ID.me)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     IdP     │
│    Login    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  GovAccess  │
│  Callback   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Session   │
│   Created   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Redirect   │
│   to App    │
└─────────────┘
```

**Step-Up Authentication:**
```
┌─────────────┐
│   Citizen   │
│ Logged In   │
│   (AAL1)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Sensitive  │
│   Action    │
│  (Requires  │
│    AAL2)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  GovAccess  │
│  Step-Up    │
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     MFA     │
│  Challenge  │
│(SMS/Passkey)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Session   │
│  Upgraded   │
│   to AAL2   │
└─────────────┘
```

### Compliance Alignment

| Requirement | Implementation |
|------------|----------------|
| **NIST 800-63-4** | IAL1/2/3, AAL1/2/3, FAL1/2/3 support |
| **Zero Trust** | Continuous authentication, least-privilege access |
| **FedRAMP Rev 5** | Cloud deployment on authorized infrastructure |
| **FISMA** | Audit logging, continuous monitoring |
| **Privacy Act** | Minimal PII collection, consent management |
| **Section 508** | USWDS components, WCAG 2.0 AA conformance |

## Outcomes

### Target Metrics

- **Authentication Abandonment**: <10% (vs. 30% baseline)
- **Fraud Reduction**: 80% decrease in account takeover
- **Integration Time**: <2 weeks for new agency onboarding
- **Session Duration**: 8-hour SSO across agency services
- **Passkey Adoption**: 40% of users within 12 months
- **Citizen Satisfaction**: 85%+ with authentication experience

### Success Criteria

- Measurable reduction in authentication abandonment rates
- Decreased fraud through stronger identity proofing
- Streamlined agency onboarding to identity services
- Improved Qualtrics XMI scores for authentication journey
- Support for 100+ agency applications

## Getting Started

### Prerequisites

```bash
- Node.js 18+ or Python 3.11+
- Redis 7+
- PostgreSQL 14+
- SSL certificates
```

### Quick Start

```bash
# Clone repository
git clone https://github.com/636137/govaccess.git
cd govaccess

# Install dependencies
npm install  # or pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with IdP credentials

# Setup database
npm run db:migrate

# Run locally
npm run dev

# Access at https://localhost:3000
```

### Configuration

Create `.env`:

```bash
# Server
PORT=3000
BASE_URL=https://login.agency.gov
SESSION_SECRET=your_secret_key

# Login.gov
LOGIN_GOV_CLIENT_ID=your_client_id
LOGIN_GOV_CLIENT_SECRET=your_secret
LOGIN_GOV_REDIRECT_URI=https://login.agency.gov/auth/logingov/callback

# ID.me
IDME_CLIENT_ID=your_client_id
IDME_CLIENT_SECRET=your_secret
IDME_REDIRECT_URI=https://login.agency.gov/auth/idme/callback

# Passkey (WebAuthn)
RP_NAME=U.S. Government
RP_ID=login.agency.gov
RP_ORIGIN=https://login.agency.gov

# Redis
REDIS_URL=redis://localhost:6379

# Database
DATABASE_URL=postgresql://user:pass@localhost/govaccess
```

### Agency Integration

**OIDC Integration:**

```javascript
// Agency application
const passport = require('passport');
const OIDCStrategy = require('passport-openidconnect').Strategy;

passport.use('govaccess', new OIDCStrategy({
  issuer: 'https://login.agency.gov',
  authorizationURL: 'https://login.agency.gov/authorize',
  tokenURL: 'https://login.agency.gov/token',
  userInfoURL: 'https://login.agency.gov/userinfo',
  clientID: 'your_client_id',
  clientSecret: 'your_client_secret',
  callbackURL: 'https://app.agency.gov/auth/callback',
  scope: ['openid', 'email', 'profile']
}, (issuer, profile, done) => {
  return done(null, profile);
}));
```

**SAML Integration:**

```xml
<!-- Agency SAML SP configuration -->
<EntityDescriptor entityID="https://app.agency.gov">
  <SPSSODescriptor>
    <AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="https://app.agency.gov/saml/acs"
      index="0" />
  </SPSSODescriptor>
</EntityDescriptor>
```

## Features

### Passkey Enrollment

```javascript
// Register passkey
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: challengeFromServer,
    rp: { name: "U.S. Government", id: "login.usa.gov" },
    user: {
      id: userIdBuffer,
      name: "citizen@example.com",
      displayName: "John Citizen"
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required"
    }
  }
});
```

### Adaptive MFA

Risk-based step-up authentication:

```javascript
const riskScore = calculateRisk({
  ipAddress: req.ip,
  deviceFingerprint: req.headers['x-device-id'],
  location: req.geo,
  timeSinceLastLogin: timeDiff,
  actionSensitivity: 'high'
});

if (riskScore > 0.7) {
  // Require step-up to AAL2
  return res.redirect('/auth/stepup?acr=aal2');
}
```

### Digital Wallet Verification

```javascript
// Verify credential from mobile wallet
const credential = await verifyWalletCredential({
  presentation: req.body.vp_token,
  nonce: session.nonce,
  expectedIssuer: 'did:web:dmv.state.gov'
});

if (credential.type === 'DriversLicense') {
  // Grant access based on verified credential
  session.ial = 2;
  session.attributes = credential.claims;
}
```

### Session Management

```javascript
// Create unified session
const session = await createSession({
  userId: user.id,
  provider: 'login.gov',
  ial: 2,
  aal: 2,
  attributes: {
    email: user.email,
    firstName: user.given_name,
    lastName: user.family_name
  },
  ttl: 28800  // 8 hours
});

// SSO across agency apps
const ssoToken = await createSSOToken(session);
```

## API Documentation

### Initiate Authentication

```bash
GET /authorize?
  client_id=your_client_id&
  redirect_uri=https://app.agency.gov/callback&
  response_type=code&
  scope=openid email profile&
  acr_values=http://idmanagement.gov/ns/assurance/ial/2
```

### Token Exchange

```bash
POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTH_CODE&
client_id=your_client_id&
client_secret=your_client_secret&
redirect_uri=https://app.agency.gov/callback
```

### UserInfo

```bash
GET /userinfo
Authorization: Bearer ACCESS_TOKEN

Response:
{
  "sub": "user-uuid",
  "email": "citizen@example.com",
  "given_name": "John",
  "family_name": "Citizen",
  "ial": "http://idmanagement.gov/ns/assurance/ial/2",
  "aal": "http://idmanagement.gov/ns/assurance/aal/2"
}
```

## Security Features

- **Zero Trust**: Continuous authentication and authorization
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Token Security**: Short-lived access tokens (15 min), refresh tokens (8 hours)
- **Rate Limiting**: Prevent brute force attacks
- **Audit Logging**: Complete authentication history
- **PII Protection**: Minimal attribute release with consent

## Monitoring & Analytics

- **Authentication Success Rate**: Track by IdP and method
- **Abandonment Analysis**: Identify friction points
- **Fraud Detection**: Anomaly detection for suspicious logins
- **Performance Metrics**: Response times, uptime
- **User Journey**: Funnel analysis from login to app access

## Contributing

We welcome contributions from:
- Federal agencies
- Identity and access management experts
- Security researchers
- Developers

See [CONTRIBUTING.md](CONTRIBUTING.md).

**Priority Areas:**
- Additional IdP adapters (state systems, international)
- Advanced fraud detection
- Mobile SDK development
- Biometric authentication
- Decentralized identity (DIDs)

## Security

Report security vulnerabilities to security@example.gov. See [SECURITY.md](SECURITY.md).

## License

MIT License - See [LICENSE](LICENSE).

## Acknowledgments

- Login.gov (GSA)
- ID.me
- NIST National Cybersecurity Center of Excellence
- U.S. Web Design System (USWDS)
- FIDO Alliance

## Resources

- [NIST SP 800-63-4](https://pages.nist.gov/800-63-4/)
- [Login.gov Developer Guide](https://developers.login.gov/)
- [ID.me Developer Portal](https://developer.id.me/)
- [WebAuthn Guide](https://webauthn.guide/)
- [OMB M-22-09 Zero Trust](https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-09.pdf)

---

**Status**: Active Development | **Maintainer**: Identity Team | **Last Updated**: 2026-02-28
