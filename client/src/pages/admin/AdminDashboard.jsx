import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <AdminSidebar />
      <section className="rounded-xl border bg-white p-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Create exams and import question sets from JSON.
        </p>
      </section>
    </div>
  );
}
