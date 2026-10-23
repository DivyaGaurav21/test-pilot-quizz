# Test Pilot — Codebase Audit (Phase 0)

**Repository:** https://github.com/DivyaGaurav21/test-pilot-quizz  
**Inspected commit:** `b1c0355` (`fix/final`) on `master`  
**Local backup branch:** `backup/pre-saas-transformation`  
**Working branch:** `feat/saas-platform`  
**Audit date:** 2026-10-23  

This audit describes the code as it exists. No production deployment was performed as part of this audit.

---

## 1. Repository layout

```
test-pilot-quizz/
  package.json              # root orchestrator (concurrently)
  README.md
  sample-exam.json          # sample payload (does not match current importer)
  client/                   # React 19 + Vite + Tailwind 4
  server/                   # Express 5 + Mongoose 8
```

There is no `vercel.json`, `render.yaml`, Dockerfile, GitHub Actions workflow, or other deployment manifest in the repository. Compatibility with Vercel (frontend), Render (backend), and MongoDB Atlas is therefore inferred from the stack, not verified against live services.

---

## 2. Stack and scripts

| Area | Stack |
| --- | --- |
| Frontend | React 19.1, React Router 7, Vite 7, Tailwind 4 (`@tailwindcss/vite`), Axios, `@react-oauth/google` (declared; GIS script used directly) |
| Backend | Node (CommonJS), Express 5.1, Mongoose 8.18, bcryptjs, jsonwebtoken, google-auth-library, pdfkit, cors, dotenv |
| Database | MongoDB via `MONGODB_URI` |
| Tests | **None.** No Jest/Vitest/Mocha config, no `*.test.*` / `*.spec.*` files, no `test` npm scripts |

### Scripts

Root:

- `install-all` — install root, client, and server
- `dev` — `concurrently` server + client

Client:

- `dev` / `build` / `preview`

Server:

- `start` — `node server.js`
- `dev` — nodemon

---

## 3. Commands actually run during this audit

| Command | Result |
| --- | --- |
| `node -v` | `v24.13.1` |
| `npm -v` | `11.8.0` |
| `npm install` (root) | Succeeded; 0 vulnerabilities |
| `npm install --prefix client` | Succeeded |
| `npm install --prefix server` | Succeeded; 0 vulnerabilities; deprecation warnings for `jpeg-exif`, `node-domexception`, `crypto-js` |
| `npm audit --prefix client` | **3 high** (`follow-redirects`, `source-map-js`, `vite` 7.3.6) |
| `npm run build --prefix client` | **Succeeded** (Vite 7.3.6, 2.16s) |
| Backend tests | **Not run** — no test script or test files exist |
| Server start / live API | **Not run** — no local `.env` or MongoDB URI was present |
| Deployment | **Not performed** |

---

## 4. Existing product features

Working (or intended) features in the current app:

1. **Local registration and login** with bcrypt-hashed passwords and JWT.
2. **Google Identity Services** login (ID token verified on the server with `google-auth-library`).
3. **Role model:** `user` | `admin`. Admin is bootstrapped when email matches `ADMIN_EMAIL`.
4. **Public exam catalog** (`GET /api/exams`) — published exams only.
5. **Timed MCQ exam** — client timer, question navigation, answer selection, submit.
6. **Server-side scoring** via `calculateResult` (does not trust client score).
7. **Result detail + PDF download** (pdfkit).
8. **Admin JSON import** of exam + questions.
9. **Admin dashboard** — all results (unpaginated), delete exam.
10. **Hindi/English** UI via `LanguageContext`.
11. **Profile page** (display only).

Not present (required for the SaaS vision):

- Institutes, applications, approval, suspension
- `SUPER_ADMIN` / `INSTITUTE_ADMIN` / `STUDENT` as first-class roles
- Tenant isolation (`instituteId`)
- Lifetime free publication quota
- Subscriptions, plans, entitlements
- Marketplace purchase of individual tests
- Orders, payment gateway, webhooks
- 80/20 financial ledger, refunds, payouts
- Dedicated attempt records, server-side expiry, autosave
- Audit logs, dashboards as specified, pagination
- Password reset / email verification (UI link exists; no route or API)

---

## 5. Authentication and authorization (as implemented)

| Item | Current behavior |
| --- | --- |
| Mechanism | JWT signed with `JWT_SECRET`, `{ id: userId }`, expiry **7 days** |
| Transport | `Authorization: Bearer <token>` |
| Client storage | **`localStorage.token`** |
| Cookies | Not used for auth |
| Google OAuth | GIS `id.initialize` + `renderButton`; credential posted to `POST /api/auth/google` as `idToken`; server `verifyIdToken` |
| Admin gate (API) | `adminAuth` compares `req.user.email !== process.env.ADMIN_EMAIL` (**case-sensitive**) |
| Admin gate (UI) | `user.role === 'admin'` |
| Password hashing | bcrypt, salt 10; `password` has `select: false` |
| Password policy (API) | None (empty/short passwords allowed except Mongoose required) |
| Password policy (UI) | Min length 6 on register only |
| `/api/auth/me` | Returns id, name, email, role, authProvider — **not** `createdAt` |

`protect` loads the user from the database after verifying the JWT. Role is not taken from the token payload. That part is sound.

---

## 6. Data models

### User

`name`, `email` (unique, lowercase), `password` (required if local), `authProvider` (`local`|`google`), `role` (`user`|`admin`). No `googleId` field despite commented ESM code. No institute membership.

### Exam

`title`, `subject`, `topic`, `difficulty`, `duration` (minutes), `totalQuestions`, `isPublished` (default **true**). No owner, institute, price, status (draft/archived), category, or attempt limit.

### Question

`examId`, `question`, `options` (exactly 4), `correctAnswer` (string), `explanation`, `marks` (default 1). No institute ownership. Public start endpoint strips `correctAnswer` and `explanation`.

### Result

`userId`, `examId`, score fields, `timeTaken`, `submittedAt`. **Does not store submitted answers.** No attempt id. Duplicate submits create duplicate results.

---

## 7. API surface

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/health` | public | |
| POST | `/api/auth/register` | public | Assigns `admin` if email matches `ADMIN_EMAIL` |
| POST | `/api/auth/login` | public | Local provider only |
| POST | `/api/auth/google` | public | |
| GET | `/api/auth/me` | JWT | |
| GET | `/api/exams` | public | All published exams, no pagination |
| GET | `/api/exams/:id` | public | Metadata only (no questions) |
| POST | `/api/exams/:id/start` | JWT | Returns questions without keys |
| POST | `/api/exams/:id/submit` | JWT | Scores on server; trusts `timeTaken` |
| GET | `/api/results` | JWT | Current user's results |
| GET | `/api/results/:id` | JWT | Scoped to `userId` |
| GET | `/api/results/:id/pdf` | JWT | Scoped to `userId` |
| POST | `/api/admin/import-json` | JWT + admin email | Auto-publishes |
| GET | `/api/admin/results` | JWT + admin email | All results, no pagination |
| DELETE | `/api/admin/exams/:id` | JWT + admin email | Deletes questions; **leaves results** |

JSON body limit: 2mb.

---

## 8. Frontend routes and gaps

Implemented in `App.jsx`: `/`, `/login`, `/register`, `/exams`, `/exams/:id/instructions`, `/exams/:id/start`, `/results/:id`, `/profile`, `/admin`, `/admin/import`.

Broken or missing relative to the UI:

- Profile “View Results” links to **`/results`**, which has **no route**.
- Login “Forgot password” links to **`/forgot-password`**, which has **no route or API**.
- Register links to **`/terms`**, which has **no route**.
- `ExamPage` defines `toggleReview` / `setMarkedForReview` but **never declares that state** and **never renders a mark-for-review control**. Translations include “Mark for Review”.
- Exam session lives only in React context; **refresh loses the attempt**.
- `rememberMe` on login is unused.
- `APP_NAME` is `TestForge`; logo alt is `Test Hub`; README is “Online Test Platform”.

---

## 9. Exam engine behavior

**Scoring (preserve):** +marks for exact string match of `correctAnswer`; unanswered if empty; otherwise wrong. No negative marking. Percentage = `score / totalMarks * 100`, rounded to 2 decimals.

**Timing:** Client-only `ExamTimer`. `timeTaken` is `Date.now() - examStartedAt` from the browser and is stored as-is. Server does not enforce duration.

**Timer bug:** `ExamTimer` restarts its interval whenever `remainingSeconds` or `onTimeUp` changes. `onTimeUp` is `handleSubmit`, which also shows `window.confirm` — auto-submit on timeout is unreliable.

**Start:** No attempt document; any authenticated user can start any published exam.

**Submit:** Not idempotent. No race protection. Answers are not persisted on the result.

**JSON import:** Backend validator requires `exam`, `subject`, `duration`, questions with 4 options, `correctAnswer` **string matching an option**, and `explanation`. Root `sample-exam.json` uses `time` instead of `duration` and numeric `correctAnswer` — **it would fail import**. In-app sample JSON is valid.

**Import transactions:** `importExam` uses MongoDB transactions (requires replica set / Atlas). `deleteExam` does not use a transaction.

---

## 10. Environment variables (inferred; no `.env.example` in repo)

README instructs `cp client/.env.example` and `cp server/.env.example`, but **those files are missing**.

| Variable | Where used |
| --- | --- |
| `PORT` | server listen (default 5000) |
| `MONGODB_URI` | mongoose |
| `JWT_SECRET` | sign/verify JWT (crash/fail if unset at verify time) |
| `CLIENT_URL` | CORS origin (default `http://localhost:5173`) |
| `ADMIN_EMAIL` | admin bootstrap + `adminAuth` |
| `GOOGLE_CLIENT_ID` | ID token audience |
| `VITE_API_URL` | Axios base URL |
| `VITE_GOOGLE_CLIENT_ID` | GIS button |

`.gitignore` covers `.env`, `client/.env`, `server/.env`. No secrets were found committed.

---

## 11. Duplication and dead code

- Large blocks of commented ESM (`import`/`export`) in auth controller, models, `useAuth`, `ProtectedRoute`, `authService`.
- `server/services/authService.js` is a stub (`export {}`) in a CommonJS project.
- Unused `User` import in `resultController.js`.
- Dual exam fetch paths: `useExam` hook and `ExamContext`.
- Frontend and backend JSON validators duplicated.

---

## 12. Compatibility notes for the SaaS work

- **Do not rename** `/api/exams`, `/api/results`, `/api/auth`, `/api/admin` without aliases; existing clients and bookmarks use them.
- **Do not drop** JWT Bearer auth in one step; frontend and Google flow both depend on `localStorage` + interceptor.
- **Existing `role: user|admin` documents** must keep working. Map `admin` → platform super-admin and `user` → student without deleting data.
- **Existing exams** have no `instituteId`. Treat them as platform-owned after a backward-compatible default.
- **Existing results** must remain readable; adding fields is safer than rewriting history.
- Import currently **auto-publishes**. Quota logic must not silently consume entitlements for historical exams without an explicit migration policy.

---

## 13. Branding

Product name in this initiative: **Test Pilot**. Current UI/branding is mixed (Test Hub / TestForge / Online Test Platform). Phase 5 should align copy without breaking routes.
