import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import ResultSummary from "../components/exam/ResultSummary";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";

const ResultPage = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResult = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/results/${id}`);
      setResult(response.data.result || response.data.data || response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load result."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/results/${id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `exam-result-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to download result PDF."
      );
    }
  };

  useEffect(() => {
    loadResult();
  }, [id]);

  if (loading) {
    return <Loading message="Loading result..." />;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {error && <ErrorMessage message={error} onRetry={loadResult} />}

        {result && (
          <>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Exam Result
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Your submitted exam result is shown below.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Download PDF
              </button>
            </div>

            <ResultSummary result={result} />

            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900">Exam Details</h2>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-800">Exam:</span>{" "}
                  {result.examId?.title || result.exam?.title || "-"}
                </p>
                <p>
                  <span className="font-medium text-gray-800">
                    Time Taken:
                  </span>{" "}
                  {result.timeTaken ?? 0} seconds
                </p>
                <p>
                  <span className="font-medium text-gray-800">
                    Submitted:
                  </span>{" "}
                  {result.submittedAt
                    ? new Date(result.submittedAt).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/exams"
                className="inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Back to Exams
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default ResultPage;
