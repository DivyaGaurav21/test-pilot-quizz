import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";
import useExam from "../../hooks/useExam";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Results-related state (from commented feature)
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState("");

  // Exam management state (delete feature)
  const {
    exams,
    loading: examsLoading,
    error: examsError,
    fetchExams,
    deleteExam,
  } = useExam();
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadResults = async () => {
    try {
      setResultsLoading(true);
      setResultsError("");

      const data = await adminService.getAdminResults();
      setResults(data || []);
    } catch (err) {
      setResultsError(
        err.response?.data?.message || "Unable to load admin dashboard.",
      );
    } finally {
      setResultsLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
    fetchExams();
  }, [fetchExams]);

  const handleConfirmDelete = async () => {
    if (!examToDelete) return;

    try {
      setDeleting(true);
      setDeleteError("");
      await deleteExam(examToDelete._id);
      setExamToDelete(null);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete exam.");
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "exams", label: "Manage Exams" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage exams and view submitted results.
            </p>
          </div>

          <Link
            to="/admin/import"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:from-blue-700 hover:to-indigo-700"
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
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            Import Exam JSON
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <>
            {resultsError && (
              <ErrorMessage message={resultsError} onRetry={loadResults} />
            )}

            {resultsLoading ? (
              <Loading message="Loading dashboard..." />
            ) : (
              <>
                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
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
                            d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">Submitted Results</p>
                    </div>
                    <p className="mt-3 text-3xl font-bold text-gray-900">
                      {results.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">Total Exams</p>
                    </div>
                    <p className="mt-3 text-3xl font-bold text-gray-900">
                      {exams.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
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
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">Admin Access</p>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-green-600">
                      Authorized
                    </p>
                  </div>
                </div>

                {/* Recent results table */}
                <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 px-5 py-4">
                    <h2 className="font-semibold text-gray-900">
                      Recent Results
                    </h2>
                  </div>

                  {results.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <p className="text-sm text-gray-500">
                        No results available yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="px-5 py-3 font-medium">User</th>
                            <th className="px-5 py-3 font-medium">Exam</th>
                            <th className="px-5 py-3 font-medium">Score</th>
                            <th className="px-5 py-3 font-medium">
                              Percentage
                            </th>
                            <th className="px-5 py-3 font-medium">Submitted</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {results.map((result) => (
                            <tr
                              key={result._id}
                              className="hover:bg-gray-50/60"
                            >
                              <td className="px-5 py-3 text-gray-800">
                                {result.userId?.name ||
                                  result.user?.name ||
                                  "Unknown"}
                              </td>
                              <td className="px-5 py-3 text-gray-800">
                                {result.examId?.title ||
                                  result.exam?.title ||
                                  "Unknown"}
                              </td>
                              <td className="px-5 py-3 text-gray-800">
                                {result.score ?? 0}/{result.totalMarks ?? 0}
                              </td>
                              <td className="px-5 py-3">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    (result.percentage ?? 0) >= 60
                                      ? "bg-green-100 text-green-700"
                                      : (result.percentage ?? 0) >= 40
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {result.percentage ?? 0}%
                                </span>
                              </td>
                              <td className="px-5 py-3 text-gray-500">
                                {result.submittedAt
                                  ? new Date(
                                      result.submittedAt,
                                    ).toLocaleString()
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ===== MANAGE EXAMS TAB ===== */}
        {activeTab === "exams" && (
          <>
            {examsError && (
              <ErrorMessage message={examsError} onRetry={fetchExams} />
            )}
            {deleteError && <ErrorMessage message={deleteError} />}

            {examsLoading ? (
              <Loading message="Loading exams..." />
            ) : exams.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                  <svg
                    className="h-7 w-7 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-900">No exams found</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Import an exam to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <div
                    key={exam._id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-gray-900">
                          {exam.title}
                        </h3>
                        {exam.difficulty && (
                          <span
                            className={`inline-flex flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              exam.difficulty === "Easy"
                                ? "bg-green-50 text-green-700"
                                : exam.difficulty === "Medium"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                            }`}
                          >
                            {exam.difficulty}
                          </span>
                        )}
                        {exam.isPublished ? (
                          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-gray-500">
                        {exam.subject} · {exam.totalQuestions ?? 0} questions ·{" "}
                        {exam.duration ?? 0} min
                      </p>
                    </div>

                    <button
                      onClick={() => setExamToDelete(exam)}
                      className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
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
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(examToDelete)}
        title="Delete this exam?"
        message={`"${examToDelete?.title}" and all its questions will be permanently deleted. This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setExamToDelete(null)}
        loading={deleting}
      />
    </main>
  );
};

export default AdminDashboard;
