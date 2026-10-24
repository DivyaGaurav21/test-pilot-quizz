import { Link } from "react-router-dom";

const About = () => (
  <main className="min-h-[70vh] bg-white px-4 py-14 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
        About Test Pilot
      </p>
      <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
        Practice should feel like progress.
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
        Test Pilot brings practice tests and learning communities together.
        Learners can explore published tests, take timed attempts, and review
        results. Institutes can apply to publish their own material and follow
        learner outcomes.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["For learners", "Find practice that fits your subject and goals."],
          ["For institutes", "Manage test content and see learner results."],
          ["For learning", "Use every attempt to guide the next step."],
        ].map(([title, description]) => (
          <section
            key={title}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
          >
            <h2 className="font-bold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {description}
            </p>
          </section>
        ))}
      </div>
      <div className="mt-9 flex flex-wrap gap-3">
        <Link
          to="/exams"
          className="rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-800"
        >
          Browse tests
        </Link>
        <Link
          to="/institutes"
          className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          For institutes
        </Link>
      </div>
    </div>
  </main>
);

export default About;
