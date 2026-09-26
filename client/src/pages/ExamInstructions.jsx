import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useExamContext } from "../context/ExamContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";

const difficultyStyles = {
  Easy: "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard: "bg-red-50 text-red-700 border-red-200",
};

const ExamInstructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exam, loading, error, fetchExam, startExam } = useExamContext();
  const { t } = useLanguage();
  const [starting, setStarting] = useState(false);
  const [uiError, setUiError] = useState("");

  useEffect(() => {
    fetchExam(id);
  }, [fetchExam, id]);

  const handleStart = async () => {
    try {
      setStarting(true);
      setUiError("");
      await startExam(id);
      navigate(`/exams/${id}/start`);
    } catch (err) {
      setUiError(err.message);
    } finally {
      setStarting(false);
    }
  };

  const rules = [
    t("instructions.rule1"),
    t("instructions.rule2"),
    t("instructions.rule3"),
    t("instructions.rule4"),
    t("instructions.rule5"),
  ];

  if (loading && !exam) {
    return <Loading message={t("instructions.loading")} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {error && !exam && (
          <ErrorMessage message={error} onRetry={() => fetchExam(id)} />
        )}

        {uiError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            {uiError}
          </div>
        )}

        {exam && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Top accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />

            <div className="p-6 sm:p-8">
              <Link
                to="/exams"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                {t("instructions.backToExams")}
              </Link>

              <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {exam.title}
                </h1>

                {exam.difficulty && (
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      difficultyStyles[exam.difficulty] ||
                      "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {exam.difficulty}
                  </span>
                )}
              </div>

              {/* Stat cards */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-blue-50/60 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("instructions.subject")}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {exam.subject || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-purple-50/60 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("instructions.questions")}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {exam.totalQuestions ?? 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-amber-50/60 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("instructions.duration")}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {exam.duration ?? 0} {t("instructions.minutes")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions list */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("instructions.instructionsTitle")}
                </h2>

                <ul className="mt-4 space-y-3">
                  {rules.map((rule, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm leading-6 text-gray-600"
                    >
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                        {index + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {error && (
                <div className="mt-5">
                  <ErrorMessage message={error} />
                </div>
              )}

              {/* Ready banner */}
              <div className="mt-8 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <svg
                  className="h-8 w-8 flex-shrink-0 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {t("instructions.readyTitle")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("instructions.readySubtitle")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStart}
                disabled={starting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {starting && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {starting
                  ? t("instructions.starting")
                  : t("instructions.startExam")}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ExamInstructions;
