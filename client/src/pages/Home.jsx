import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="mx-auto max-w-4xl py-16 text-center">
      <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">
        MERN Online Test Platform
      </span>
      <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
        Practice, test and track your performance.
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-slate-600">
        Take timed exams, navigate questions easily, and view your results.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/exams" className="rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white">
          Browse Exams
        </Link>
        <Link to="/login" className="rounded-lg border bg-white px-5 py-3 font-medium">
          Login
        </Link>
      </div>
    </section>
  );
}
