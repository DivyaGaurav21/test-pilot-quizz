import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import examService from "../../services/examService";

const ExamCard = ({ exam }) => {
  const { isAuthenticated } = useAuth();
  const [purchaseState, setPurchaseState] = useState("");
  const [purchaseError, setPurchaseError] = useState("");

  const handlePurchase = async () => {
    try {
      setPurchaseError("");
      const response = await examService.purchaseExam(exam._id);
      setPurchaseState(response.status === "verified" ? "Purchase verified." : "Payment request sent for manual verification.");
    } catch (error) {
      setPurchaseError(error.response?.data?.message || "Unable to request purchase.");
    }
  };

  return (
    <article className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex-1">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {exam.title}
          </h2>

          {exam.difficulty && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {exam.difficulty}
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-800">Subject:</span>{" "}
            {exam.subject || "-"}
          </p>
          {exam.pricePaise > 0 && (
            <p>
              <span className="font-medium text-gray-800">Price:</span>{" "}
              {(exam.priceCurrency || "INR")} {(exam.pricePaise / 100).toFixed(2)}
            </p>
          )}
          <p>
            <span className="font-medium text-gray-800">Topic:</span>{" "}
            {exam.topic || "-"}
          </p>
          <p>
            <span className="font-medium text-gray-800">Questions:</span>{" "}
            {exam.totalQuestions ?? 0}
          </p>
          <p>
            <span className="font-medium text-gray-800">Duration:</span>{" "}
            {exam.duration ?? 0} minutes
          </p>
        </div>
      </div>

      <Link
        to={`/exams/${exam._id}/instructions`}
        className="mt-5 inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        View Exam
      </Link>
      {exam.pricePaise > 0 && isAuthenticated && (
        <button
          type="button"
          onClick={handlePurchase}
          className="mt-2 rounded-lg border border-indigo-300 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
        >
          Request purchase
        </button>
      )}
      {exam.pricePaise > 0 && !isAuthenticated && (
        <p className="mt-2 text-center text-xs text-slate-600">Sign in to request a purchase.</p>
      )}
      {purchaseState && <p role="status" className="mt-2 text-center text-xs text-green-700">{purchaseState}</p>}
      {purchaseError && <p role="alert" className="mt-2 text-center text-xs text-red-700">{purchaseError}</p>}
    </article>
  );
};

export default ExamCard;
