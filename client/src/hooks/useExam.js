import { useCallback, useState } from "react";
import examService from "../services/examService";

const useExam = () => {
  const [exams, setExams] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await examService.getExams();
      setExams(response);
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to load exams.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExam = useCallback(async (examId) => {
    try {
      setLoading(true);
      setError("");

      const response = await examService.getExamById(examId);
      setExam(response);
      return response;
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load exam."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const startExam = useCallback(async (examId) => {
    try {
      setLoading(true);
      setError("");
      return await examService.startExam(examId);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to start exam."
      );
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
      setError(
        err.response?.data?.message || "Unable to submit exam."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exams,
    exam,
    loading,
    error,
    fetchExams,
    fetchExam,
    startExam,
    submitExam,
  };
};

export default useExam;
