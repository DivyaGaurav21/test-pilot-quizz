import { Link } from "react-router-dom";

const articles = [
  {
    category: "Study habits",
    title: "Make practice tests part of your weekly routine",
    summary:
      "Short, regular attempts can help you spot gaps and build confidence over time.",
    readingTime: "4 min read",
  },
  {
    category: "Test strategy",
    title: "How to learn from a test result",
    summary:
      "Use your score as a starting point: revisit tricky topics, then try again.",
    readingTime: "3 min read",
  },
  {
    category: "For institutes",
    title: "A clearer way to share practice material",
    summary:
      "Organize tests for learners and keep results accessible to your teaching team.",
    readingTime: "5 min read",
  },
];

const Blog = () => (
  <main className="min-h-[70vh] bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
        The learning journal
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
        Ideas for better practice.
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-600">
        Guides for learners and institutes building a thoughtful test-taking
        routine.
      </p>
      <div className="mt-9 grid gap-5 md:grid-cols-3">
        {articles.map((article) => (
          <article
            key={article.title}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              {article.category}
            </p>
            <h2 className="mt-4 text-xl font-bold leading-7 text-slate-950">
              {article.title}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
              {article.summary}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
              <span>{article.readingTime}</span>
              <span>Test Pilot</span>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-5 text-xs text-slate-500">
        These introductory guides are editorial previews; new articles will be
        added here.
      </p>
      <Link
        to="/exams"
        className="mt-8 inline-flex font-bold text-indigo-700 hover:text-indigo-900"
      >
        Put an idea into practice{" "}
        <span aria-hidden="true" className="ml-2">
          →
        </span>
      </Link>
    </div>
  </main>
);

export default Blog;
