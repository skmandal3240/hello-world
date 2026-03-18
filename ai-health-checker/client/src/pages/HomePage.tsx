import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
          🩺 AI-Powered Symptom Assessment
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Understand Your Symptoms<br />
          <span className="text-sky-600">Before You See a Doctor</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Have a compassionate conversation about your symptoms, get triage guidance, and
          receive a personalized preparation summary for your doctor appointment.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-sky-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-sky-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="bg-sky-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-sky-700 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-sky-400 hover:text-sky-600 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-6">
          ⚠️ Not a substitute for professional medical advice. Always consult a qualified healthcare provider.
        </p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '💬',
              title: 'Describe Your Symptoms',
              desc: 'Have a natural conversation. Our AI asks clarifying questions about duration, severity, and associated symptoms.',
            },
            {
              icon: '🎯',
              title: 'Get Triage Guidance',
              desc: 'Receive a color-coded triage recommendation: Emergency, Urgent, See a Doctor, Monitor, or Self-Care.',
            },
            {
              icon: '📋',
              title: 'Prepare for Your Appointment',
              desc: 'Generate a structured summary with chief complaint, symptom timeline, and questions to ask your doctor.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Triage levels */}
      <section className="bg-sky-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Triage Levels Explained</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Emergency', color: 'bg-red-100 border-red-200 text-red-700', icon: '🚨', desc: 'Call 911 now' },
              { label: 'Urgent', color: 'bg-orange-100 border-orange-200 text-orange-700', icon: '⚠️', desc: 'Within hours' },
              { label: 'See a Doctor', color: 'bg-yellow-100 border-yellow-200 text-yellow-700', icon: '👨‍⚕️', desc: 'Schedule soon' },
              { label: 'Monitor', color: 'bg-sky-100 border-sky-200 text-sky-700', icon: '👁️', desc: 'Watch at home' },
              { label: 'Self-Care', color: 'bg-green-100 border-green-200 text-green-700', icon: '🏠', desc: 'Manage at home' },
            ].map((t) => (
              <div key={t.label} className={`border rounded-xl p-4 text-center ${t.color}`}>
                <div className="text-2xl mb-2">{t.icon}</div>
                <div className="font-semibold text-sm">{t.label}</div>
                <div className="text-xs mt-1 opacity-80">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <p className="text-amber-800 text-sm font-medium">
            ⚠️ <strong>Medical Disclaimer:</strong> HealthCheck AI provides general health information and symptom
            guidance only. It is not a medical device, does not provide diagnosis, and is not a substitute for
            professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other
            qualified health provider with any questions you may have regarding a medical condition.
          </p>
        </div>
      </section>
    </div>
  );
}
