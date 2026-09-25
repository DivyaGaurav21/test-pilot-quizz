import React from "react";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex items-center gap-3 text-gray-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Loading;
