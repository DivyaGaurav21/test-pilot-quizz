# Security Findings

## Resolved in Phase 1
### Broken JWT propagation in the client
The frontend API client was attaching a malformed Authorization header instead of the actual JWT. This causes protected routes to fail even when the user is logged in and undermines the security boundary of authenticated APIs.

The shared interceptor now sends the bearer token and protected endpoints validate it.

### Weak admin authorization model
Admin access was enforced by checking only `req.user.email === process.env.ADMIN_EMAIL`. This is brittle and fails if a user is assigned the `admin` role through a proper RBAC flow, and it can also permit a user by email even when role checks should fail.

Global administrator authorization uses explicit roles only. Public registration never grants an administrator role based on an email address; the initial SUPER_ADMIN is provisioned by an operator-run command. Monetization and finance operations require the `super_admin` role.

### Client-side answer data was trusted during scoring
The exam submission flow accepted unvalidated answer payloads and scored them directly without checking whether the submitted keys belonged to the actual exam questions or whether the answer values were legitimate options.

Exam answers are sanitized against persisted question IDs and valid options before server-side scoring.

### No automated regression tests for auth and role boundaries
Without a test suite covering admin guards, JWT propagation, and result validation, regressions slip into production easily.

The backend now has Node tests for admin gates, institute ownership, publication entitlements, financial calculations, rounding, refunds, and payout balances. CI wiring remains deployment work.

## Resolved in Phase 2
### Institute ownership and access boundaries
Institute ownership is recorded on exams, questions, and submitted results. Institute management endpoints require an approved owner and scope exam mutations and result reads to that owner's institute. Published exams are intentionally public; unpublished exams are not returned by public exam endpoints. Legacy records remain unowned and unchanged.

## Current operational limitation
Live payment gateway and bank-transfer integrations are not configured. SUPER_ADMINs manually verify payments and reconcile payouts; see [FINANCIAL_POLICY.md](./FINANCIAL_POLICY.md).
