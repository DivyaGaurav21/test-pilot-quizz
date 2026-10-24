# API cURL guide (Postman)

Use these requests to test the Express API. In Postman, choose **Import → Raw text** and paste a request, or create requests manually. Replace `{{baseUrl}}` and ID/token placeholders with Postman environment values.

For direct use in Windows PowerShell, invoke `curl.exe` (PowerShell's `curl` may resolve to a different command) and replace each `{{...}}` placeholder with its actual value.

## Environment

Create a Postman environment with:

| Variable | Example |
| --- | --- |
| `baseUrl` | `http://localhost:5000` |
| `userToken` | JWT returned by user or institute registration/login |
| `adminToken` | JWT for an operator-provisioned `admin` account |
| `superAdminToken` | JWT for an operator-provisioned `super_admin` account |
| `examId` | A published exam MongoDB ID returned by the exams API |
| `questionId` | Question `_id` returned by starting the exam |
| `resultId` | Result `_id` returned by submission |
| `instituteId` | Institute `_id` returned by institute signup or admin review |
| `subscriptionId` | Subscription `_id` returned by a subscription request |
| `purchaseId` | Purchase `_id` returned by a purchase request |
| `payoutId` | Payout `_id` returned by a payout request |

Protected requests use `Authorization: Bearer <JWT>`. Copy the `token` from a successful register/login response into the matching environment variable. IDs are MongoDB ObjectIds; copy real IDs from API responses rather than using the example labels literally.

**Roles:** regular users can use learner endpoints; approved institute owners can use institute finance/content endpoints; `admin` can use admin dashboard endpoints; `super_admin` can review institutes and use finance administration. Public registration accepts `user` or `institute` account types; institute signups create pending applications. The configured `SUPER_ADMIN_EMAIL` receives the `super_admin` role when that email registers; other admin accounts remain operator-provisioned. Google authentication is currently disabled.

Money values in request bodies are integer minor currency units (`pricePaise`, for example INR ₹20.00 = `2000`).

## Suggested test order

1. Check health and public routes.
2. Register a learner and an institute, or log in to existing accounts.
3. Use a superadmin token to approve the institute application.
4. Use the approved institute token to request a subscription if you need quota for publishing.
5. Create and publish an institute test, or use an existing published exam.
6. Start and submit the exam as a learner.
7. Use admin/superadmin endpoints for reporting, review, payment verification, adjustments, and payouts.

Institute publication, subscription verification, purchases, and payout operations use MongoDB transactions. The database must support transactions (for example, run as a replica set).

## Health and public routes

```bash
curl --location '{{baseUrl}}/api/health'
curl --location '{{baseUrl}}/api/exams'
curl --location '{{baseUrl}}/api/exams/{{examId}}'
curl --location '{{baseUrl}}/api/institutes/popular'
curl --location '{{baseUrl}}/api/finance/plans'
```

## Authentication

Register a learner:

```bash
curl --location --request POST '{{baseUrl}}/api/auth/register' --header 'Content-Type: application/json' --data-raw '{"name":"Asha Learner","email":"asha.learner@example.com","password":"TestPass123!","accountType":"user"}'
```

Register an institute account. Use the same email for sign-in and institute contact; the application remains **pending** until a superadmin approves it. A new account whose email matches `SUPER_ADMIN_EMAIL` is assigned the superadmin role:

```bash
curl --location --request POST '{{baseUrl}}/api/auth/register' --header 'Content-Type: application/json' --data-raw '{"name":"Ravi Sharma","email":"ravi.owner@example.com","password":"TestPass123!","accountType":"institute","instituteName":"Sample Learning Center"}'
```

Log in:

```bash
curl --location --request POST '{{baseUrl}}/api/auth/login' --header 'Content-Type: application/json' --data-raw '{"email":"asha.learner@example.com","password":"TestPass123!"}'
```

Get the current authenticated account:

```bash
curl --location '{{baseUrl}}/api/auth/me' --header 'Authorization: Bearer {{userToken}}'
```

## Exam and learner result endpoints

Start a published exam. A paid exam requires a verified purchase first. The response contains question IDs and options, but does not reveal correct answers:

```bash
curl --location --request POST '{{baseUrl}}/api/exams/{{examId}}/start' --header 'Authorization: Bearer {{userToken}}'
```

Submit answers using the question `_id` and one of the exact option strings returned by `start`. `timeTaken` is seconds:

```bash
curl --location --request POST '{{baseUrl}}/api/exams/{{examId}}/submit' --header 'Authorization: Bearer {{userToken}}' --header 'Content-Type: application/json' --data-raw '{"answers":{"{{questionId}}":"60"},"timeTaken":95}'
```

List the signed-in learner's results:

```bash
curl --location '{{baseUrl}}/api/results' --header 'Authorization: Bearer {{userToken}}'
```

Get one of the learner's results:

```bash
curl --location '{{baseUrl}}/api/results/{{resultId}}' --header 'Authorization: Bearer {{userToken}}'
```

Download a result PDF:

```bash
curl --location '{{baseUrl}}/api/results/{{resultId}}/pdf' --header 'Authorization: Bearer {{userToken}}' --output result.pdf
```

## Institute endpoints

The public popular-institutes endpoint does not require a token. All other institute endpoints require login; exam/result/subscription/finance management requires an **approved** institute owner.

Get the signed-in user's institute application:

```bash
curl --location '{{baseUrl}}/api/institutes/me' --header 'Authorization: Bearer {{userToken}}'
```

Submit or re-submit an institute application for an already registered account. The institute contact email is taken from the authenticated account:

```bash
curl --location --request POST '{{baseUrl}}/api/institutes/register' --header 'Authorization: Bearer {{userToken}}' --header 'Content-Type: application/json' --data-raw '{"name":"Sample Learning Center"}'
```

List the approved owner's exams:

```bash
curl --location '{{baseUrl}}/api/institutes/me/exams' --header 'Authorization: Bearer {{userToken}}'
```

Create an institute-owned draft exam with one question. `correctAnswer` must exactly match one of the four option strings; `explanation` is required:

```bash
curl --location --request POST '{{baseUrl}}/api/institutes/me/exams/import-json' --header 'Authorization: Bearer {{userToken}}' --header 'Content-Type: application/json' --data-raw '{"exam":"Sample Percentage Test","subject":"Mathematics","topic":"Percentages","difficulty":"Easy","duration":30,"pricePaise":2000,"isPublished":false,"questions":[{"question":"What is 25% of 240?","options":["40","50","60","80"],"correctAnswer":"60","explanation":"25% is one quarter; 240 divided by 4 is 60."}]}'
```

Set a draft's price, publish it, or unpublish it. Publishing consumes one available free/subscription publication:

```bash
curl --location --request PATCH '{{baseUrl}}/api/institutes/me/exams/{{examId}}' --header 'Authorization: Bearer {{userToken}}' --header 'Content-Type: application/json' --data-raw '{"pricePaise":2000,"isPublished":true}'
```

Get learner results for the approved institute's exams:

```bash
curl --location '{{baseUrl}}/api/institutes/me/results' --header 'Authorization: Bearer {{userToken}}'
```

## Admin dashboard and institute review

These dashboard endpoints require an `admin` or `super_admin` JWT:

```bash
curl --location '{{baseUrl}}/api/admin/overview' --header 'Authorization: Bearer {{adminToken}}'
curl --location '{{baseUrl}}/api/admin/students' --header 'Authorization: Bearer {{adminToken}}'
curl --location '{{baseUrl}}/api/admin/results' --header 'Authorization: Bearer {{adminToken}}'
```

Import a platform-owned exam (admin or superadmin):

```bash
curl --location --request POST '{{baseUrl}}/api/admin/import-json' --header 'Authorization: Bearer {{adminToken}}' --header 'Content-Type: application/json' --data-raw '{"exam":"Sample Admin Test","subject":"General Knowledge","topic":"Geography","difficulty":"Easy","duration":20,"pricePaise":0,"isPublished":true,"questions":[{"question":"Which is the largest ocean?","options":["Atlantic","Indian","Arctic","Pacific"],"correctAnswer":"Pacific","explanation":"The Pacific Ocean is the largest ocean on Earth."}]}'
```

List institute applications (optional status query: `pending`, `approved`, `rejected`, or `suspended`) and review an application. These two endpoints require a **superadmin** JWT:

```bash
curl --location '{{baseUrl}}/api/admin/institutes?status=pending' --header 'Authorization: Bearer {{superAdminToken}}'
curl --location --request PATCH '{{baseUrl}}/api/admin/institutes/{{instituteId}}' --header 'Authorization: Bearer {{superAdminToken}}' --header 'Content-Type: application/json' --data-raw '{"status":"approved","rejectionReason":""}'
```

Delete a test (admin or superadmin). This is destructive: it deletes the exam and its questions. Only use it on disposable test data:

```bash
curl --location --request DELETE '{{baseUrl}}/api/admin/exams/{{examId}}' --header 'Authorization: Bearer {{adminToken}}'
```

## Subscription, exam purchase, and institute finance

Create a paid exam purchase request as the learner who will take the test:

```bash
curl --location --request POST '{{baseUrl}}/api/finance/exams/{{examId}}/purchases' --header 'Authorization: Bearer {{userToken}}'
```

Get the approved institute's subscription/quota information and create a monthly or yearly subscription request:

```bash
curl --location '{{baseUrl}}/api/finance/institute/subscription' --header 'Authorization: Bearer {{userToken}}'
curl --location --request POST '{{baseUrl}}/api/finance/institute/subscription' --header 'Authorization: Bearer {{userToken}}' --header 'Content-Type: application/json' --data-raw '{"plan":"monthly"}'
```

Get institute ledger, payouts, and available balance:

```bash
curl --location '{{baseUrl}}/api/finance/institute/ledger' --header 'Authorization: Bearer {{userToken}}'
```

Request a payout. The example is ₹1,000 = 100000 paise; it must also be within available balance:

```bash
curl --location --request POST '{{baseUrl}}/api/finance/institute/payouts' --header 'Authorization: Bearer {{userToken}}' --header 'Content-Type: application/json' --data-raw '{"amountPaise":100000}'
```

## Superadmin finance operations

Get and update platform monetization settings. `commissionBasisPoints: 2000` means 20%; supported schedules are `weekly`, `monthly`, `quarterly`, `on_demand`, and payout modes must remain `manual` or `manual_batch`:

```bash
curl --location '{{baseUrl}}/api/finance/admin/settings' --header 'Authorization: Bearer {{superAdminToken}}'
curl --location --request PUT '{{baseUrl}}/api/finance/admin/settings' --header 'Authorization: Bearer {{superAdminToken}}' --header 'Content-Type: application/json' --data-raw '{"currency":"INR","monthlyPlan":{"pricePaise":49900,"durationMonths":1,"publicationLimit":20},"yearlyPlan":{"pricePaise":499900,"durationMonths":12,"publicationLimit":240},"freePublicationLimit":3,"commissionBasisPoints":2000,"minimumPayoutPaise":100000,"payoutSchedule":"monthly","payoutMode":"manual"}'
```

List finance records and summary:

```bash
curl --location '{{baseUrl}}/api/finance/admin/records' --header 'Authorization: Bearer {{superAdminToken}}'
```

Verify a subscription payment (payment reference must represent an actually verified offline payment):

```bash
curl --location --request PATCH '{{baseUrl}}/api/finance/admin/subscriptions/{{subscriptionId}}/verify' --header 'Authorization: Bearer {{superAdminToken}}' --header 'Content-Type: application/json' --data-raw '{"paymentReference":"TEST-OFFLINE-RECEIPT-001"}'
```

Mark an active subscription `past_due` or `expired`:

```bash
curl --location --request PATCH '{{baseUrl}}/api/finance/admin/subscriptions/{{subscriptionId}}/status' --header 'Authorization: Bearer {{superAdminToken}}' --header 'Content-Type: application/json' --data-raw '{"status":"past_due"}'
```

Verify a paid exam purchase:

```bash
curl --location --request PATCH '{{baseUrl}}/api/finance/admin/purchases/{{purchaseId}}/verify' --header 'Authorization: Bearer {{superAdminToken}}' --header 'Content-Type: application/json' --data-raw '{"paymentReference":"TEST-OFFLINE-RECEIPT-002"}'
```

Record an exam-purchase adjustment. `type` must be `refund`, `chargeback`, `gateway_fee`, or `tax`; amount is positive integer paise:

```bash
curl --location --request POST '{{baseUrl}}/api/finance/admin/purchases/{{purchaseId}}/adjustments' --header 'Authorization: Bearer {{superAdminToken}}' --header 'Content-Type: application/json' --data-raw '{"type":"refund","amountPaise":500,"notes":"Test partial refund","reference":"TEST-REFUND-001"}'
```

Record a subscription adjustment:

```bash
curl --location --request POST '{{baseUrl}}/api/finance/admin/subscriptions/{{subscriptionId}}/adjustments' --header 'Authorization: Bearer {{superAdminToken}}' --header 'Content-Type: application/json' --data-raw '{"type":"refund","amountPaise":10000,"notes":"Test subscription refund","reference":"TEST-SUB-REFUND-001"}'
```

Move a payout through `approved` → `processing` → `paid`. `confirmationReference` is required for `paid`. To release a reservation after failure, use `failed` with a reason:

```bash
curl --location --request PATCH '{{baseUrl}}/api/finance/admin/payouts/{{payoutId}}' --header 'Authorization: Bearer {{superAdminToken}}' --header 'Content-Type: application/json' --data-raw '{"status":"approved"}'
curl --location --request PATCH '{{baseUrl}}/api/finance/admin/payouts/{{payoutId}}' --header 'Authorization: Bearer {{superAdminToken}}' --header 'Content-Type: application/json' --data-raw '{"status":"processing"}'
curl --location --request PATCH '{{baseUrl}}/api/finance/admin/payouts/{{payoutId}}' --header 'Authorization: Bearer {{superAdminToken}}' --header 'Content-Type: application/json' --data-raw '{"status":"paid","confirmationReference":"TEST-BANK-TRANSFER-001"}'
curl --location --request PATCH '{{baseUrl}}/api/finance/admin/payouts/{{payoutId}}' --header 'Authorization: Bearer {{superAdminToken}}' --header 'Content-Type: application/json' --data-raw '{"status":"failed","failureReason":"Test transfer was not sent"}'
```

## Notes

- Example emails use the reserved `.example` domain; replace them with addresses you control when testing registration.
- IDs shown as `{{...Id}}` and tokens are Postman variables/placeholders, not literal IDs.
- A newly registered institute must be approved before institute content, subscription, and payout routes work.
- The public finance plans route returns configurable current values. The request to modify plans is restricted to superadmin.
- The API records manual/offline payment verification; these examples do not initiate a payment or bank transfer.
- `GET /api/finance/admin/records`, admin student/result endpoints, and institute result endpoints return real database data; use a test database for integration testing.
