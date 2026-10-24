import api from "./api";

const importExamJson = async (examData) => {
  const response = await api.post("/admin/import-json", examData);
  return response.data;
};

const getAdminResults = async () => {
  const response = await api.get("/admin/results");
  return response.data;
};

const getAdminOverview = async () => {
  const response = await api.get("/admin/overview");
  return response.data;
};

const getAdminStudents = async () => {
  const response = await api.get("/admin/students");
  return response.data;
};

const getInstituteApplications = async () => {
  const response = await api.get("/admin/institutes");
  return response.data;
};

const reviewInstitute = async (instituteId, status, rejectionReason = "") => {
  const response = await api.patch(`/admin/institutes/${instituteId}`, {
    status,
    rejectionReason,
  });
  return response.data;
};

const adminService = {
  importExamJson,
  getAdminResults,
  getAdminOverview,
  getAdminStudents,
  getInstituteApplications,
  reviewInstitute,
};

export default adminService;
