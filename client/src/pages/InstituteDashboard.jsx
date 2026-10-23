import { useCallback, useEffect, useState } from "react";
import JsonQuestionImporter from "../components/admin/JsonQuestionImporter";
import instituteService from "../services/instituteService";

const InstituteDashboard = () => {
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);

  const loadInstitute = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const currentInstitute = await instituteService.getMyInstitute();
      setInstitute(currentInstitute);
      setName(currentInstitute?.name || "");
      setContactEmail(currentInstitute?.contactEmail || "");
      if (currentInstitute?.status === "approved") {
        const [currentExams, currentResults] = await Promise.all([
          instituteService.getExams(),
          instituteService.getResults(),
        ]);
        setExams(currentExams);
        setResults(currentResults);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load institute information.");
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
      const submitted = await instituteService.registerInstitute({ name, contactEmail });
      setInstitute(submitted);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit institute application.");
    } finally {
      setSaving(false);
    }
  };

  const handleVisibilityChange = async (exam) => {
    try {
      setError("");
      const updatedExam = await instituteService.updateExam(exam._id, !exam.isPublished);
      setExams((current) => current.map((item) => item._id === updatedExam._id ? updatedExam : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update exam visibility.");
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-5xl px-4 py-10">Loading institute portal...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Institute Portal</h1>
          <p className="mt-1 text-sm text-slate-600">
            Apply for institute access or manage your approved institute exams.
          </p>
        </header>

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!institute && (
          <form onSubmit={handleRegister} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Register an institute</h2>
            <label className="block text-sm font-medium text-slate-700">
              Institute name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Institute contact email
              <input
                required
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
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
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Application status</p>
            <h2 className="mt-1 text-xl font-semibold capitalize text-slate-900">{institute.status}</h2>
            <p className="mt-2 text-slate-700">{institute.name} · {institute.contactEmail}</p>
            {institute.status === "pending" && (
              <p className="mt-3 text-sm text-slate-600">Your application is waiting for a global administrator to review it.</p>
            )}
            {institute.status === "rejected" && (
              <>
                {institute.rejectionReason && <p className="mt-3 text-sm text-red-700">{institute.rejectionReason}</p>}
                <form onSubmit={handleRegister} className="mt-5 space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Institute name
                    <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Institute contact email
                    <input required type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                  </label>
                  <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
                    {saving ? "Submitting..." : "Resubmit application"}
                  </button>
                </form>
              </>
            )}
            {institute.status === "suspended" && (
              <p className="mt-3 text-sm text-red-700">Institute management access is suspended. Contact a global administrator for assistance.</p>
            )}
          </section>
        )}

        {institute?.status === "approved" && (
          <>
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{institute.name}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {exams.length} exams · {results.length} submissions
              </p>
            </section>

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Import an exam</h2>
              <JsonQuestionImporter importExam={instituteService.importExamJson} onSuccess={loadInstitute} />
            </section>

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Your exams</h2>
              {exams.length === 0 ? (
                <p className="text-sm text-slate-600">No institute exams yet.</p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {exams.map((exam) => (
                    <li key={exam._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{exam.title}</h3>
                        <p className="text-sm text-slate-600">{exam.subject} · {exam.totalQuestions} questions</p>
                        <p className="text-xs text-slate-500">{exam.isPublished ? "Publicly listed" : "Unpublished"}</p>
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

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Student results</h2>
              {results.length === 0 ? (
                <p className="text-sm text-slate-600">No submissions for your exams yet.</p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {results.map((result) => (
                    <li key={result._id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{result.userId?.name || "Student"}</p>
                        <p className="text-sm text-slate-600">{result.examId?.title || "Exam"}</p>
                      </div>
                      <p className="text-sm text-slate-600">
                        {result.percentage}% · {new Date(result.submittedAt).toLocaleDateString()}
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
