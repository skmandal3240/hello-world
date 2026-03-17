import { useState, useEffect } from 'react';

export default function SessionTimer({ startedAt }: { startedAt: Date }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');

  return (
    <span className="font-mono text-sm text-gray-500 tabular-nums">
      {minutes}:{seconds}
    </span>
  );
}
