import api from "./api";

const importExamJson = async (examData) => {
  const response = await api.post("/admin/import-json", examData);
  return response.data;
};

const getAdminResults = async () => {
  const response = await api.get("/admin/results");
  return response.data;
};

const adminService = {
  importExamJson,
  getAdminResults,
};

export default adminService;
