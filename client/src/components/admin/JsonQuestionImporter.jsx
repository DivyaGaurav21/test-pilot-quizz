import React, { useState } from "react";
import adminService from "../../services/adminService";

const SAMPLE_JSON = {
  exam: "SSC CGL",
  subject: "Quantitative Aptitude",
  duration: 60,
  topic: "Percentage",
  difficulty: "Easy",
  questions: [
    {
      id: 1,
      question: "What is 25% of 240?",
      options: ["40", "50", "60", "70"],
      correctAnswer: "60",
      explanation: "25% = 1/4. Therefore, 240 ÷ 4 = 60.",
    },
  ],
};

const validateExamData = (data) => {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["JSON must contain an exam object."];
  }

  if (!data.exam || typeof data.exam !== "string" || !data.exam.trim()) {
    errors.push("exam is required.");
  }

  if (
    !data.subject ||
    typeof data.subject !== "string" ||
    !data.subject.trim()
  ) {
    errors.push("subject is required.");
  }

  if (
    typeof data.duration !== "number" ||
    !Number.isFinite(data.duration) ||
    data.duration <= 0
  ) {
    errors.push("duration must be a positive number.");
  }

  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push("questions must be a non-empty array.");
    return errors;
  }

  data.questions.forEach((item, index) => {
    const position = index + 1;

    if (
      !item ||
      typeof item.question !== "string" ||
      !item.question.trim()
    ) {
      errors.push(`Question ${position}: question text is required.`);
    }

    if (!Array.isArray(item.options) || item.options.length !== 4) {
      errors.push(`Question ${position}: exactly 4 options are required.`);
    }

    if (
      !item.correctAnswer ||
      !Array.isArray(item.options) ||
      !item.options.includes(item.correctAnswer)
    ) {
      errors.push(
        `Question ${position}: correctAnswer must match one of the options.`
      );
    }

    if (
      typeof item.explanation !== "string" ||
      !item.explanation.trim()
    ) {
      errors.push(`Question ${position}: explanation is required.`);
    }
  });

  return errors;
};

const JsonQuestionImporter = ({ onSuccess }) => {
  const [jsonText, setJsonText] = useState(
    JSON.stringify(SAMPLE_JSON, null, 2)
  );
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleValidate = () => {
    setMessage("");
    setErrors([]);

    try {
      const data = JSON.parse(jsonText);
      const validationErrors = validateExamData(data);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      setMessage("JSON is valid and ready to import.");
    } catch {
      setErrors(["Invalid JSON format. Please check commas, quotes and brackets."]);
    }
  };

  const handleImport = async () => {
    setMessage("");
    setErrors([]);

    let data;

    try {
      data = JSON.parse(jsonText);
    } catch {
      setErrors(["Invalid JSON format. Please check your JSON."]);
      return;
    }

    const validationErrors = validateExamData(data);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const response = await adminService.importExamJson(data);

      setMessage(response?.message || "Exam imported successfully.");
      onSuccess?.(response);
    } catch (err) {
      const backendErrors = err.response?.data?.errors;

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        setErrors(backendErrors);
      } else {
        setErrors([
          err.response?.data?.message || "Unable to import exam.",
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJsonText(JSON.stringify(SAMPLE_JSON, null, 2));
    setErrors([]);
    setMessage("");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Exam JSON
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Paste the complete exam JSON. The backend will validate it again
          before saving.
        </p>
      </div>

      <textarea
        value={jsonText}
        onChange={(event) => {
          setJsonText(event.target.value);
          setErrors([]);
          setMessage("");
        }}
        spellCheck={false}
        className="min-h-[420px] w-full rounded-lg border border-gray-300 bg-gray-950 p-4 font-mono text-sm leading-6 text-gray-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        placeholder="Paste exam JSON here..."
        aria-label="Exam JSON"
      />

      {errors.length > 0 && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-800">Please fix the following:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {errors.map((error, index) => (
              <li key={`${error}-${index}`}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={handleValidate}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Validate JSON
        </button>

        <button
          type="button"
          onClick={handleImport}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Importing..." : "Import Exam"}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default JsonQuestionImporter;
