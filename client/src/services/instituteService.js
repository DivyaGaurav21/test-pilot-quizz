import api from "./api";

const getMyInstitute = async () => {
  const response = await api.get("/institutes/me");
  return response.data.institute;
};

const getPopularInstitutes = async () => {
  const response = await api.get("/institutes/popular");
  return response.data;
};

const registerInstitute = async (details) => {
  const response = await api.post("/institutes/register", details);
  return response.data;
};

const getExams = async () => {
  const response = await api.get("/institutes/me/exams");
  return response.data;
};

const importExamJson = async (examData) => {
  const response = await api.post("/institutes/me/exams/import-json", examData);
  return response.data;
};

const updateExam = async (examId, isPublished, pricePaise) => {
  const response = await api.patch(`/institutes/me/exams/${examId}`, {
    ...(isPublished !== undefined ? { isPublished } : {}),
    ...(pricePaise !== undefined ? { pricePaise } : {}),
  });
  return response.data;
};

const getResults = async () => {
  const response = await api.get("/institutes/me/results");
  return response.data;
};

const instituteService = {
  getMyInstitute,
  getPopularInstitutes,
  registerInstitute,
  getExams,
  importExamJson,
  updateExam,
  getResults,
};

export default instituteService;
