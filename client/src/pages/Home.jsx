import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";

const Home = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <main className="bg-gray-50">
      {/* Hero section with background image */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop')",
          }}
        />

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-indigo-900/80" />
        {/* Decorative blur blobs */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-blue-100 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                {t("home.badge")}
              </span>

              <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
               {t("home.title")}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
               {t("home.subtitle")}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/exams"
                  className="inline-flex justify-center rounded-lg bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-blue-500/40"
                >
                  {t("home.exploreExams")}
                </Link>

                {!user && (
                  <Link
                    to="/register"
                    className="inline-flex justify-center rounded-lg border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    {t("home.createAccount")}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards — overlapping the hero for depth */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="-mt-12 grid gap-5 sm:grid-cols-3">
            <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mt-4 font-semibold text-gray-900">{t("home.timedTests")}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
               {t("home.timedTestsDesc")}
              </p>
            </div>

            <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 transition group-hover:bg-green-600 group-hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mt-4 font-semibold text-gray-900">{t("home.instantResults")}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {t("home.instantResultsDesc")}
              </p>
            </div>

            <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="mt-4 font-semibold text-gray-900">{t("home.trackProgress")}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {t("home.trackProgressDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;