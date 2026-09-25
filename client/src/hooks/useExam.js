import { useEffect, useState } from 'react';
import { getExam, submitResult } from '../services/examService';
import { useNavigate } from 'react-router-dom';

export function useExam(id) {
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    getExam(id)
      .then(setExam)
      .finally(() => setLoading(false));
  }, [id]);

  const setAnswer = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const submitExam = async () => {
    if (!exam) return;
    const result = await submitResult(id, answers);
    navigate(`/results/${result._id}`);
  };

  return { exam, loading, current, answers, setAnswer, setCurrent, submitExam };
}
