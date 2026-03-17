import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="max-w-6xl mx-auto px-4 h-16 w-full flex items-center justify-between">
        <span className="text-xl font-bold text-brand-600">LangExchange</span>
        <div className="flex gap-3">
          <Link to="/login"><Button variant="secondary">Sign in</Button></Link>
          <Link to="/signup"><Button>Get started</Button></Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="text-7xl mb-6">🌍</div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 max-w-2xl leading-tight">
          Learn languages through <span className="text-brand-600">real conversations</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mb-10">
          Get matched with native speakers. Practice speaking. Get instant AI feedback on your
          grammar and vocabulary. Build fluency faster.
        </p>
        <Link to="/signup">
          <Button size="lg">Start for free</Button>
        </Link>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full text-left">
          {[
            { icon: '🤝', title: 'Language exchange', desc: 'Get matched with native speakers who want to learn your language — mutual benefit, zero cost.' },
            { icon: '🎙️', title: 'Voice practice', desc: 'Speak naturally in your target language. Your browser transcribes everything in real time.' },
            { icon: '🤖', title: 'AI feedback', desc: 'After each utterance, get instant corrections on grammar, vocabulary, and pronunciation.' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
