import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const UserDashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/results")
      .then(({ data }) => {
        if (active) setResults(data.slice(0, 10));
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Unable to load your recent results.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const averageScore = results.length
    ? Math.round(results.reduce((total, result) => total + (result.percentage || 0), 0) / results.length)
    : 0;

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Your learning space</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Student dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">Review your latest attempts and keep building momentum.</p>
          </div>
          <Link to="/exams" className="inline-flex w-fit items-center rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-800">
            Find a practice test <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>

        {error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Recent attempts shown</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{results.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Average recent score</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{averageScore}%</p>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-950">Recent results</h2>
              <p className="mt-1 text-xs text-slate-500">Your 10 most recent test attempts.</p>
            </div>
            <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 sm:inline">Personal history</span>
          </div>
          {loading ? (
            <p className="px-5 py-10 text-sm text-slate-500">Loading your results...</p>
          ) : results.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-semibold text-slate-900">Your first result is waiting.</p>
              <p className="mt-1 text-sm text-slate-500">Take a practice test and your results will appear here.</p>
              <Link to="/exams" className="mt-4 inline-flex rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800">Browse tests</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Test</th>
                    <th className="px-5 py-3 font-semibold">Score</th>
                    <th className="px-5 py-3 font-semibold">Percentage</th>
                    <th className="px-5 py-3 font-semibold">Completed</th>
                    <th className="px-5 py-3 font-semibold"><span className="sr-only">View result</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((result) => (
                    <tr key={result._id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-4 font-semibold text-slate-900">{result.examId?.title || "Test"}</td>
                      <td className="px-5 py-4 text-slate-700">{result.score}/{result.totalMarks}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${(result.percentage || 0) >= 60 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {result.percentage || 0}%
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link to={`/results/${result._id}`} className="font-semibold text-indigo-700 hover:text-indigo-900">Details</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default UserDashboard;
