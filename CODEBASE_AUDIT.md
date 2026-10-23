# Codebase Audit

## Project overview
This repository is a MERN-based online-test platform starter with a Vite React frontend and an Express/Mongoose backend. The application already includes authentication, exam publishing and intake flows, result generation, PDF export, and an admin import pipeline. The code is structured around a small but clear domain model:

- Users: local or Google-authenticated users with `user`/`admin`/`super_admin` roles
- Institutes: owner-scoped organizations with approval states and subscription entitlements
- Exams: title, subject, topic, difficulty, duration, question count, publication state, price, and optional institute ownership
- Questions: exam-scoped MCQ records with answer key and explanations
- Results: scored attempt metadata generated after exam submission
- Finance: subscription requests, exam purchase records, immutable ledger entries, publication events, and manual payout states

## Current state by layer

### Frontend
- React 19 + Vite + Tailwind client under `client/src`
- Router-based pages for landing, auth, profiles, exam instructions, results, institute portal, and admin finance/dashboard
- Auth context stores JWT in `localStorage` and exposes `isAuthenticated` and `isAdmin`
- Exam flow supports question navigation, timed exams, review marking, and result summaries
- Admin import UI expects JSON payloads matching a schema and sends them to `/api/admin/import-json`

### Backend
- Express server in `server/app.js` and `server/server.js`
- Authentication, exam, result, institute, and finance routes are mounted under `/api/auth`, `/api/exams`, `/api/results`, `/api/admin`, `/api/institutes`, and `/api/finance`
- Mongoose models live under `server/models`
- Business logic is split into controllers and a small set of service/util modules
- Result calculation is centralized in `server/utils/calculateResult.js`

## Notable strengths
- Clear separation between API routes, controllers, models, and utilities
- Role-based admin API gating is already present in the route layer
- Security-conscious exam submission pattern avoids exposing correct answers in the start API
- Exam import pipeline validates payloads before database writes
- PDF result generation logic is loosely separated from the HTTP layer

## Current limitations
1. Payment collection is manual pending a selected payment provider. Only SUPER_ADMIN-verified references activate subscriptions and paid exam purchases; there are no gateway callbacks or automated bank transfers.
2. Taxes, gateway fees, refunds, and chargebacks are recorded as manual ledger adjustments and require human reconciliation.
3. Orders and a separate exam-attempt entity do not exist; verified exam purchases and result records provide the current marketplace/access path.
4. Currency conversion and payout execution through banks are intentionally unsupported.

## Suggested next steps
- Select and integrate a payment provider with signed webhook verification and idempotent payment handling
- Add release/migration checks for existing deployments and monitor publication, billing, and payout reconciliations
- Expand production deployment and operational documentation
