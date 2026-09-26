import React, { useEffect, useMemo, useState } from "react";
import ExamCard from "../components/exam/ExamCard";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import useExam from "../hooks/useExam";
import { useLanguage } from "../context/LanguageContext.jsx";

const Exams = () => {
  const { exams, loading, error, fetchExams } = useExam();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const subjects = useMemo(() => {
    const unique = new Set(exams.map((e) => e.subject).filter(Boolean));
    return Array.from(unique);
  }, [exams]);

  const difficulties = useMemo(() => {
    const unique = new Set(exams.map((e) => e.difficulty).filter(Boolean));
    return Array.from(unique);
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch =
        !searchTerm ||
        exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject = subjectFilter === "all" || exam.subject === subjectFilter;
      const matchesDifficulty = difficultyFilter === "all" || exam.difficulty === difficultyFilter;

      return matchesSearch && matchesSubject && matchesDifficulty;
    });
  }, [exams, searchTerm, subjectFilter, difficultyFilter]);

  const hasActiveFilters = searchTerm || subjectFilter !== "all" || difficultyFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setSubjectFilter("all");
    setDifficultyFilter("all");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t("exams.title")}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">{t("exams.subtitle")}</p>
        </div>

        {/* Search + Filters */}
        {!loading && !error && exams.length > 0 && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search input */}
              <div className="relative flex-1">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("exams.searchPlaceholder")}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Subject filter */}
              {subjects.length > 0 && (
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-48"
                >
                  <option value="all">{t("exams.allSubjects")}</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              )}

              {/* Difficulty filter */}
              {difficulties.length > 0 && (
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-44"
                >
                  <option value="all">{t("exams.allDifficulties")}</option>
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {t("exams.resultsCount").replace("{{count}}", filteredExams.length)}
                </p>
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  {t("exams.clearFilters")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && <Loading message={t("exams.loading")} />}

        {/* Error state */}
        {!loading && error && (
          <ErrorMessage message={error} onRetry={fetchExams} />
        )}

        {/* No exams at all */}
        {!loading && !error && exams.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <svg className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900">{t("exams.noExamsTitle")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("exams.noExamsSubtitle")}</p>
          </div>
        )}

        {/* Filtered but no matches */}
        {!loading && !error && exams.length > 0 && filteredExams.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
              <svg className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900">{t("exams.noResultsTitle")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("exams.noResultsSubtitle")}</p>
            <button
              onClick={clearFilters}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {t("exams.clearFilters")}
            </button>
          </div>
        )}

        {/* Exam grid */}
        {!loading && !error && filteredExams.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map((exam) => (
              <ExamCard key={exam._id} exam={exam} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Exams;