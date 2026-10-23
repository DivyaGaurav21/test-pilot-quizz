# Test Pilot — Implementation Plan

**Principle:** Extend the existing MERN app. No greenfield rewrite. Preserve URLs, JWT login, Google login, exam taking, scoring rules, PDF results, and JSON import.

**Backup:** `backup/pre-saas-transformation` points at `b1c0355` (pre-change). Work proceeds on `feat/saas-platform`.

---

## Compatibility rules (all phases)

- Additive Mongoose fields with defaults; no collection drops.
- Keep `role: 'user' | 'admin'` readable. Normalize:
  - `admin` ≡ `SUPER_ADMIN` (platform operator)
  - `user` ≡ `STUDENT`
  - new: `INSTITUTE_ADMIN`, `SUPER_ADMIN`, `STUDENT`
- Existing exams without `instituteId` → `ownershipType: 'platform'`.
- Do not delete historical results when exams are archived.
- Payment/live Razorpay stays **disabled** until env credentials exist. No fake “paid” in production paths.
- MongoDB transactions: use when `connection.transaction` is supported (Atlas replica set). Otherwise atomic `findOneAndUpdate` + unique indexes. Document both.

---

## PHASE 0 — Audit (this delivery)

Artifacts:

- `CODEBASE_AUDIT.md`
- `SECURITY_FINDINGS.md`
- this file

Commands run: dependency install, client `npm audit`, client production build. No backend tests existed to run. No deployment.

---

## PHASE 1 — Security, authz, exam-engine stability

**Why first:** Marketplace and money must sit on a timer and role model that cannot be spoofed.

### Files likely touched

- `server/app.js`, `server/server.js`
- `server/middleware/auth.js`, `adminAuth.js` (extend, not throw away)
- new: `server/middleware/authorize.js`, `errorHandler.js`, `validate.js`
- `server/models/User.js`, new `Attempt.js`, `Result.js` (additive)
- `server/controllers/examController.js`, `authController.js`
- `server/utils/calculateResult.js` (tests; scoring rules unchanged)
- `client/src/pages/ExamPage.jsx`, `ExamTimer.jsx`, `QuestionNavigation.jsx`
- `client/src/App.jsx` (results list, forgot-password placeholder)
- `client/.env.example`, `server/.env.example`
- new `server/tests/**`

### Risks

- Breaking Google button if auth response shape changes
- Breaking admin if we only check new role enums
- Transaction failures on local standalone Mongo

### Done when

- Auth rate-limited; errors do not include stack/`error.message` in production
- Roles normalized; existing admin email still works
- Start creates an attempt with server `expiresAt`; submit is idempotent and scores on server; client `timeTaken` is stored as claimed only
- Mark for review works
- `/results` lists the current user’s history
- Automated tests cover scoring + admin 403 + submit idempotency
- Client build still succeeds

---

## PHASE 2 — Institutes, approval, tenant isolation

### Behavior

- Institute application (name, contact, location — no extra PII)
- Status: `pending | approved | rejected | suspended`
- First institute admin = applicant user, role `INSTITUTE_ADMIN` **only after approval** (pending users stay `STUDENT` until approved, or hold `pendingInstituteAdmin` flag without publish rights)
- Public registration **cannot** grant `SUPER_ADMIN`
- Super admin approve/reject/suspend/reactivate
- `instituteId` on exams, questions (denormalized), later orders/attempts
- Middleware: `requireInstituteAdmin` loads membership from DB; never from body
- Unapproved/suspended cannot publish or sell

### Migration

- `Institute`, `InstituteMember`
- Existing exams: `ownershipType: 'platform'`, `instituteId: null`
- Tests: Institute A cannot GET/PATCH Institute B resources (404/403)

---

## PHASE 3 — Lifetime free quota + subscriptions

### Lifetime free publications

- **Exactly 3 per institute**, never per user, never reset
- Drafts do not consume
- Only **successful publish** consumes
- Unpublish/delete/archive/edit **never restores**
- Concurrent publish cannot exceed 3
- Ledger collection `PublicationEntitlement` (immutable rows): `{ instituteId, examId, source: 'lifetime_free' | 'subscription', subscriptionId?, createdAt }`
- Unique index `(instituteId, examId)` for first successful publish
- Counter on Institute updated atomically (`lifetimeFreeUsed`) **and** ledger is source of truth

### Subscriptions

- Super-admin configurable plans: price (integer paise), currency, period (`month`|`year`), `publicationAllowance`, status
- Subscription states: `pending | active | past_due | expired | cancelled`
- Additional publishes require remaining subscription entitlement while period valid
- Expiry blocks **new** publishes; does not delete tests or student purchases
- Activation only after verified payment (Phase 4). Until gateway is configured, subscription purchase stays `pending` and cannot be flipped to `active` from the client.

---

## PHASE 4 — Marketplace, orders, payments, 80/20 ledger

### Marketplace

- Public catalog: published tests of **approved + active** institutes, plus platform-owned tests
- Filters: category, title, institute, price
- No unpublished/suspended/archived/private questions in public APIs
- Students buy a test without joining the institute

### Payments (Razorpay-shaped adapter, inactive by default)

- Server creates orders from **DB price**
- Verify signature; idempotent webhooks
- Access grant only after verified `paid`
- Env placeholders only; live processing off if keys missing
- States: `pending | paid | failed | refunded | partially_refunded`

### Ledger (INR paise, integer math)

For eligible **institute-owned** paid sales, **before** separately accounted gateway fees and taxes:

- Institute share **80%**
- Platform commission **20%**
- Rounding: compute commission as `floor(grossPaise * 20 / 100)`? **Decision:** `platformCommissionPaise = roundHalfEven` is complex; MVP uses **`platformCommissionPaise = Math.floor(grossPaise * 20 / 100)`** and **`instituteSharePaise = grossPaise - platformCommissionPaise`** so they always sum to gross. Documented in code.
- Gateway fees, GST, discounts stored as **separate** columns/entries, not mixed into the 80/20 split of gross catalog price.
- Platform-owned tests: 100% platform; **no** institute payable
- Refunds: new reversal entries; never mutate original lines
- Ledger ≠ bank payout. Payouts tracked `pending | eligible | paid | blocked` with manual/provider settlement later

---

## PHASE 5 — Dashboards, analytics, audit, UI

- Super admin, institute admin, student dashboards as specified
- Server-side pagination/aggregation
- Audit log for approval, publish, payment, refund, role change
- Align branding to Test Pilot; keep Tailwind look
- Institute pending/rejected messaging

---

## PHASE 6 — Tests, deploy docs, hardening

- Expand tests listed in the product brief
- Client production build + server tests
- `DEPLOYMENT.md`: env, Atlas transactions (replica set), Render, Vercel rewrites, webhook URL, backup/rollback, limitations
- Dependency audit bump
- Known limitations explicitly listed

---

## Authoritative business rules (do not reinvent)

1. Three lifetime free **successful publications** per institute.
2. Quota never restored.
3. Subscriptions required after quota for further publishes; plans configured by super admin, not hardcoded prices.
4. 80/20 on institute-owned eligible sales (gross catalog paise), integer arithmetic.
5. No access to paid tests before verified payment.
6. Server scores exams; server clocks attempts.
7. Students never auto-become institute admins.
8. No mock payments on production paths.

---

## After each phase

Run relevant tests/builds, fix regressions, summarize files and remaining gaps. Do not claim deploy success unless it was executed and verified.
