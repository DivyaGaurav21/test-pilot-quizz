import React from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";

const QuestionNavigation = ({
  questions = [],
  currentIndex,
  answers = {},
  onSelect,
}) => {
  const { t } = useLanguage();

  const total = questions.length;
  const answeredCount = questions.filter((q) => Boolean(answers[q._id])).length;
  const progressPercent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  return (
    <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          {t("navigation.questions")}
        </h3>
        <span className="text-xs font-medium text-gray-400">
          {answeredCount}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-[11px] font-medium text-gray-400">
          {progressPercent}% {t("navigation.completed")}
        </p>
      </div>

      {/* Question grid */}
      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">
        {questions.map((question, index) => {
          const answered = Boolean(answers[question._id]);
          const current = currentIndex === index;

          let className =
            "relative flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-200 hover:scale-110 active:scale-95";

          if (current) {
            className +=
              " border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200 ring-2 ring-blue-200 ring-offset-1";
          } else if (answered) {
            className +=
              " border-green-300 bg-green-50 text-green-700 hover:border-green-400 hover:bg-green-100";
          } else {
            className +=
              " border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50";
          }

          return (
            <button
              key={question._id}
              type="button"
              onClick={() => onSelect(index)}
              className={className}
              aria-label={`Go to question ${index + 1}`}
              aria-current={current ? "true" : "false"}
            >
              {index + 1}
              {current && (
                <span className="absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 flex-shrink-0 rounded-md border border-blue-600 bg-blue-600" />
          {t("navigation.current")}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 flex-shrink-0 rounded-md border border-green-300 bg-green-50" />
          {t("navigation.answered")}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 flex-shrink-0 rounded-md border border-gray-200 bg-white" />
          {t("navigation.unanswered")}
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigation;