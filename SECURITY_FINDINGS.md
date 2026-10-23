# Test Pilot — Security Findings (Phase 0)

**Scope:** Static review of `client/` and `server/` at commit `b1c0355`. No penetration test or production scan was performed.  
**Severity:** Critical / High / Medium / Low / Info.

---

## Critical / High

### H1. JWT stored in `localStorage` (XSS → full account takeover)

`AuthContext` and the Axios interceptor persist the access token in `localStorage`. Any XSS can steal it for up to 7 days. There is no refresh-token rotation, no cookie `HttpOnly` flag, and no token revocation list.

**Plan:** Keep Bearer JWT in Phase 1 so Google login and the existing client do not break. Harden XSS surface (Helmet CSP later), then evaluate HttpOnly cookie + CSRF in a dedicated auth migration after institute flows land.

### H2. Admin authorization is email-string equality, not a durable role

`adminAuth` allows access iff `req.user.email !== process.env.ADMIN_EMAIL` fails (i.e. emails match). Comparison is **case-sensitive**, while registration lowercases the user email and compares `ADMIN_EMAIL` case-insensitively when **assigning** role. A mismatch in env casing can lock out the intended admin or, if `ADMIN_EMAIL` is unset, **deny all admins** (`undefined !== email` is true → 403). Role field is unused for API admin checks.

Any user who can register with the admin email becomes admin. There is no second factor, invite, or super-admin bootstrap collection.

### H3. Error responses leak internal messages

Most controllers return `{ message, error: error.message }` on 500/401. This can expose MongoDB details, JWT errors, or Google verification internals to clients.

### H4. No rate limiting on auth, import, or submit

Login, register, Google, payment-to-be, and JSON import are unlimited. Credential stuffing and import DoS (2mb JSON) are feasible.

### H5. Exam timing and attempts are not enforced server-side

`timeTaken` is client-supplied. There is no attempt record, no `expiresAt`, no idempotent submit. A client can:

- Submit after unlimited time
- Submit many times (duplicate results; practice farming)
- Skip `start` and POST answers directly (scoring still uses DB keys — good — but there is no purchase/eligibility check)

### H6. Client dependency vulnerabilities (verified `npm audit`)

Client `npm audit` on 2026-10-23 reported **3 high**:

- `follow-redirects` (axios transitive)
- `source-map-js`
- `vite` 7.0.0–7.3.6 (dev-server / Windows launch-editor issues)

Server audit: 0. Root audit: 0. `npm audit fix` was **not** applied during the audit to avoid unreviewed upgrades.

---

## Medium

### M1. Missing security headers and CORS tightness

No Helmet. CORS is a single origin string with no methods/headers allowlist and no `credentials` policy (acceptable for Bearer tokens, but origin fallback to localhost in production if `CLIENT_URL` is missing is risky).

### M2. Weak or missing input validation

- Register: no email format check, no password complexity/min length on the server.
- Submit: `answers` shape is not schema-validated.
- Import: validates structure but not string length, HTML/script content, or option uniqueness.
- No centralized validator (express-validator / zod).

### M3. Admin is a single global mailbox; no tenant isolation

All exams and results are global. There is no `instituteId`. Once institutes exist, IDOR will be the default failure mode unless every query is scoped. Current result-by-id **does** scope to `userId` (good). Admin results return **every** student’s data with emails.

### M4. JSON import auto-publishes and uses transactions unconditionally

`isPublished: true` on create. Failed/partial publish is not an entitlement concern yet, but it will be. `startTransaction()` fails on standalone MongoDB (local). Atlas replica sets are required; this is a deployment risk, not only a security one.

### M5. Exam delete is non-atomic and orphans results

Questions and exam may delete while results remain, pointing at missing exams. Commented code would also delete results inside a transaction — that would destroy student history and must not be revived without an archive policy.

### M6. DNS override in `server.js`

`dns.setServers(['8.8.8.8', '1.1.1.1'])` bypasses the host resolver. Useful for some Atlas setups; it also changes trust and can break locked-down networks.

### M7. Google login does not bind `googleId`

Account linking is email-only. A Google account for an email takes over the local user if they share an email (Google verifies email, so this is moderate). No check that Google email is verified in payload (`email_verified`).

### M8. `JWT_SECRET` not validated at boot

If unset, tokens still “work” until verify/sign throws; misconfiguration may be noticed only in production 401s, or worse if a library treats `undefined` poorly.

---

## Low / Info

### L1. No password reset, email verification, or account lockout

UI advertises forgot-password.

### L2. No audit log of admin import/delete, login failures, or role changes.

### L3. PDF streams user name/email; generation errors after headers are only logged.

### L4. Frontend admin checks are UX-only (expected); API must remain the source of truth.

### L5. `rememberMe` does not change token lifetime.

### L6. Health endpoint is unauthenticated (acceptable) but could later leak dependency versions.

### L7. No CSRF today because auth is Bearer header, not cookies. CSRF becomes required if cookies are adopted.

### L8. Question keys are correctly stripped on `start`. Public `GET /:id` does not include questions. **Do not** add populate of questions on public exam detail.

### L9. No `.env.example`; operators may copy production secrets into chat or commit files. Placeholders only will be added.

### L10. Mark-for-review dead code references an undefined setter (runtime throw **if** the unused function were called). Currently not invoked.

---

## Trust boundaries (for later phases)

Never trust from the client:

- `role`, `instituteId`, `userId`, `price`, `score`, `correctAnswer`, `timeTaken`, commission, plan id as paid proof.

Always derive:

- Identity from verified JWT → DB user
- Admin from role (plus optional bootstrap email)
- Prices from catalog documents
- Scores from question keys
- Entitlements from ledger collections
- Payment success from gateway signature + status, not UI

---

## Phase 1 security work (immediate)

1. Require `JWT_SECRET` at startup; sanitize API errors.
2. Helmet + auth rate limits + tighter CORS.
3. Server password/email validation; case-insensitive admin check; authorize by **role** with email bootstrap as fallback.
4. Attempt model, server expiry, idempotent submit, ignore client-reported score/duration for pass/fail.
5. Add automated tests for authz and scoring.
6. Document env placeholders. Do not commit secrets.
7. Patch client audits in a controlled dependency bump after build verification.
