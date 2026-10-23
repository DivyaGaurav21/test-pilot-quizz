# Implementation Plan

## Phase 1: Stabilize the foundation
- Fix broken JWT propagation from React to the backend
- Normalize admin authorization to use explicit authenticated roles
- Add backend validation for exam submissions and reject invalid answer payloads
- Add a minimal automated test suite for auth/admin checks and result calculations
- Document environment requirements and deployment constraints

## Phase 2: Harden the product core
- [x] Add institute ownership to exams, questions, and submitted results. The current application has no orders or separate attempts collections to scope.
- [x] Add institute registration and global-admin approval with pending, approved, rejected, and suspended statuses.
- [x] Enforce approved-owner access and institute-scoped exam/result queries; preserve global-admin access.
- [x] Keep published exams public while allowing approved owners to unpublish their own exams. Legacy records remain unowned and unchanged.
- [x] Add institute application and owner exam-management screens.

## Phase 3: Add SaaS operations and monetization
- [x] Add configurable monthly/yearly subscription plans with pending, active, past-due, and expired states; activate only after SUPER_ADMIN payment verification.
- [x] Enforce three lifetime free publications and subscription-period limits atomically; drafts do not count and unpublishing does not restore quota.
- [x] Add paid exam purchase verification, immutable financial ledger entries, commission/refund/fee/tax accounting, and publication audit events.
- [x] Add institute payout requests, SUPER_ADMIN approval and manual reconciliation states, minimum threshold, and platform financial summaries.
- [x] Document initial financial rules and the gateway/bank reconciliation boundaries in [FINANCIAL_POLICY.md](./FINANCIAL_POLICY.md).

## Phase 4: Product experience and role dashboards
- [x] Disable Google sign-in and keep email/password authentication.
- [x] Add learner/institute signup selection; institute signup creates a pending application for SUPER_ADMIN review.
- [x] Add a landing page with six recent published tests and six popular approved institutes.
- [x] Add separate learner result, institute, admin, and SUPER_ADMIN review/finance experiences.
- [x] Add public institute, pricing, blog, and about routes with responsive navigation and footer.
- [x] Expose admin-only student details, test-attempt metrics, and recorded revenue summaries.

## Phase 5: Production-readiness and security
- Centralize authorization helpers, request validation, and structured error handling
- Introduce audit logs for admin actions and security events
- Add secure secret management, environment validation, and deployment hardening
- Review external dependencies, CORS, rate limiting, and session handling

## Phase 6: Delivery and rollout
- Migrate data safely without deleting or corrupting existing records
- Add release checks, smoke tests, and rollback plans
- Validate student flows, payment flows, and admin approvals before broad rollout
- Track live metrics for attempts, purchases, and institute onboarding

## Notes
This repository is a functional starter. Changes preserve legacy public exams/results and treat existing records without `instituteId` as platform-owned/unowned. Live gateway and bank-transfer integrations remain deferred; see [FINANCIAL_POLICY.md](./FINANCIAL_POLICY.md) for the current manual-verification boundaries.
