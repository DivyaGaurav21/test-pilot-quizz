import React from "react";

const QuestionNavigation = ({
  questions = [],
  currentIndex,
  answers = {},
  markedForReview = [],
  onSelect,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Questions
      </h3>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
        {questions.map((question, index) => {
          const answered = Boolean(answers[question._id]);
          const marked = markedForReview.includes(question._id);
          const current = currentIndex === index;

          let className =
            "flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold";

          if (current) {
            className += " border-blue-600 bg-blue-600 text-white";
          } else if (marked) {
            className += " border-yellow-400 bg-yellow-50 text-yellow-700";
          } else if (answered) {
            className += " border-green-300 bg-green-50 text-green-700";
          } else {
            className += " border-gray-200 bg-white text-gray-600";
          }

          return (
            <button
              key={question._id}
              type="button"
              onClick={() => onSelect(index)}
              className={className}
              aria-label={`Go to question ${index + 1}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
        <span>● Answered</span>
        <span>● Review</span>
        <span>● Unanswered</span>
      </div>
    </div>
  );
};

export default QuestionNavigation;
