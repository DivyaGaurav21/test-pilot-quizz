import { useEffect, useState } from 'react';
import ExamCard from '../components/exam/ExamCard';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { getExams } from '../services/examService';

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getExams()
      .then(setExams)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load exams'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <section>
      <h1 className="text-3xl font-bold">Available Exams</h1>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => <ExamCard key={exam._id} exam={exam} />)}
      </div>
      {!exams.length && <p className="mt-8 text-slate-500">No exams available yet.</p>}
    </section>
  );
}
