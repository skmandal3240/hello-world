import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="max-w-6xl mx-auto px-4 h-16 w-full flex items-center justify-between">
        <span className="text-xl font-bold text-brand-600">FinanceAI</span>
        <div className="flex gap-3">
          <Link to="/login"><Button variant="secondary">Sign in</Button></Link>
          <Link to="/signup"><Button>Get started free</Button></Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="text-7xl mb-6">💰</div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 max-w-2xl leading-tight">
          Your finances, understood by <span className="text-brand-600">AI</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mb-10">
          Track spending automatically, get personalized AI savings advice, and forecast your financial future — all in one place.
        </p>
        <div className="flex gap-4">
          <Link to="/signup"><Button size="lg">Start for free</Button></Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl w-full text-left">
          {[
            { icon: '🏦', title: 'Connect your bank', desc: 'Link your bank via Plaid or import a CSV. Transactions sync automatically.' },
            { icon: '🤖', title: 'AI categorization', desc: 'Claude automatically categorizes every transaction — no manual work needed.' },
            { icon: '📊', title: 'Budget tracking', desc: 'Set monthly budgets per category. See real-time progress with clear visual rings.' },
            { icon: '💡', title: 'Smart insights', desc: 'Weekly AI analysis of your spending with actionable savings recommendations.' },
          ].map((f) => (
            <div key={f.title} className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
