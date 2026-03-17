import React from 'react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <header className="px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600">Habit Coach</h1>
          <p className="text-sm text-gray-500">Build better habits together</p>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-indigo-600 hover:underline">Sign In</Link>
          <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Get Started</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
        <div className="max-w-2xl">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Build habits that actually <span className="text-indigo-600">stick</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Track your daily habits, get AI-powered nudges, and stay accountable with an anonymous partner — all in one place.
          </p>

          <div className="flex gap-4 justify-center mb-12">
            <Link to="/signup" className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
              Start for free →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 text-left">
            {[
              { icon: '🔥', title: 'Streak Tracking', desc: 'Build momentum with visual streak calendars and progress towards your goals.' },
              { icon: '🤖', title: 'AI Coach', desc: 'Get personalized nudges and weekly summaries powered by Claude AI.' },
              { icon: '🤝', title: 'Anonymous Partner', desc: 'Get matched with a partner who shares your goals — all privacy preserved.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
