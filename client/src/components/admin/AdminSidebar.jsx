import { Link } from 'react-router-dom';

export default function AdminSidebar() {
  return (
    <aside className="rounded-xl border bg-white p-4">
      <h2 className="font-bold">Admin Panel</h2>
      <nav className="mt-4 flex flex-col gap-2 text-sm">
        <Link to="/admin" className="rounded px-3 py-2 hover:bg-slate-100">Dashboard</Link>
        <Link to="/admin/import" className="rounded px-3 py-2 hover:bg-slate-100">Import Questions</Link>
      </nav>
    </aside>
  );
}
