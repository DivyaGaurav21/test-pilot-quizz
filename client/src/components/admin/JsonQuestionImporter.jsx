import { useState } from 'react';

export default function JsonQuestionImporter({ onImport }) {
  const [value, setValue] = useState('');

  const handleImport = () => {
    try {
      const parsed = JSON.parse(value);
      onImport?.(parsed);
    } catch {
      alert('Invalid JSON');
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Paste exam JSON here...'
        className="min-h-80 w-full rounded-xl border p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        onClick={handleImport}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
      >
        Validate & Import
      </button>
    </div>
  );
}
