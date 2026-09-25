import { useEffect, useState } from 'react';

export default function ExamTimer({ durationMinutes, onExpire }) {
  const [seconds, setSeconds] = useState(durationMinutes * 60);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onExpire]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="rounded-lg bg-slate-900 px-4 py-2 font-mono text-white">
      {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
    </div>
  );
}
