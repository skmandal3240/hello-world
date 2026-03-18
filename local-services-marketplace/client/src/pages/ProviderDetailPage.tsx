import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ProviderProfile } from '../types';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState('');
  const [jobForm, setJobForm] = useState({ title: '', description: '', location: '', zipCode: '', budget: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/providers/${id}`)
      .then(res => setProvider(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleRequestService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!selectedService) return;

    setSubmitting(true);
    try {
      await api.post('/jobs', {
        serviceId: selectedService,
        ...jobForm,
        budget: jobForm.budget ? parseFloat(jobForm.budget) : undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetEstimate = async () => {
    if (!selectedService || !provider) return;
    const service = provider.services?.find(s => s.id === selectedService);
    if (!service) return;
    try {
      const { data } = await api.post('/ai/price-estimate', {
        categorySlug: service.category.slug,
        jobDescription: jobForm.description || service.title,
      });
      setPriceEstimate(data);
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;
  if (!provider) return <div className="text-center py-20 text-gray-400">Provider not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Provider Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 flex-shrink-0">
              {provider.user.avatarUrl
                ? <img src={provider.user.avatarUrl} alt={provider.user.name} className="w-20 h-20 rounded-full object-cover" />
                : provider.user.name[0].toUpperCase()
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{provider.user.name}</h1>
                {provider.isVerified && <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">✓ Verified</span>}
                {provider.isAvailable
                  ? <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">● Available</span>
                  : <span className="bg-red-100 text-red-500 text-xs font-semibold px-2 py-1 rounded-full">● Unavailable</span>
                }
              </div>
              <p className="text-gray-500 mt-1">📍 {provider.location} · {provider.yearsExp} years experience</p>
              <div className="mt-2">
                <StarRating rating={provider.rating} count={provider.totalReviews} />
              </div>
              <p className="text-blue-600 font-bold text-lg mt-2">${provider.hourlyRate}/hr</p>
            </div>
          </div>
          <p className="text-gray-600 mt-4 leading-relaxed">{provider.bio}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Services */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="font-bold text-lg mb-4">Services Offered</h2>
            <div className="space-y-3">
              {provider.services?.map(s => (
                <div key={s.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{s.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.category.icon} {s.category.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">${s.price}</p>
                      <p className="text-xs text-gray-400">{s.priceType}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{s.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Request form */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="font-bold text-lg mb-4">Request a Service</h2>
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
                <p className="font-semibold text-green-700">Request sent!</p>
                <p className="text-sm text-gray-500 mt-1">The provider will review and respond soon.</p>
                <button onClick={() => navigate('/dashboard/customer')} className="mt-4 text-blue-600 text-sm underline">
                  View my bookings →
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestService} className="space-y-3">
                <select
                  value={selectedService}
                  onChange={e => setSelectedService(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select a service...</option>
                  {provider.services?.map(s => (
                    <option key={s.id} value={s.id}>{s.title} — ${s.price} {s.priceType}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Job title (e.g. 'Clean 2BR apartment')"
                  value={jobForm.title}
                  onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  required
                />

                <textarea
                  placeholder="Describe your job in detail..."
                  value={jobForm.description}
                  onChange={e => setJobForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-24 resize-none"
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Location"
                    value={jobForm.location}
                    onChange={e => setJobForm(f => ({ ...f, location: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Zip code"
                    value={jobForm.zipCode}
                    onChange={e => setJobForm(f => ({ ...f, zipCode: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>

                <input
                  type="number"
                  placeholder="Your budget (optional)"
                  value={jobForm.budget}
                  onChange={e => setJobForm(f => ({ ...f, budget: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />

                {priceEstimate && (
                  <div className="bg-purple-50 rounded-lg p-3 text-sm">
                    <p className="font-semibold text-purple-700">✨ AI Price Estimate</p>
                    <p className="text-purple-600">
                      ${priceEstimate.low} – ${priceEstimate.high} ({priceEstimate.unit})
                    </p>
                    <ul className="text-purple-500 text-xs mt-1 list-disc list-inside">
                      {priceEstimate.factors?.map((f: string, i: number) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGetEstimate}
                    className="flex-1 border border-purple-300 text-purple-600 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
                  >
                    ✨ Get Estimate
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Reviews */}
        {provider.reviews && provider.reviews.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mt-6">
            <h2 className="font-bold text-lg mb-4">Reviews</h2>
            <div className="space-y-4">
              {provider.reviews.map(review => (
                <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                      {review.author.name[0]}
                    </div>
                    <span className="font-medium text-sm text-gray-700">{review.author.name}</span>
                    <StarRating rating={review.rating} size="sm" showNumber={false} />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
