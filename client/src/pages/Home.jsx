import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Home = () => {
  const { user } = useAuth();

  return (
    <main className="bg-gray-50">
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              Competitive Exam Preparation
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Practice smarter. Prepare with confidence.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              Take structured online tests, track your performance and improve
              your preparation for competitive exams such as SSC CGL.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/exams"
                className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Explore Exams
              </Link>

              {!user && (
                <Link
                  to="/register"
                  className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900">Timed Tests</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Practice under exam-style time limits.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900">Instant Results</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                See your score, correct, wrong and unanswered questions.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900">Track Progress</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Review your previous test results and keep improving.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
