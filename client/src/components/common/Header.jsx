import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          TestForge
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/exams" className="hover:text-indigo-600">Exams</Link>
          {user && <Link to="/profile" className="hover:text-indigo-600">Profile</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="hover:text-indigo-600">Admin</Link>}
          {user ? (
            <button onClick={logout} className="rounded-lg bg-slate-900 px-3 py-2 text-white">
              Logout
            </button>
          ) : (
            <Link to="/login" className="rounded-lg bg-indigo-600 px-3 py-2 text-white">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
