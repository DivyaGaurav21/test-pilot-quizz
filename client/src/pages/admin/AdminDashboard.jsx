import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

const AdminDashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResults = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await adminService.getAdminResults();
      setResults(data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage exams and view submitted results.
            </p>
          </div>

          <Link
            to="/admin/import"
            className="inline-flex w-fit items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Import Exam JSON
          </Link>
        </div>

        {error && <ErrorMessage message={error} onRetry={loadResults} />}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Submitted Results</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {results.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Admin Access</p>
            <p className="mt-2 text-lg font-semibold text-green-600">
              Authorized
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Recent Results</h2>
          </div>

          {results.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500">
              No results available yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Exam</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 font-medium">Percentage</th>
                    <th className="px-5 py-3 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((result) => (
                    <tr key={result._id}>
                      <td className="px-5 py-3 text-gray-800">
                        {result.userId?.name || result.user?.name || "Unknown"}
                      </td>
                      <td className="px-5 py-3 text-gray-800">
                        {result.examId?.title || result.exam?.title || "Unknown"}
                      </td>
                      <td className="px-5 py-3 text-gray-800">
                        {result.score ?? 0}/{result.totalMarks ?? 0}
                      </td>
                      <td className="px-5 py-3 text-gray-800">
                        {result.percentage ?? 0}%
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {result.submittedAt
                          ? new Date(result.submittedAt).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
