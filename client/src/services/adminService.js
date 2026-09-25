import api from './api';

export const importExam = async (examData) => {
  const { data } = await api.post('/admin/exams/import', examData);
  return data;
};
