import { useCallback, useEffect, useState } from "react";
import financeService from "../../services/financeService";

const defaultSettings = {
  currency: "INR",
  monthlyPlan: { pricePaise: 49900, durationMonths: 1, publicationLimit: 20 },
  yearlyPlan: { pricePaise: 499900, durationMonths: 12, publicationLimit: 240 },
  freePublicationLimit: 3,
  commissionBasisPoints: 2000,
  minimumPayoutPaise: 100000,
  payoutSchedule: "monthly",
  payoutMode: "manual",
};

const FinanceDashboard = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [records, setRecords] = useState({
    subscriptions: [],
    purchases: [],
    payouts: [],
    entries: [],
    publicationEvents: [],
    totals: {},
  });
  const [paymentReferences, setPaymentReferences] = useState({});
  const [adjustments, setAdjustments] = useState({});
  const [payoutInputs, setPayoutInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [currentSettings, currentRecords] = await Promise.all([
        financeService.getMonetizationSettings(),
        financeService.getFinanceRecords(),
      ]);
      setSettings(currentSettings);
      setRecords(currentRecords);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load finance dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changePlan = (plan, field, value, isMoney = false) => {
    const parsed = Number(value);
    setSettings((current) => ({
      ...current,
      [plan]: {
        ...current[plan],
        [field]: isMoney ? Math.round(parsed * 100) : parsed,
      },
    }));
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      const updated = await financeService.updateMonetizationSettings(settings);
      setSettings(updated);
      setMessage("Monetization settings saved.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save monetization settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const verifySubscription = async (subscription) => {
    try {
      await financeService.verifySubscription(
        subscription._id,
        paymentReferences[subscription._id] || "",
      );
      setMessage("Subscription payment verified and subscription activated.");
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to verify subscription payment.",
      );
    }
  };

  const recordSubscriptionAdjustment = async (subscription) => {
    const key = `subscription:${subscription._id}`;
    const adjustment = adjustments[key] || {};
    try {
      await financeService.addSubscriptionAdjustment(subscription._id, {
        type: adjustment.type,
        amountPaise: Math.round(Number(adjustment.amount) * 100),
        notes: adjustment.notes || "",
        reference: adjustment.reference || "",
      });
      setMessage("Subscription financial adjustment recorded.");
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to adjust subscription payment.",
      );
    }
  };

  const setSubscriptionStatus = async (subscription, status) => {
    try {
      await financeService.updateSubscriptionStatus(subscription._id, status);
      setMessage(`Subscription marked ${status}.`);
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update subscription status.",
      );
    }
  };

  const verifyPurchase = async (purchase) => {
    try {
      await financeService.verifyPurchase(
        purchase._id,
        paymentReferences[purchase._id] || "",
      );
      setMessage("Purchase payment verified; exam access is now granted.");
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to verify purchase payment.",
      );
    }
  };

  const recordAdjustment = async (purchase) => {
    const adjustment = adjustments[purchase._id] || {};
    try {
      await financeService.addPurchaseAdjustment(purchase._id, {
        type: adjustment.type,
        amountPaise: Math.round(Number(adjustment.amount) * 100),
        notes: adjustment.notes || "",
        reference: adjustment.reference || "",
      });
      setMessage("Financial adjustment recorded in the ledger.");
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to record financial adjustment.",
      );
    }
  };

  const changePayout = async (payout, status) => {
    const input = payoutInputs[payout._id] || {};
    try {
      await financeService.updatePayout(payout._id, {
        status,
        confirmationReference: input.reference || "",
        failureReason: input.reason || "",
      });
      setMessage(`Payout moved to ${status}.`);
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update payout.",
      );
    }
  };

  const changeAdjustment = (purchaseId, field, value) => {
    setAdjustments((current) => ({
      ...current,
      [purchaseId]: { ...current[purchaseId], [field]: value },
    }));
  };

  const changePayoutInput = (payoutId, field, value) => {
    setPayoutInputs((current) => ({
      ...current,
      [payoutId]: { ...current[payoutId], [field]: value },
    }));
  };

  if (loading)
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        Loading financial records...
      </main>
    );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">
            SaaS and marketplace finance
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Configure plans, verify offline payments, record adjustments, and
            reconcile monthly manual payouts.
          </p>
        </header>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          >
            {message}
          </p>
        )}

        <form
          onSubmit={saveSettings}
          className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Platform settings
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["monthlyPlan", "yearlyPlan"].map((plan) => (
              <fieldset key={plan} className="space-y-3 rounded-lg border p-4">
                <legend className="px-1 font-semibold capitalize text-slate-800">
                  {plan.replace("Plan", "")} plan
                </legend>
                <label className="block text-sm text-slate-700">
                  Price ({settings.currency})
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={(settings[plan].pricePaise / 100).toFixed(2)}
                    onChange={(event) =>
                      changePlan(plan, "pricePaise", event.target.value, true)
                    }
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </label>
                <label className="block text-sm text-slate-700">
                  Billing duration (months)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={settings[plan].durationMonths}
                    onChange={(event) =>
                      changePlan(plan, "durationMonths", event.target.value)
                    }
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </label>
                <label className="block text-sm text-slate-700">
                  Publications per period
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={settings[plan].publicationLimit}
                    onChange={(event) =>
                      changePlan(plan, "publicationLimit", event.target.value)
                    }
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </label>
              </fieldset>
            ))}
            <label className="block text-sm text-slate-700">
              Currency
              <input
                required
                maxLength="3"
                value={settings.currency}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    currency: event.target.value.toUpperCase(),
                  }))
                }
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Lifetime free publications
              <input
                type="number"
                min="0"
                step="1"
                value={settings.freePublicationLimit}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    freePublicationLimit: Number(event.target.value),
                  }))
                }
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Platform commission (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={(settings.commissionBasisPoints / 100).toFixed(2)}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    commissionBasisPoints: Math.round(
                      Number(event.target.value) * 100,
                    ),
                  }))
                }
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Minimum payout ({settings.currency})
              <input
                type="number"
                min="0"
                step="0.01"
                value={(settings.minimumPayoutPaise / 100).toFixed(2)}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    minimumPayoutPaise: Math.round(
                      Number(event.target.value) * 100,
                    ),
                  }))
                }
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-700">
              Payout schedule
              <select
                value={settings.payoutSchedule}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    payoutSchedule: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded border px-3 py-2"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="on_demand">On demand</option>
              </select>
            </label>
            <label className="block text-sm text-slate-700">
              Payout mode (transfers remain manual)
              <select
                value={settings.payoutMode}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    payoutMode: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded border px-3 py-2"
              >
                <option value="manual">Manual SUPER_ADMIN processing</option>
                <option value="manual_batch">
                  Manual batch reconciliation
                </option>
              </select>
            </label>
          </div>
          <p className="text-xs text-slate-500">
            Settings updates apply to new subscription requests and exam
            purchases. Existing subscription and purchase snapshots are
            retained. No automatic bank transfers are supported.
          </p>
          <button
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save platform settings"}
          </button>
        </form>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Gross exam sales", records.totals.grossExamSalesPaise],
            ["Subscription revenue", records.totals.subscriptionRevenuePaise],
            ["Platform commission", records.totals.platformCommissionPaise],
            [
              "Institute share accrued",
              records.totals.instituteShareAccruedPaise,
            ],
            [
              "Net institute payable",
              records.totals.institutePayableBalancePaise,
            ],
            [
              "Refunds / chargebacks",
              records.totals.refundsAndChargebacksPaise,
            ],
            ["Gateway fees", records.totals.gatewayFeesPaise],
            ["Taxes", records.totals.taxesPaise],
            [
              "Paid payouts",
              records.totals.payoutsPaid?.reduce(
                (sum, payout) => sum + payout.totalPaise,
                0,
              ),
            ],
          ].map(([label, amount]) => (
            <div
              key={label}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {amount ?? 0} paise
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Subscription payment verification
          </h2>
          {records.subscriptions.length === 0 ? (
            <p className="text-sm text-slate-600">No subscription records.</p>
          ) : (
            records.subscriptions.map((subscription) => (
              <div
                key={subscription._id}
                className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-end sm:justify-between"
              >
                <p className="text-sm text-slate-700">
                  {subscription.instituteId?.name} · {subscription.plan} ·{" "}
                  {subscription.pricePaise} paise ·{" "}
                  {subscription.publicationsUsed}/
                  {subscription.publicationLimit} publications ·{" "}
                  {subscription.status}
                </p>
                <div className="flex gap-2">
                  {subscription.status === "pending" && (
                    <>
                      <input
                        required
                        aria-label="Payment reference"
                        placeholder="Verified payment reference"
                        value={paymentReferences[subscription._id] || ""}
                        onChange={(event) =>
                          setPaymentReferences((current) => ({
                            ...current,
                            [subscription._id]: event.target.value,
                          }))
                        }
                        className="rounded border px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => verifySubscription(subscription)}
                        className="rounded bg-green-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Verify
                      </button>
                    </>
                  )}
                  {subscription.status === "active" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setSubscriptionStatus(subscription, "past_due")
                        }
                        className="rounded bg-amber-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Mark past due
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSubscriptionStatus(subscription, "expired")
                        }
                        className="rounded bg-slate-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Expire
                      </button>
                    </>
                  )}
                </div>
                {subscription.paymentVerifiedAt &&
                  subscription.refundedPaise < subscription.pricePaise && (
                    <div className="grid gap-2 border-t pt-3 sm:grid-cols-5">
                      <select
                        value={
                          adjustments[`subscription:${subscription._id}`]
                            ?.type || "gateway_fee"
                        }
                        onChange={(event) =>
                          setAdjustments((current) => ({
                            ...current,
                            [`subscription:${subscription._id}`]: {
                              ...current[`subscription:${subscription._id}`],
                              type: event.target.value,
                            },
                          }))
                        }
                        className="rounded border px-3 py-2 text-sm"
                      >
                        <option value="gateway_fee">Gateway fee</option>
                        <option value="tax">Tax</option>
                        <option value="refund">Refund</option>
                        <option value="chargeback">Chargeback</option>
                      </select>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Amount"
                        value={
                          adjustments[`subscription:${subscription._id}`]
                            ?.amount || ""
                        }
                        onChange={(event) =>
                          setAdjustments((current) => ({
                            ...current,
                            [`subscription:${subscription._id}`]: {
                              ...current[`subscription:${subscription._id}`],
                              amount: event.target.value,
                            },
                          }))
                        }
                        className="rounded border px-3 py-2 text-sm"
                      />
                      <input
                        placeholder="Reason / details"
                        value={
                          adjustments[`subscription:${subscription._id}`]
                            ?.notes || ""
                        }
                        onChange={(event) =>
                          setAdjustments((current) => ({
                            ...current,
                            [`subscription:${subscription._id}`]: {
                              ...current[`subscription:${subscription._id}`],
                              notes: event.target.value,
                            },
                          }))
                        }
                        className="rounded border px-3 py-2 text-sm"
                      />
                      <input
                        placeholder="Reference (optional)"
                        value={
                          adjustments[`subscription:${subscription._id}`]
                            ?.reference || ""
                        }
                        onChange={(event) =>
                          setAdjustments((current) => ({
                            ...current,
                            [`subscription:${subscription._id}`]: {
                              ...current[`subscription:${subscription._id}`],
                              reference: event.target.value,
                            },
                          }))
                        }
                        className="rounded border px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          recordSubscriptionAdjustment(subscription)
                        }
                        className="rounded border px-3 py-2 text-sm font-semibold"
                      >
                        Record adjustment
                      </button>
                    </div>
                  )}
              </div>
            ))
          )}
        </section>

        <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Marketplace purchase verification
          </h2>
          {records.purchases.length === 0 ? (
            <p className="text-sm text-slate-600">No pending exam purchases.</p>
          ) : (
            records.purchases.map((purchase) => (
              <div key={purchase._id} className="space-y-3 border-t pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <p className="text-sm text-slate-700">
                    {purchase.examId?.title} · {purchase.buyerId?.name} ·{" "}
                    {purchase.amountPaise} paise · {purchase.currency}
                  </p>
                  <div className="flex gap-2">
                    <input
                      aria-label="Payment reference"
                      placeholder="Verified payment reference"
                      value={paymentReferences[purchase._id] || ""}
                      onChange={(event) =>
                        setPaymentReferences((current) => ({
                          ...current,
                          [purchase._id]: event.target.value,
                        }))
                      }
                      className="rounded border px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => verifyPurchase(purchase)}
                      className="rounded bg-green-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Verify
                    </button>
                  </div>
                </div>
                {purchase.status === "pending" ? (
                  <p className="text-xs text-slate-500">
                    Payment pending verification. Adjustments become available
                    once verified.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-5">
                    <select
                      value={adjustments[purchase._id]?.type || "gateway_fee"}
                      onChange={(event) =>
                        changeAdjustment(
                          purchase._id,
                          "type",
                          event.target.value,
                        )
                      }
                      className="rounded border px-3 py-2 text-sm"
                    >
                      <option value="gateway_fee">Gateway fee</option>
                      <option value="tax">Tax</option>
                      <option value="refund">Refund</option>
                      <option value="chargeback">Chargeback</option>
                    </select>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Amount"
                      value={adjustments[purchase._id]?.amount || ""}
                      onChange={(event) =>
                        changeAdjustment(
                          purchase._id,
                          "amount",
                          event.target.value,
                        )
                      }
                      className="rounded border px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="Reason / details"
                      value={adjustments[purchase._id]?.notes || ""}
                      onChange={(event) =>
                        changeAdjustment(
                          purchase._id,
                          "notes",
                          event.target.value,
                        )
                      }
                      className="rounded border px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="Reference (optional)"
                      value={adjustments[purchase._id]?.reference || ""}
                      onChange={(event) =>
                        changeAdjustment(
                          purchase._id,
                          "reference",
                          event.target.value,
                        )
                      }
                      className="rounded border px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => recordAdjustment(purchase)}
                      className="rounded border px-3 py-2 text-sm font-semibold"
                    >
                      Record adjustment
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </section>

        <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Manual payouts
          </h2>
          {records.payouts.length === 0 ? (
            <p className="text-sm text-slate-600">No pending payouts.</p>
          ) : (
            records.payouts.map((payout) => (
              <div key={payout._id} className="space-y-2 border-t pt-4">
                <p className="text-sm text-slate-700">
                  {payout.instituteId?.name} · {payout.amountPaise} paise ·{" "}
                  {payout.currency} · {payout.status} · scheduled{" "}
                  {new Date(payout.scheduledFor).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {payout.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => changePayout(payout, "approved")}
                      className="rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Approve and reserve balance
                    </button>
                  )}
                  {payout.status === "approved" && (
                    <button
                      type="button"
                      onClick={() => changePayout(payout, "processing")}
                      className="rounded bg-amber-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Mark processing
                    </button>
                  )}
                  {payout.status === "processing" && (
                    <>
                      <input
                        placeholder="Bank transfer confirmation reference"
                        value={payoutInputs[payout._id]?.reference || ""}
                        onChange={(event) =>
                          changePayoutInput(
                            payout._id,
                            "reference",
                            event.target.value,
                          )
                        }
                        className="rounded border px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => changePayout(payout, "paid")}
                        className="rounded bg-green-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Confirm paid
                      </button>
                      <input
                        placeholder="Failure reason"
                        value={payoutInputs[payout._id]?.reason || ""}
                        onChange={(event) =>
                          changePayoutInput(
                            payout._id,
                            "reason",
                            event.target.value,
                          )
                        }
                        className="rounded border px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => changePayout(payout, "failed")}
                        className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Mark failed
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Immutable financial ledger (latest 200 entries)
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-500">
                  <th className="py-2">Date</th>
                  <th>Type</th>
                  <th>Institute</th>
                  <th>Amount (paise)</th>
                  <th>Reference / notes</th>
                </tr>
              </thead>
              <tbody>
                {records.entries.map((entry) => (
                  <tr key={entry._id} className="border-b last:border-0">
                    <td className="py-2">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td>{entry.type}</td>
                    <td>{entry.instituteId || "Platform"}</td>
                    <td>
                      {entry.amountPaise} {entry.currency}
                    </td>
                    <td>{entry.reference || entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Publication audit log (latest 200)
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-500">
                  <th className="py-2">Date</th>
                  <th>Institute</th>
                  <th>Exam</th>
                  <th>Quota used</th>
                  <th>Period end</th>
                </tr>
              </thead>
              <tbody>
                {records.publicationEvents.map((event) => (
                  <tr key={event._id} className="border-b last:border-0">
                    <td className="py-2">
                      {new Date(event.createdAt).toLocaleString()}
                    </td>
                    <td>{event.instituteId?.name || event.instituteId}</td>
                    <td>{event.examId?.title || event.examId}</td>
                    <td>
                      {event.source === "lifetime_free"
                        ? "Lifetime free"
                        : "Paid subscription"}
                    </td>
                    <td>
                      {event.periodEndsAt
                        ? new Date(event.periodEndsAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

export default FinanceDashboard;
