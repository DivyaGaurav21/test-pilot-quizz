import React from "react";

const ResultSummary = ({ result }) => {
  if (!result) return null;

  const stats = [
    {
      label: "Score",
      value: `${result.score ?? 0}/${result.totalMarks ?? 0}`,
    },
    {
      label: "Correct",
      value: result.correctAnswers ?? 0,
    },
    {
      label: "Wrong",
      value: result.wrongAnswers ?? 0,
    },
    {
      label: "Unanswered",
      value: result.unanswered ?? 0,
    },
    {
      label: "Percentage",
      value: `${result.percentage ?? 0}%`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm"
        >
          <p className="text-sm text-gray-500">{stat.label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ResultSummary;
