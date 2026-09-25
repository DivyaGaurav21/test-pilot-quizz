import React, { useEffect, useState } from "react";

const formatSeconds = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

const ExamTimer = ({ durationMinutes, onTimeUp }) => {
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.max(0, Math.floor(durationMinutes * 60))
  );

  useEffect(() => {
    if (remainingSeconds <= 0) {
      onTimeUp?.();
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [remainingSeconds, onTimeUp]);

  const isLowTime = remainingSeconds <= 60;

  return (
    <div
      className={`rounded-lg border px-4 py-2 text-center ${
        isLowTime
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-gray-200 bg-white text-gray-800"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide">
        Time Remaining
      </p>
      <p className="mt-0.5 font-mono text-lg font-bold">
        {formatSeconds(remainingSeconds)}
      </p>
    </div>
  );
};

export default ExamTimer;
