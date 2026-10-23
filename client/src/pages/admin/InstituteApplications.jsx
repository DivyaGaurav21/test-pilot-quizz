import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";

const InstituteApplications = () => {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState("");
  const [rejectionReasons, setRejectionReasons] = useState({});

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setInstitutes(await adminService.getInstituteApplications());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load institute applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const review = async (institute, status) => {
    try {
      setWorkingId(institute._id);
      setError("");
      const updated = await adminService.reviewInstitute(
        institute._id,
        status,
        rejectionReasons[institute._id] || "",
      );
      setInstitutes((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to review institute application.");
    } finally {
      setWorkingId("");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link to="/admin" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">← Admin dashboard</Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Institute applications</h1>
        <p className="mt-1 text-sm text-slate-600">Approve or reject institute account requests.</p>

        {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading ? (
          <p className="mt-6 text-slate-600">Loading applications...</p>
        ) : institutes.length === 0 ? (
          <p className="mt-6 rounded-xl border bg-white p-6 text-slate-600">No institute applications have been submitted.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {institutes.map((institute) => (
              <li key={institute._id} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">{institute.name}</h2>
                    <p className="text-sm text-slate-600">{institute.contactEmail}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Owner: {institute.ownerId?.name} ({institute.ownerId?.email})
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Status: {institute.status}</p>
                    {institute.rejectionReason && <p className="mt-2 text-sm text-red-700">Reason: {institute.rejectionReason}</p>}
                    {institute.status !== "approved" && (
                      <label className="mt-3 block text-sm text-slate-700">
                        Rejection reason (optional)
                        <textarea
                          value={rejectionReasons[institute._id] || ""}
                          onChange={(event) => setRejectionReasons((current) => ({
                            ...current,
                            [institute._id]: event.target.value,
                          }))}
                          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
                          rows={2}
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={workingId === institute._id || institute.status === "approved"}
                      onClick={() => review(institute, "approved")}
                      className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={workingId === institute._id || institute.status === "rejected"}
                      onClick={() => review(institute, "rejected")}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Reject
                    </button>
                    {institute.status === "approved" && (
                      <button
                        type="button"
                        disabled={workingId === institute._id}
                        onClick={() => review(institute, "suspended")}
                        className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default InstituteApplications;
