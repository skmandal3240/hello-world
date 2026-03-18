import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Category } from '../types';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/browse?q=${encodeURIComponent(search)}&zip=${zipCode}`);
  };

  const handleAiRecommend = async () => {
    if (!search.trim()) return;
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/recommend', { description: search, zipCode });
      navigate(`/browse?category=${data.category}`);
    } catch {
      navigate(`/browse?q=${encodeURIComponent(search)}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Local Pros You Can Trust</h1>
          <p className="text-blue-100 text-lg mb-8">
            Connect with verified local service providers — cleaners, plumbers, tutors, and more.
          </p>
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-xl">
            <input
              type="text"
              placeholder="What service do you need?"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-800 rounded-xl outline-none text-base"
            />
            <input
              type="text"
              placeholder="Zip code"
              value={zipCode}
              onChange={e => setZipCode(e.target.value)}
              className="w-32 px-4 py-3 text-gray-800 rounded-xl outline-none text-base border-l border-gray-200"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleAiRecommend}
                disabled={aiLoading || !search.trim()}
                className="bg-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {aiLoading ? '...' : '✨ AI Match'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate(`/browse?category=${cat.slug}`)}
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md hover:border-blue-200 border border-gray-100 transition-all group"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{cat.name}</div>
              <div className="text-xs text-gray-400 mt-1">{cat._count?.services ?? 0} providers</div>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🔍', title: 'Search', desc: 'Browse local pros by category or let our AI match you to the right service.' },
              { icon: '📋', title: 'Request', desc: 'Describe your job, set a budget, and send a request directly to a provider.' },
              { icon: '⭐', title: 'Review', desc: 'Work gets done, you review the pro, and build community trust.' },
            ].map(step => (
              <div key={step.title} className="flex flex-col items-center">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
