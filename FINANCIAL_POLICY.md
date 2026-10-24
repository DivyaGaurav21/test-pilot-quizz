# Subscription, marketplace, and payout policy

## Initial configuration

The SUPER_ADMIN-managed defaults are:

| Setting | Initial value |
| --- | ---: |
| Currency | INR |
| Monthly subscription | ₹499 for 1 calendar month; 20 publications |
| Yearly subscription | ₹4,999 for 12 calendar months; 240 publications |
| Lifetime free publications | 3 per institute |
| Platform commission | 20% |
| Institute share | 80% |
| Minimum payout | ₹1,000 |
| Payout schedule and mode | Monthly, manual SUPER_ADMIN approval and reconciliation |

These are configurable defaults, not hard-coded entitlement limits. New requests snapshot their plan price, currency, billing duration, publication allowance, and (for exam purchases) commission rate. Changing settings does not rewrite existing requests, active subscriptions, purchases, or ledger entries. Currency cannot be changed after any subscription, purchase, payout, or ledger record exists because the system does not perform currency conversion.

## Publication entitlements

Institute-created exams start as drafts unless explicitly imported with `isPublished: true`. Draft creation, editing, pricing, and unpublishing do not consume publication allowance. A successful transition from draft to published is reserved atomically with a publication audit event:

1. Use one remaining lifetime free publication, up to the configured limit.
2. After the lifetime allowance is exhausted, require an active, payment-verified subscription with remaining publications in its billing period.

Each successful publish consumes one publication. Unpublishing, archiving, or deleting an exam does not refund that usage. Monthly subscriptions use calendar-month billing periods; yearly subscriptions use 12-month billing periods and their configured annual allowance. Public browsing still lists published exams; paid exam access requires a verified purchase.

## Payment verification and ledger

There is no payment gateway integration in this phase. An institute or student records a payment request; a SUPER_ADMIN verifies the offline payment and enters its reference. Only that verification activates a subscription or grants access to a paid exam. No bank credentials, payment secrets, or automatic-transfer claims are used.

New accounts are never granted administrator access based on their email address. To bootstrap the first SUPER_ADMIN, register the operator's account, then run `npm --prefix server run promote:super-admin -- operator@example.com` from the repository root using an environment configured with `MONGODB_URI`. Subsequent role changes must be performed by an authorized database operator.

Amounts are stored as integer minor currency units (paise for INR). The commissionable amount is the exam price before tax and payment fees. The platform commission is rounded to the nearest minor unit, with half units rounded up; the institute receives the remainder so the shares always sum to the commissionable amount. Platform-owned exams use a separate policy: all sale revenue belongs to the platform and no institute share is accrued.

Financial ledger entries are append-only in the application. Each verified purchase records gross purchase, platform commission/revenue, and institute share where applicable. Refunds and chargebacks record the gross affected amount and reverse the corresponding split cumulatively using the purchase's original commission rate, avoiding repeated partial-refund rounding drift. Gateway fees and taxes are separate signed entries and reduce the institute's payable balance for institute-owned exams. For platform-owned exams, those costs reduce platform revenue. These records are manual adjustments until a gateway is integrated.

The institute payable balance is the sum of institute shares, refunds/chargebacks, recorded gateway fees and taxes, and payout reservations/reversals. A payout request must meet the configured minimum and available balance. Approval reserves funds; manual processing requires a SUPER_ADMIN. A payout is marked paid only after a confirmation reference is recorded. Failed approved/processing payouts release the reservation with a separate ledger reversal. Transfers are not initiated by the application.

## Reconciliation limitations

The system does not yet connect to a gateway or bank, calculate tax liability, determine payment-provider fees, adjudicate disputes, convert currencies, or automatically execute a payout. SUPER_ADMINs must verify actual receipts, record applicable fee/tax/refund/chargeback adjustments, and reconcile transfer confirmations. Orders and payment intents are represented by application purchase requests; the immutable ledger is the accounting history.
