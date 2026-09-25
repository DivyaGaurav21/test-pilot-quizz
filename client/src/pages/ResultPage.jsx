import { useParams } from 'react-router-dom';
import ResultSummary from '../components/exam/ResultSummary';

export default function ResultPage() {
  const { id } = useParams();

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-4 text-sm text-slate-500">Result ID: {id}</p>
      <ResultSummary result={{ score: 0, correctAnswers: 0, totalQuestions: 0 }} />
    </div>
  );
}
