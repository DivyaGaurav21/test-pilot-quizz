export default function QuestionNavigation({ total, current, answers, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onChange(index)}
          className={`rounded-lg border px-3 py-2 text-sm ${
            current === index
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : answers[index] !== undefined
                ? 'bg-green-50'
                : 'bg-white'
          }`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}
