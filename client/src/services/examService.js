import api from "./api";

const getExams = async () => {
  const response = await api.get("/exams");
  return response.data;
};

const getExamById = async (examId) => {
  const response = await api.get(`/exams/${examId}`);
  return response.data;
};

const startExam = async (examId) => {
  const response = await api.post(`/exams/${examId}/start`);
  console.log(response, "sdfghjhgfdasgfdgh")
  return response.data;
};

const submitExam = async (examId, answers, timeTaken) => {
  const response = await api.post(`/exams/${examId}/submit`, {
    answers,
    timeTaken,
  });
  return response.data;
};

const examService = {
  getExams,
  getExamById,
  startExam,
  submitExam,
};

export default examService;
