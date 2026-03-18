import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { JobRequest } from '../types';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  DECLINED: 'bg-red-100 text-red-500',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function CustomerDashboardPage() {
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState<{ bookingId: string; rating: number; comment: string } | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/jobs/my')
      .then(res => setJobs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm) return;
    try {
      await api.post('/reviews', reviewForm);
      setReviewForm(null);
      const { data } = await api.get('/jobs/my');
      setJobs(data);
      alert('Review submitted!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit review');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <Link to="/browse" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            + Find a Pro
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📋</div>
            <p>No job requests yet.</p>
            <Link to="/browse" className="text-blue-600 text-sm mt-2 block hover:underline">Browse service providers →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {job.service?.category?.icon} {job.service?.category?.name} · {job.location}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[job.status]}`}>
                    {job.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-2">{job.description}</p>

                {job.booking && (
                  <div className="mt-3 bg-blue-50 rounded-lg p-3 text-sm">
                    <p className="text-blue-700 font-medium">
                      Provider: {job.booking.provider?.user?.name ?? 'Assigned'}
                    </p>
                    <p className="text-blue-600">Agreed price: ${job.booking.agreedPrice}</p>
                  </div>
                )}

                {job.status === 'COMPLETED' && job.booking && !reviewForm && (
                  <button
                    onClick={() => setReviewForm({ bookingId: job.booking!.id, rating: 5, comment: '' })}
                    className="mt-3 text-sm text-yellow-600 font-medium hover:underline"
                  >
                    ⭐ Leave a Review
                  </button>
                )}

                {reviewForm?.bookingId === job.booking?.id && (
                  <form onSubmit={handleReview} className="mt-3 border border-gray-100 rounded-lg p-4 space-y-2">
                    <div className="flex gap-2 items-center">
                      <label className="text-sm font-medium text-gray-700">Rating:</label>
                      {[1, 2, 3, 4, 5].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setReviewForm(f => f ? { ...f, rating: r } : null)}
                          className={`text-xl ${r <= (reviewForm?.rating ?? 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Share your experience..."
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => f ? { ...f, comment: e.target.value } : null)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-20 resize-none"
                      required
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="bg-yellow-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-yellow-600">
                        Submit
                      </button>
                      <button type="button" onClick={() => setReviewForm(null)} className="text-gray-400 text-sm">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
