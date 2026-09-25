import React from "react";

const QuestionCard = ({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerChange,
}) => {
  if (!question) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-medium text-gray-500">
        Question {questionNumber}
      </p>

      <h2 className="mt-2 text-lg font-semibold leading-7 text-gray-900">
        {question.question}
      </h2>

      <div className="mt-6 space-y-3">
        {question.options.map((option, index) => {
          const optionId = `option-${question._id}-${index}`;
          const selected = selectedAnswer === option;

          return (
            <label
              key={optionId}
              htmlFor={optionId}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                selected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                id={optionId}
                type="radio"
                name={`question-${question._id}`}
                value={option}
                checked={selected}
                onChange={() => onAnswerChange(question._id, option)}
                className="mt-1 h-4 w-4 accent-blue-600"
              />
              <span className="text-sm leading-6 text-gray-800">
                {option}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
