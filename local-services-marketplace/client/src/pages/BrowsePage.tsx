import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { ProviderProfile, Category } from '../types';
import ProviderCard from '../components/ProviderCard';

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const zipCode = searchParams.get('zip') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: any = { page, limit: 12 };
    if (category) params.category = category;
    if (zipCode) params.zipCode = zipCode;

    api.get('/providers', { params })
      .then(res => { setProviders(res.data.providers); setTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, zipCode, page]);

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('category', slug); else next.delete('category');
    next.set('page', '1');
    setSearchParams(next);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Find a Service Provider</h1>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!category ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat.slug ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading providers...</div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p>No providers found. Try a different category or area.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{total} provider{total !== 1 ? 's' : ''} found</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => { const n = new URLSearchParams(searchParams); n.set('page', String(p)); setSearchParams(n); }}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
