export default function QuestionCard({ question, selectedOption, onSelect }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-lg font-semibold">{question.question}</p>

      <div className="mt-5 space-y-3">
        {question.options?.map((option, index) => (
          <label
            key={index}
            className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-slate-50"
          >
            <input
              type="radio"
              name={`question-${question._id || question.id}`}
              checked={selectedOption === index}
              onChange={() => onSelect(index)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
