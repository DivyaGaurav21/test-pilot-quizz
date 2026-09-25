import api from './api';

export const getExams = async () => {
  const { data } = await api.get('/exams');
  return data;
};

export const getExam = async (id) => {
  const { data } = await api.get(`/exams/${id}`);
  return data;
};

export const submitResult = async (examId, answers) => {
  const { data } = await api.post('/results', { examId, answers });
  return data;
};
