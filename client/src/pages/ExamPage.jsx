import { useParams } from 'react-router-dom';
import { useExam } from '../hooks/useExam';
import QuestionCard from '../components/exam/QuestionCard';
import QuestionNavigation from '../components/exam/QuestionNavigation';
import ExamTimer from '../components/exam/ExamTimer';
import Loading from '../components/common/Loading';

export default function ExamPage() {
  const { id } = useParams();
  const {
    exam, loading, current, answers, setAnswer, setCurrent, submitExam,
  } = useExam(id);

  if (loading) return <Loading />;
  if (!exam) return <p>Exam not found.</p>;

  const question = exam.questions?.[current];

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{exam.name}</h1>
        <ExamTimer durationMinutes={exam.durationMinutes || 30} onExpire={submitExam} />
      </div>

      <QuestionNavigation
        total={exam.questions?.length || 0}
        current={current}
        answers={answers}
        onChange={setCurrent}
      />

      {question && (
        <QuestionCard
          question={question}
          selectedOption={answers[current]}
          onSelect={(value) => setAnswer(current, value)}
        />
      )}

      <div className="flex justify-between">
        <button
          disabled={current === 0}
          onClick={() => setCurrent((value) => Math.max(0, value - 1))}
          className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40"
        >
          Previous
        </button>

        {current < exam.questions.length - 1 ? (
          <button
            onClick={() => setCurrent((value) => Math.min(exam.questions.length - 1, value + 1))}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
          >
            Next
          </button>
        ) : (
          <button onClick={submitExam} className="rounded-lg bg-green-600 px-4 py-2 text-white">
            Submit Exam
          </button>
        )}
      </div>
    </section>
  );
}
