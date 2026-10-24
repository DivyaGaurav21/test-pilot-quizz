import { useCallback, useEffect, useState } from "react";
import JsonQuestionImporter from "../components/admin/JsonQuestionImporter";
import instituteService from "../services/instituteService";
import financeService from "../services/financeService";

const InstituteDashboard = () => {
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [financeInfo, setFinanceInfo] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [examPrices, setExamPrices] = useState({});

  const loadInstitute = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const currentInstitute = await instituteService.getMyInstitute();
      setInstitute(currentInstitute);
      setName(currentInstitute?.name || "");
      if (currentInstitute?.status === "approved") {
        const [
          currentExams,
          currentResults,
          currentSubscription,
          currentFinance,
        ] = await Promise.all([
          instituteService.getExams(),
          instituteService.getResults(),
          financeService.getSubscription(),
          financeService.getInstituteFinance(),
        ]);
        setExams(currentExams);
        setResults(currentResults);
        setSubscriptionInfo(currentSubscription);
        setFinanceInfo(currentFinance);
        setExamPrices(
          Object.fromEntries(
            currentExams.map((exam) => [
              exam._id,
              String(exam.pricePaise / 100),
            ]),
          ),
        );
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load institute information.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstitute();
  }, [loadInstitute]);

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      const submitted = await instituteService.registerInstitute({ name });
      setInstitute(submitted);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to submit institute application.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleVisibilityChange = async (exam) => {
    try {
      setError("");
      const updatedExam = await instituteService.updateExam(
        exam._id,
        !exam.isPublished,
      );
      setExams((current) =>
        current.map((item) =>
          item._id === updatedExam._id ? updatedExam : item,
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update exam visibility.",
      );
    }
  };

  const handlePriceChange = async (exam) => {
    const rupees = Number(examPrices[exam._id]);
    if (
      !Number.isFinite(rupees) ||
      rupees < 0 ||
      !Number.isSafeInteger(Math.round(rupees * 100))
    ) {
      setError("Enter a valid non-negative price in rupees.");
      return;
    }
    try {
      const updatedExam = await instituteService.updateExam(
        exam._id,
        undefined,
        Math.round(rupees * 100),
      );
      setExams((current) =>
        current.map((item) =>
          item._id === updatedExam._id ? updatedExam : item,
        ),
      );
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update exam price.",
      );
    }
  };

  const handleRequestSubscription = async (plan) => {
    try {
      await financeService.requestSubscription(plan);
      const currentSubscription = await financeService.getSubscription();
      setSubscriptionInfo(currentSubscription);
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to request a subscription.",
      );
    }
  };

  const handlePayoutRequest = async (event) => {
    event.preventDefault();
    const amountPaise = Math.round(Number(payoutAmount) * 100);
    try {
      await financeService.requestPayout(amountPaise);
      setPayoutAmount("");
      setFinanceInfo(await financeService.getInstituteFinance());
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to request a payout.",
      );
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        Loading institute portal...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">
            Institute Portal
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Apply for institute access or manage your approved institute exams.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {!institute && (
          <form
            onSubmit={handleRegister}
            className="space-y-4 rounded-xl border bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Register an institute
            </h2>
            <label className="block text-sm font-medium text-slate-700">
              Institute name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Submitting..." : "Submit for approval"}
            </button>
          </form>
        )}

        {institute && institute.status !== "approved" && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Application status
            </p>
            <h2 className="mt-1 text-xl font-semibold capitalize text-slate-900">
              {institute.status}
            </h2>
            <p className="mt-2 text-slate-700">
              {institute.name} · {institute.contactEmail}
            </p>
            {institute.status === "pending" && (
              <p className="mt-3 text-sm text-slate-600">
                Your application is waiting for a global administrator to review
                it.
              </p>
            )}
            {institute.status === "rejected" && (
              <>
                {institute.rejectionReason && (
                  <p className="mt-3 text-sm text-red-700">
                    {institute.rejectionReason}
                  </p>
                )}
                <form onSubmit={handleRegister} className="mt-5 space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Institute name
                    <input
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? "Submitting..." : "Resubmit application"}
                  </button>
                </form>
              </>
            )}
            {institute.status === "suspended" && (
              <p className="mt-3 text-sm text-red-700">
                Institute management access is suspended. Contact a global
                administrator for assistance.
              </p>
            )}
          </section>
        )}

        {institute?.status === "approved" && (
          <>
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                {institute.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {exams.length} exams · {results.length} submissions
              </p>
            </section>

            {subscriptionInfo && (
              <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Subscription and publishing quota
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Lifetime free publications:{" "}
                    {subscriptionInfo.freePublicationsUsed}/
                    {subscriptionInfo.freePublicationLimit}.
                  </p>
                  <p className="text-sm text-slate-600">
                    {subscriptionInfo.subscription
                      ? `Latest subscription: ${subscriptionInfo.subscription.status}${subscriptionInfo.subscription.endsAt ? ` · ends ${new Date(subscriptionInfo.subscription.endsAt).toLocaleDateString()}` : ""} · ${subscriptionInfo.subscription.publicationsUsed}/${subscriptionInfo.subscription.publicationLimit} publications`
                      : "No subscription request yet."}
                  </p>
                </div>
                {subscriptionInfo.subscription?.status !== "active" && (
                  <>
                    <div className="flex flex-wrap gap-3">
                      {["monthly", "yearly"].map((plan) => (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => handleRequestSubscription(plan)}
                          disabled={
                            subscriptionInfo.subscription?.status === "pending"
                          }
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold capitalize text-white disabled:opacity-50"
                        >
                          Request {plan} · {subscriptionInfo.currency}{" "}
                          {(
                            subscriptionInfo.plans[plan].pricePaise / 100
                          ).toFixed(2)}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      Payments are handled offline for now. Contact the platform
                      administrator with your request; the subscription
                      activates only after payment verification.
                    </p>
                  </>
                )}
              </section>
            )}

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Import an exam
              </h2>
              <JsonQuestionImporter
                importExam={instituteService.importExamJson}
                onSuccess={loadInstitute}
              />
            </section>

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Your exams
              </h2>
              {exams.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No institute exams yet.
                </p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {exams.map((exam) => (
                    <li
                      key={exam._id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {exam.title}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {exam.subject} · {exam.totalQuestions} questions
                        </p>
                        <p className="text-xs text-slate-500">
                          {exam.isPublished ? "Publicly listed" : "Unpublished"}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <label className="text-xs text-slate-600">
                            Price ({subscriptionInfo?.currency || "INR"})
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={examPrices[exam._id] ?? "0.00"}
                              onChange={(event) =>
                                setExamPrices((current) => ({
                                  ...current,
                                  [exam._id]: event.target.value,
                                }))
                              }
                              className="ml-2 w-28 rounded border border-slate-300 px-2 py-1"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handlePriceChange(exam)}
                            className="rounded border px-2 py-1 text-xs font-semibold text-slate-700"
                          >
                            Save price
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleVisibilityChange(exam)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {exam.isPublished ? "Unpublish" : "Publish"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {financeInfo && (
              <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Marketplace balance and payouts
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Available: {financeInfo.currency}{" "}
                    {(financeInfo.availableBalancePaise / 100).toFixed(2)}
                    {" · "}Minimum payout: {financeInfo.currency}{" "}
                    {(financeInfo.minimumPayoutPaise / 100).toFixed(2)}
                    {" · "}Manual monthly payout
                  </p>
                </div>
                <form
                  onSubmit={handlePayoutRequest}
                  className="flex flex-wrap items-end gap-3"
                >
                  <label className="text-sm text-slate-700">
                    Request amount ({financeInfo.currency})
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={payoutAmount}
                      onChange={(event) => setPayoutAmount(event.target.value)}
                      className="mt-1 block rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white"
                  >
                    Request payout
                  </button>
                </form>
                {financeInfo.payouts.length > 0 && (
                  <ul className="divide-y divide-slate-200 text-sm">
                    {financeInfo.payouts.map((payout) => (
                      <li key={payout._id} className="py-2">
                        ₹{(payout.amountPaise / 100).toFixed(2)} ·{" "}
                        {payout.status}
                        {payout.confirmationReference &&
                          ` · ${payout.confirmationReference}`}
                      </li>
                    ))}
                  </ul>
                )}
                {financeInfo.entries.length > 0 && (
                  <details>
                    <summary className="cursor-pointer text-sm font-semibold text-indigo-700">
                      View financial ledger
                    </summary>
                    <ul className="mt-2 divide-y divide-slate-200 text-xs">
                      {financeInfo.entries.map((entry) => (
                        <li key={entry._id} className="py-2">
                          {new Date(entry.createdAt).toLocaleDateString()} ·{" "}
                          {entry.type} · {entry.amountPaise} paise ·{" "}
                          {entry.notes || entry.reference}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </section>
            )}

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Student results
              </h2>
              {results.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No submissions for your exams yet.
                </p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {results.map((result) => (
                    <li
                      key={result._id}
                      className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {result.userId?.name || "Student"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {result.examId?.title || "Exam"}
                        </p>
                      </div>
                      <p className="text-sm text-slate-600">
                        {result.percentage}% ·{" "}
                        {new Date(result.submittedAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default InstituteDashboard;
