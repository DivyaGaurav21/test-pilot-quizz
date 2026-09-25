import React, { useEffect } from "react";
import ExamCard from "../components/exam/ExamCard";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import useExam from "../hooks/useExam";

const Exams = () => {
  const { exams, loading, error, fetchExams } = useExam();

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Available Exams</h1>
          <p className="mt-1 text-sm text-gray-500">
            Choose an exam and start your preparation.
          </p>
        </div>

        {loading && <Loading message="Loading exams..." />}

        {!loading && error && (
          <ErrorMessage message={error} onRetry={fetchExams} />
        )}

        {!loading && !error && exams.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <h2 className="font-semibold text-gray-900">No exams available</h2>
            <p className="mt-1 text-sm text-gray-500">
              Published exams will appear here.
            </p>
          </div>
        )}

        {!loading && !error && exams.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <ExamCard key={exam._id} exam={exam} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Exams;
