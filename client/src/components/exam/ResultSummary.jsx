export default function ResultSummary({ result }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Result Summary</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div><p className="text-sm text-slate-500">Score</p><p className="text-2xl font-bold">{result.score}</p></div>
        <div><p className="text-sm text-slate-500">Correct</p><p className="text-2xl font-bold">{result.correctAnswers}</p></div>
        <div><p className="text-sm text-slate-500">Total</p><p className="text-2xl font-bold">{result.totalQuestions}</p></div>
      </div>
    </div>
  );
}
