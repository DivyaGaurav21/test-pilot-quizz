# Codebase Audit

## Project overview
This repository is a MERN-based online-test platform starter with a Vite React frontend and an Express/Mongoose backend. The application already includes authentication, exam publishing and intake flows, result generation, PDF export, and an admin import pipeline. The code is structured around a small but clear domain model:

- Users: local or Google-authenticated users with `user`/`admin` roles
- Exams: title, subject, topic, difficulty, duration, question count, publication flag
- Questions: exam-scoped MCQ records with answer key and explanations
- Results: scored attempt metadata generated after exam submission

## Current state by layer

### Frontend
- React 19 + Vite + Tailwind client under `client/src`
- Router-based pages for landing, auth, profiles, exam instructions, results, and admin import/dashboard
- Auth context stores JWT in `localStorage` and exposes `isAuthenticated` and `isAdmin`
- Exam flow supports question navigation, timed exams, review marking, and result summaries
- Admin import UI expects JSON payloads matching a schema and sends them to `/api/admin/import-json`

### Backend
- Express server in `server/app.js` and `server/server.js`
- Authentication and exam routes are mounted under `/api/auth`, `/api/exams`, `/api/results`, and `/api/admin`
- Mongoose models live under `server/models`
- Business logic is split into controllers and a small set of service/util modules
- Result calculation is centralized in `server/utils/calculateResult.js`

## Notable strengths
- Clear separation between API routes, controllers, models, and utilities
- Role-based admin API gating is already present in the route layer
- Security-conscious exam submission pattern avoids exposing correct answers in the start API
- Exam import pipeline validates payloads before database writes
- PDF result generation logic is loosely separated from the HTTP layer

## Known issues and risks
1. Authentication header bug in the client API layer: the interceptor was constructing a malformed Authorization header instead of sending the actual JWT. This prevents authenticated requests from reaching the backend reliably.
2. Admin authorization was incorrectly coupled to the configured `ADMIN_EMAIL` value instead of using the authenticated user role. A user with the `admin` role could be denied while a non-admin with the matching email could pass.
3. Exam submissions accepted client-supplied answer objects without validating that the submitted keys reflect real question IDs or valid option values. This creates a tampering risk and should be sanitized server-side before scoring.
4. The repo has no automated test suite or CI check for backend/auth safety, so regressions are not caught early.
5. Institute ownership is now available for exams, questions, and submitted results, with approval-gated institute management. Orders and separate attempt records are not modeled in the current application; subscription and billing concerns remain future work.

## Suggested next steps
- Repair the JWT auth/header flow and server-side authorization
- Harden answer validation and result generation
- Add role-based tests for admin guards and scoring logic
- Move from a single-tenant application toward institute ownership and entitlement tracking
- Expand docs and deployment configuration before production rollout
