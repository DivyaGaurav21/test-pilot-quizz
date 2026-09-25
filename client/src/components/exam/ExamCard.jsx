import { Link } from 'react-router-dom';

export default function ExamCard({ exam }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">{exam.name}</h3>
      <p className="mt-2 text-sm text-slate-500">{exam.description || 'Online examination'}</p>
      <div className="mt-4 flex gap-4 text-sm text-slate-600">
        <span>{exam.durationMinutes} min</span>
        <span>{exam.totalQuestions} questions</span>
      </div>
      <Link
        to={`/exams/${exam._id}/instructions`}
        className="mt-5 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
      >
        View Exam
      </Link>
    </div>
  );
}
