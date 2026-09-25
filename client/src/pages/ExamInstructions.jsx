import { Link, useParams } from 'react-router-dom';

export default function ExamInstructions() {
  const { id } = useParams();

  return (
    <div className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Exam Instructions</h1>
      <ul className="mt-5 list-disc space-y-2 pl-5 text-slate-600">
        <li>Make sure you have a stable internet connection.</li>
        <li>The timer starts when you begin the exam.</li>
        <li>Submit the exam before the timer expires.</li>
        <li>Do not refresh the page during the test.</li>
      </ul>
      <Link to={`/exams/${id}/start`} className="mt-8 inline-block rounded-lg bg-indigo-600 px-5 py-3 text-white">
        Start Exam
      </Link>
    </div>
  );
}
