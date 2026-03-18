import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function HomePage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="font-bold text-xl text-rose-600">🌸 MindJournal</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-gray-600 hover:text-rose-600 transition-colors">Login</Link>
          <Link to="/signup" className="bg-rose-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors">Get Started</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 text-sm px-4 py-2 rounded-full mb-8">
          <span>🧠</span> AI-powered mental wellness
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Journal your way to<br />
          <span className="text-rose-600">better mental health</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          AI-guided journaling with mood tracking, streak rewards, and built-in Cognitive Behavioral Therapy exercises — all in one calm, private space.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/signup" className="bg-rose-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200">
            Start journaling free
          </Link>
          <Link to="/login" className="text-gray-600 px-8 py-4 rounded-xl text-lg font-semibold border border-gray-200 hover:border-rose-300 transition-colors">
            Sign in
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          {[
            { icon: '✍️', title: 'AI-Guided Journaling', desc: 'Get a personalized daily prompt and receive compassionate AI reflections on your entries.' },
            { icon: '📊', title: 'Mood Tracking', desc: 'Log your mood daily and visualize trends over 7 or 30 days with beautiful charts.' },
            { icon: '🧠', title: 'CBT Exercises', desc: 'Access 8 evidence-based Cognitive Behavioral Therapy exercises anytime you need them.' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-400">
          <span>🔥 Streak rewards</span>
          <span>•</span>
          <span>🔒 Private & secure</span>
          <span>•</span>
          <span>✨ Weekly AI summaries</span>
        </div>
      </main>
    </div>
  );
}
