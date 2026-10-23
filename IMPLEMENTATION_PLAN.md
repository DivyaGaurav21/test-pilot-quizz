# Implementation Plan

## Phase 1: Stabilize the foundation
- Fix broken JWT propagation from React to the backend
- Normalize admin authorization to use the authenticated role and safe email fallback
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
- Implement subscription plans (monthly/yearly) with active/past-due/expired states
- Enforce a three-lifetime-free-test quota per institute with a concurrency-safe ledger
- Add paid-test publishing entitlements and audit logging for publication decisions
- Track revenue, commission, payout balances, and platform-level reporting

## Phase 4: Production-readiness and security
- Centralize authorization helpers, request validation, and structured error handling
- Introduce audit logs for admin actions and security events
- Add secure secret management, environment validation, and deployment hardening
- Review external dependencies, CORS, rate limiting, and session handling

## Phase 5: Delivery and rollout
- Migrate data safely without deleting or corrupting existing records
- Add release checks, smoke tests, and rollback plans
- Validate student flows, payment flows, and admin approvals before broad rollout
- Track live metrics for attempts, purchases, and institute onboarding

## Notes
This repository is already a functional starter, so the priority is to harden the existing app while preserving current exams, results, and routes. The business rules in the original SaaS brief should be applied in later phases without deleting or rewriting existing working behavior.
