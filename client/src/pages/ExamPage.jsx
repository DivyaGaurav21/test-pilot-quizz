import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionCard from "../components/exam/QuestionCard";
import QuestionNavigation from "../components/exam/QuestionNavigation";
import ExamTimer from "../components/exam/ExamTimer";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import { useExamContext } from "../context/ExamContext.jsx";

const ExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exam, questions, loading, error, submitExam } = useExamContext();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [examStartedAt] = useState(() => Date.now());

  const currentQuestion = questions[currentIndex];

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: answer,
    }));
  };

  const toggleReview = () => {
    if (!currentQuestion) return;

    setMarkedForReview((current) =>
      current.includes(currentQuestion._id)
        ? current.filter((questionId) => questionId !== currentQuestion._id)
        : [...current, currentQuestion._id]
    );
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    const confirmed = window.confirm(
      "Are you sure you want to submit the exam?"
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      const timeTaken = Math.floor((Date.now() - examStartedAt) / 1000);
      const response = await submitExam(id, answers, timeTaken);

      const resultId =
        response?.result?._id || response?.data?._id || response?._id;

      if (resultId) {
        navigate(`/results/${resultId}`);
      } else {
        navigate("/results");
      }
    } catch {
      // Error is handled by context.
    } finally {
      setSubmitting(false);
    }
  }, [answers, examStartedAt, id, navigate, submitExam, submitting]);

  if (loading && !exam) {
    return <Loading message="Loading exam..." />;
  }

  // Direct visit / page refresh guard — context is empty
  if (!exam || questions.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <ErrorMessage message="No active exam session found. Please start the exam again." />
          <button
            type="button"
            onClick={() => navigate(`/exams/${id}/instructions`)}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to Instructions
          </button>
        </div>
      </main>
    );
  }

  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-sm text-gray-500">
              {currentIndex + 1} of {questions.length}
            </p>
          </div>

          <ExamTimer
            durationMinutes={exam.duration}
            onTimeUp={handleSubmit}
          />
        </div>

        {error && (
          <div className="mb-5">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <section>
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              selectedAnswer={answers[currentQuestion._id]}
              onAnswerChange={handleAnswerChange}
            />

              
              <div className="flex gap-3 mt-5 flex-col md:flex-row">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((index) => index - 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                {!isLastQuestion ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((index) => index + 1)}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit Exam"}
                  </button>
                )}
              </div>
          </section>

          <aside>
            <QuestionNavigation
              questions={questions}
              currentIndex={currentIndex}
              answers={answers}
              onSelect={setCurrentIndex}
            />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default ExamPage;