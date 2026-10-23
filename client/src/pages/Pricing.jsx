import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const formatPrice = (amount, currency) => new Intl.NumberFormat(undefined, {
  style: "currency",
  currency,
  maximumFractionDigits: 2,
}).format(amount / 100);

const Pricing = () => {
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/finance/plans")
      .then(({ data }) => setPlans(data))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load pricing right now."));
  }, []);

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Simple institute plans</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Room to grow with every test.</h1>
          <p className="mt-4 leading-7 text-slate-600">Learners can browse tests for free. Institute publication plans are shown below.</p>
        </div>
        {error && <p role="alert" className="mx-auto mt-8 max-w-xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {!plans && !error ? <p className="mt-10 text-center text-sm text-slate-500">Loading current plans...</p> : null}
        {plans && (
          <>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-sm font-bold text-slate-600">Getting started</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-950">Free</h2>
                <p className="mt-2 text-sm text-slate-600">{plans.freePublicationLimit} lifetime publications</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li>✓ Institute application and review</li>
                  <li>✓ Create and manage draft tests</li>
                  <li>✓ Publish your first tests</li>
                </ul>
              </article>
              {[
                ["Monthly", plans.monthlyPlan],
                ["Yearly", plans.yearlyPlan],
              ].map(([label, plan]) => (
                <article key={label} className={`rounded-2xl border bg-white p-7 shadow-sm ${label === "Yearly" ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-200"}`}>
                  <p className="text-sm font-bold text-slate-600">{label} plan</p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-950">{formatPrice(plan.pricePaise, plans.currency)}</h2>
                  <p className="mt-2 text-sm text-slate-600">per {plan.durationMonths} {plan.durationMonths === 1 ? "month" : "months"}</p>
                  <ul className="mt-6 space-y-3 text-sm text-slate-600">
                    <li>✓ {plan.publicationLimit} publications per plan period</li>
                    <li>✓ Institute exam management</li>
                    <li>✓ Review learner results</li>
                  </ul>
                </article>
              ))}
            </div>
            <p className="mt-5 text-center text-xs text-slate-500">Offline payment verification is currently handled by a superadmin after you request a plan.</p>
          </>
        )}
        <div className="mt-9 text-center">
          <Link to="/register" className="inline-flex rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-800">Get started as an institute</Link>
        </div>
      </div>
    </main>
  );
};

export default Pricing;
