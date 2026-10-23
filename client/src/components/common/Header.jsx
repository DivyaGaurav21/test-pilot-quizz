import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

const publicLinks = [
  { to: "/exams", label: "Browse tests" },
  { to: "/institutes", label: "For institutes" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const dashboardPath = ["admin", "super_admin"].includes(user?.role) ? "/admin" : "/dashboard";
  const institutePath = user ? "/institute" : "/institutes";

  const linkClass = ({ isActive }) => (
    `whitespace-nowrap text-sm font-semibold transition-colors ${
      isActive ? "text-indigo-700" : "text-slate-600 hover:text-indigo-700"
    }`
  );
  const mobileLinkClass = ({ isActive }) => (
    `rounded-lg px-3 py-2.5 text-sm font-semibold ${
      isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
    }`
  );
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" onClick={closeMenu} className="shrink-0 text-indigo-700">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {publicLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to === "/institutes" ? institutePath : item.to}
              className={linkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link to={dashboardPath} className="text-sm font-semibold text-slate-700 hover:text-indigo-700">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-2 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-700">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-4 md:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {publicLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to === "/institutes" ? institutePath : item.to}
                onClick={closeMenu}
                className={mobileLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to={dashboardPath} onClick={closeMenu} className={mobileLinkClass}>Dashboard</NavLink>
                <button
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className="mt-2 rounded-lg bg-slate-900 px-4 py-2.5 text-left text-sm font-semibold text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <Link to="/login" onClick={closeMenu} className="flex-1 rounded-lg border px-4 py-2.5 text-center text-sm font-semibold text-slate-700">
                  Log in
                </Link>
                <Link to="/register" onClick={closeMenu} className="flex-1 rounded-lg bg-indigo-700 px-4 py-2.5 text-center text-sm font-semibold text-white">
                  Get started
                </Link>
              </div>
            )}
            <div className="mt-3 border-t border-slate-100 pt-3">
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
