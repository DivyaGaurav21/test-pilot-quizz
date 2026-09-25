import React, { useState } from "react";
import { Link } from "react-router-dom";
import JsonQuestionImporter from "../../components/admin/JsonQuestionImporter";

const AdminImport = () => {
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            to="/admin"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Import Exam
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Paste valid exam JSON to create an exam and its questions.
          </p>
        </div>

        {successMessage && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <JsonQuestionImporter
          onSuccess={(data) => {
            setSuccessMessage(
              data?.message || "Exam imported successfully."
            );
          }}
        />
      </div>
    </div>
  );
};

export default AdminImport;
