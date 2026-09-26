// import React, { useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useExamContext } from "../context/ExamContext.jsx";
// import Loading from "../components/common/Loading";
// import ErrorMessage from "../components/common/ErrorMessage";

// const ExamInstructions = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { exam, questions, loading, error, submitExam } = useExamContext();
//   const [starting, setStarting] = useState(false);
//   const [uiError , setUiError] = useState("");


//   const handleStart = async () => {
//     try {
//       setStarting(true);
//       await startExam(id);
//       navigate(`/exams/${id}/start`);
//     } catch(err) {
//       setUiError(err.message)
//     } finally {
//       setStarting(false);
//     }
//   };

//   if (loading && !exam) {
//     return <Loading message="Loading exam instructions..." />;
//   }

//   return (
//     <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-3xl">
//         {error && !exam && (
//           <ErrorMessage message={error} onRetry={() => fetchExam(id)} />
//         )}
//         {uiError && <p className="bg-red-500 text-white">{uiError}</p>}

//         {exam && (
//           <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
//             <Link
//               to="/exams"
//               className="text-sm font-medium text-blue-600 hover:text-blue-700"
//             >
//               ← Back to Exams
//             </Link>

//             <h1 className="mt-5 text-2xl font-bold text-gray-900">
//               {exam.title}
//             </h1>

//             <div className="mt-6 grid gap-4 sm:grid-cols-3">
//               <div className="rounded-lg bg-gray-50 p-4">
//                 <p className="text-xs text-gray-500">Subject</p>
//                 <p className="mt-1 font-semibold text-gray-900">
//                   {exam.subject || "-"}
//                 </p>
//               </div>

//               <div className="rounded-lg bg-gray-50 p-4">
//                 <p className="text-xs text-gray-500">Questions</p>
//                 <p className="mt-1 font-semibold text-gray-900">
//                   {exam.totalQuestions ?? 0}
//                 </p>
//               </div>

//               <div className="rounded-lg bg-gray-50 p-4">
//                 <p className="text-xs text-gray-500">Duration</p>
//                 <p className="mt-1 font-semibold text-gray-900">
//                   {exam.duration ?? 0} minutes
//                 </p>
//               </div>
//             </div>

//             <div className="mt-8">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 Instructions
//               </h2>

//               <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-600">
//                 <li>Read every question carefully before answering.</li>
//                 <li>You can navigate between questions.</li>
//                 <li>You can mark questions for review.</li>
//                 <li>The exam will be submitted automatically when time ends.</li>
//                 <li>Do not refresh or close the browser during the exam.</li>
//               </ul>
//             </div>

//             {error && (
//               <div className="mt-5">
//                 <ErrorMessage message={error} />
//               </div>
//             )}

//             <button
//               type="button"
//               onClick={handleStart}
//               disabled={starting}
//               className="mt-8 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {starting ? "Starting..." : "Start Exam"}
//             </button>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// };

// export default ExamInstructions;

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useExamContext } from "../context/ExamContext.jsx";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";

const ExamInstructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exam, loading, error, fetchExam, startExam } = useExamContext();
  const [starting, setStarting] = useState(false);
  const [uiError, setUiError] = useState("");

  useEffect(() => {
    fetchExam(id);
  }, [fetchExam, id]);

  const handleStart = async () => {
    try {
      setStarting(true);
      setUiError("");
      await startExam(id);
      navigate(`/exams/${id}/start`);
    } catch (err) {
      setUiError(err.message);
    } finally {
      setStarting(false);
    }
  };

  if (loading && !exam) {
    return <Loading message="Loading exam instructions..." />;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {error && !exam && (
          <ErrorMessage message={error} onRetry={() => fetchExam(id)} />
        )}
        {uiError && <p className="bg-red-500 text-white">{uiError}</p>}

        {exam && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <Link
              to="/exams"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to Exams
            </Link>

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              {exam.title}
            </h1>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Subject</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {exam.subject || "-"}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Questions</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {exam.totalQuestions ?? 0}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {exam.duration ?? 0} minutes
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">
                Instructions
              </h2>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-600">
                <li>Read every question carefully before answering.</li>
                <li>You can navigate between questions.</li>
                <li>You can mark questions for review.</li>
                <li>The exam will be submitted automatically when time ends.</li>
                <li>Do not refresh or close the browser during the exam.</li>
              </ul>
            </div>

            {error && (
              <div className="mt-5">
                <ErrorMessage message={error} />
              </div>
            )}

            <button
              type="button"
              onClick={handleStart}
              disabled={starting}
              className="mt-8 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {starting ? "Starting..." : "Start Exam"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default ExamInstructions;