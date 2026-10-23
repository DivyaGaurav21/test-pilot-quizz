# Security Findings

## Severity: High
### Broken JWT propagation in the client
The frontend API client was attaching a malformed Authorization header instead of the actual JWT. This causes protected routes to fail even when the user is logged in and undermines the security boundary of authenticated APIs.

Mitigation:
- Send `Authorization: 'Bearer ' + token` from the shared axios interceptor.
- Validate the server side that the provided token is present and valid before any protected action.

## Severity: High
### Weak admin authorization model
Admin access was enforced by checking only `req.user.email === process.env.ADMIN_EMAIL`. This is brittle and fails if a user is assigned the `admin` role through a proper RBAC flow, and it can also permit a user by email even when role checks should fail.

Mitigation:
- Use a structured role check (`req.user.role === 'admin'`) as the primary rule.
- Keep a safe email fallback only as a compatibility override, not the primary truth source.

## Severity: Medium
### Client-side answer data was trusted during scoring
The exam submission flow accepted unvalidated answer payloads and scored them directly without checking whether the submitted keys belonged to the actual exam questions or whether the answer values were legitimate options.

Mitigation:
- Normalize the incoming answer payload on the server.
- Ignore invalid question IDs and option values before calling the scoring utility.
- Keep the scoring logic server-owned and deterministic.

## Severity: Medium
### No automated regression tests for auth and role boundaries
Without a test suite covering admin guards, JWT propagation, and result validation, regressions slip into production easily.

Mitigation:
- Add Node test coverage for admin middleware and result logic.
- Run the tests in CI and on release branches before deployment.

## Resolved in Phase 2
### Institute ownership and access boundaries
Institute ownership is recorded on exams, questions, and submitted results. Institute management endpoints require an approved owner and scope exam mutations and result reads to that owner's institute. Published exams are intentionally public; unpublished exams are not returned by public exam endpoints. Legacy records remain unowned and unchanged. Orders and separate attempt records are not modeled yet and therefore are not covered by institute ownership.
