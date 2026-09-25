import AdminSidebar from '../../components/admin/AdminSidebar';
import JsonQuestionImporter from '../../components/admin/JsonQuestionImporter';
import { importExam } from '../../services/adminService';

export default function AdminImport() {
  const handleImport = async (data) => {
    try {
      await importExam(data);
      alert('Exam imported successfully.');
    } catch (error) {
      alert(error.response?.data?.message || 'Import failed.');
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <AdminSidebar />
      <section className="rounded-xl border bg-white p-6">
        <h1 className="text-2xl font-bold">Import Exam JSON</h1>
        <p className="mt-2 text-sm text-slate-500">
          Paste the complete exam JSON and validate it before importing.
        </p>
        <div className="mt-6">
          <JsonQuestionImporter onImport={handleImport} />
        </div>
      </section>
    </div>
  );
}
