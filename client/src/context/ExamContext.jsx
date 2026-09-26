import { createContext, useCallback, useContext, useState } from "react";
import examService from "../services/examService";

const ExamContext = createContext(null);

export const ExamProvider = ({ children }) => {
  const [exam, setExam] = useState(null);       // metadata
  const [questions, setQuestions] = useState([]); // question list
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchExam = useCallback(async (examId) => {
    try {
      setLoading(true);
      setError("");
      const response = await examService.getExamById(examId);
      const examData = response.exam || response.data || response;
      setExam(examData);
      return examData;
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exam.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const startExam = useCallback(async (examId) => {
    try {
      setLoading(true);
      setError("");
      const response = await examService.startExam(examId);
      // response = { exam, questions }
      setExam(response.exam);
      setQuestions(response.questions || []);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Unable to start exam.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitExam = useCallback(async (examId, answers, timeTaken) => {
    try {
      setLoading(true);
      setError("");
      return await examService.submitExam(examId, answers, timeTaken);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit exam.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ExamContext.Provider
      value={{ exam, questions, loading, error, fetchExam, startExam, submitExam }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExamContext = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExamContext must be used within ExamProvider");
  return ctx;
};