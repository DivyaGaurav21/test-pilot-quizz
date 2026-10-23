import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import instituteService from "../services/instituteService";

const Institutes = () => {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    instituteService.getPopularInstitutes()
      .then(setInstitutes)
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load institutes."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">For institutes</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Bring your tests to more learners.</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-600">Apply to publish practice tests, manage your learning content, and review learner results from one institute portal.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/register" className="rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-800">Apply as an institute</Link>
          <Link to="/pricing" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">View plans</Link>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-slate-950">Popular institutes</h2>
          <p className="mt-2 text-sm text-slate-600">Approved learning providers with published practice tests.</p>
          {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          {loading ? <p className="mt-6 text-sm text-slate-500">Loading institutes...</p> : institutes.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {institutes.map((institute, index) => (
                <article key={institute._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className={`grid h-12 w-12 place-items-center rounded-xl text-lg font-bold ${index % 2 ? "bg-cyan-50 text-cyan-800" : "bg-indigo-50 text-indigo-800"}`}>
                    {institute.name?.trim()?.charAt(0)?.toUpperCase() || "I"}
                  </div>
                  <h3 className="mt-4 font-bold text-slate-950">{institute.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{institute.publishedExamCount} published tests · {institute.resultCount} learner attempts</p>
                </article>
              ))}
            </div>
          ) : !error ? <p className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No approved institutes are listed yet.</p> : null}
        </section>
      </div>
    </main>
  );
};

export default Institutes;
