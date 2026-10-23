import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import examService from "../services/examService";
import instituteService from "../services/instituteService";
import ExamCard from "../components/exam/ExamCard";

const Home = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.allSettled([examService.getExams(), instituteService.getPopularInstitutes()])
      .then(([examResult, instituteResult]) => {
        if (!active) return;
        const errors = [];
        if (examResult.status === "fulfilled") {
          setExams(examResult.value.slice(0, 6));
        } else {
          errors.push(examResult.reason.response?.data?.message || "Unable to load the latest tests.");
        }
        if (instituteResult.status === "fulfilled") {
          setInstitutes(instituteResult.value);
        } else {
          errors.push(instituteResult.reason.response?.data?.message || "Unable to load popular institutes.");
        }
        setError(errors.join(" "));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/40 via-slate-950 to-slate-950" />
        <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Practice. Progress. Possibility.
            </span>
            <h1 className="mt-7 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find your next test.
              <span className="block text-indigo-300">Know where you stand.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Explore focused practice tests from learning communities, get instant results, and turn every attempt into a step forward.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/exams" className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400">
                Browse practice tests
                <span aria-hidden="true" className="ml-2">→</span>
              </Link>
              {!user && (
                <Link to="/register" className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
                  Create your free account
                </Link>
              )}
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
              <span><strong className="text-white">Practice</strong> at your own pace</span>
              <span><strong className="text-white">Review</strong> every result</span>
              <span><strong className="text-white">Improve</strong> with each attempt</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-cyan-300/10 blur-2xl" />
            <div className="relative rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">Your learning space</p>
                  <p className="mt-1 text-lg font-bold text-white">A little progress, every day</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-300/15 text-xl text-cyan-200" aria-hidden="true">✦</span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["01", "Choose a practice test", "Find a subject and level that fit your goals."],
                  ["02", "Focus on the attempt", "Take a timed test in a calm, simple workspace."],
                  ["03", "Learn from your result", "See your score and keep your history in one place."],
                ].map(([number, title, description]) => (
                  <div key={number} className="flex gap-4 rounded-2xl bg-white/[0.06] p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-400/15 text-sm font-bold text-indigo-200">{number}</span>
                    <div>
                      <h2 className="font-semibold text-white">{title}</h2>
                      <p className="mt-1 text-sm leading-5 text-slate-400">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to={user ? "/dashboard" : "/register"} className="mt-5 flex items-center justify-between rounded-xl bg-indigo-500/15 px-4 py-3 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/25">
                {user ? "Go to your dashboard" : "Start with a free account"}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Start practicing</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Explore the latest tests</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">A hand-picked window into the tests available on the platform.</p>
            </div>
            <Link to="/exams" className="text-sm font-bold text-indigo-700 hover:text-indigo-900">Browse all tests <span aria-hidden="true">→</span></Link>
          </div>
          {error && <p role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</p>}
          {loading ? (
            <p className="mt-8 text-sm text-slate-500">Loading tests and institutes...</p>
          ) : exams.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => <ExamCard key={exam._id} exam={exam} />)}
            </div>
          ) : !error ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
              No published tests yet. Check back soon.
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Learning communities</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Popular institutes</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Discover approved institutes and the practice tests they publish.</p>
            </div>
            <Link to="/institutes" className="text-sm font-bold text-indigo-700 hover:text-indigo-900">Meet our institutes <span aria-hidden="true">→</span></Link>
          </div>
          {!loading && institutes.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {institutes.map((institute, index) => (
                <article key={institute._id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg font-bold ${index % 2 ? "bg-cyan-50 text-cyan-800" : "bg-indigo-50 text-indigo-800"}`}>
                    {institute.name?.trim()?.charAt(0)?.toUpperCase() || "I"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900">{institute.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {institute.publishedExamCount} {institute.publishedExamCount === 1 ? "test" : "tests"}
                      <span className="mx-2 text-slate-300">·</span>
                      {institute.resultCount} attempts
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
          {!loading && !institutes.length && !error && (
            <p className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Approved institutes will appear here as they publish tests.</p>
          )}
        </div>
      </section>

      <section className="bg-indigo-700 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Create a stronger practice routine.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">Join as a learner or bring your institute’s tests to a wider community.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-800 hover:bg-indigo-50">Create an account</Link>
            <Link to="/institutes" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">For institutes</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
