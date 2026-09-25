import React from "react";
import { Link } from "react-router-dom";

const ExamCard = ({ exam }) => {
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
        to={`/exams/${exam._id}`}
        className="mt-5 inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        View Exam
      </Link>
    </article>
  );
};

export default ExamCard;
