import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MoodLog } from '../types';

interface Props {
  logs: MoodLog[];
}

export default function MoodChart({ logs }: Props) {
  const data = logs.map(l => ({
    date: new Date(l.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: l.score,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        No mood data yet. Start logging your mood!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#e4a3bb" />
        <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} stroke="#e4a3bb" />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #fbcfe8', fontSize: 12 }}
          formatter={(val) => [`${val}/10`, 'Mood']}
        />
        <ReferenceLine y={5} stroke="#f9a8d4" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#e11d48"
          strokeWidth={2}
          dot={{ fill: '#e11d48', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
