import React from "react";

const ErrorMessage = ({ message = "Something went wrong.", onRetry }) => {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">{message}</p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
