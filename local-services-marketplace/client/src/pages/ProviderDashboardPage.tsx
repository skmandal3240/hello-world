import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { JobRequest, ProviderProfile, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

export default function ProviderDashboardPage() {
  const [incoming, setIncoming] = useState<JobRequest[]>([]);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState<'jobs' | 'profile' | 'services'>('jobs');
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ bio: '', location: '', zipCode: '', hourlyRate: '', yearsExp: '' });
  const [serviceForm, setServiceForm] = useState({ categoryId: '', title: '', description: '', price: '', priceType: 'hourly' });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      api.get('/jobs/incoming').then(r => setIncoming(r.data)).catch(() => {}),
      api.get('/providers/profile/me').then(r => { setProfile(r.data); }).catch(() => {}),
      api.get('/categories').then(r => setCategories(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [user, navigate]);

  const handleAccept = async (jobId: string, price: number) => {
    try {
      await api.post(`/jobs/${jobId}/accept`, { agreedPrice: price });
      setIncoming(j => j.filter(x => x.id !== jobId));
      alert('Job accepted!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleDecline = async (jobId: string) => {
    try {
      await api.post(`/jobs/${jobId}/decline`);
      setIncoming(j => j.filter(x => x.id !== jobId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/providers/profile', {
        ...profileForm,
        hourlyRate: parseFloat(profileForm.hourlyRate),
        yearsExp: parseInt(profileForm.yearsExp),
      });
      setProfile(data);
      alert('Profile created!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/services', { ...serviceForm, price: parseFloat(serviceForm.price) });
      const { data } = await api.get('/providers/profile/me');
      setProfile(data);
      setServiceForm({ categoryId: '', title: '', description: '', price: '', priceType: 'hourly' });
      alert('Service added!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Provider Dashboard</h1>
        {profile && (
          <div className="flex items-center gap-3 mb-6">
            <StarRating rating={profile.rating} count={profile.totalReviews} size="sm" />
            <span className="text-sm text-gray-500">${profile.hourlyRate}/hr · {profile.location}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {(['jobs', 'profile', 'services'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'jobs' ? `Jobs (${incoming.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Incoming Jobs */}
        {tab === 'jobs' && (
          <div className="space-y-4">
            {incoming.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">📭</div>
                <p>No incoming job requests.</p>
              </div>
            ) : incoming.map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">📍 {job.location} · {job.zipCode}</p>
                    {job.budget && <p className="text-sm text-green-600 font-medium mt-0.5">Budget: ${job.budget}</p>}
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-1 rounded-full">New</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{job.description}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleAccept(job.id, job.budget || (profile?.hourlyRate ?? 50))}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() => handleDecline(job.id)}
                    className="border border-red-200 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    ✕ Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {!profile ? (
              <>
                <h2 className="font-bold text-lg mb-4">Create Your Provider Profile</h2>
                <form onSubmit={handleCreateProfile} className="space-y-4">
                  <textarea
                    placeholder="Bio — describe your skills and experience"
                    value={profileForm.bio}
                    onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-24 resize-none"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Location (city, state)" value={profileForm.location}
                      onChange={e => setProfileForm(f => ({ ...f, location: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
                    <input type="text" placeholder="Zip code" value={profileForm.zipCode}
                      onChange={e => setProfileForm(f => ({ ...f, zipCode: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
                    <input type="number" placeholder="Hourly rate ($)" value={profileForm.hourlyRate}
                      onChange={e => setProfileForm(f => ({ ...f, hourlyRate: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
                    <input type="number" placeholder="Years of experience" value={profileForm.yearsExp}
                      onChange={e => setProfileForm(f => ({ ...f, yearsExp: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Create Profile
                  </button>
                </form>
              </>
            ) : (
              <div>
                <h2 className="font-bold text-lg mb-2">Your Profile</h2>
                <p className="text-gray-600 text-sm">{profile.bio}</p>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div><span className="text-gray-400">Location:</span> <span className="font-medium">{profile.location}</span></div>
                  <div><span className="text-gray-400">Rate:</span> <span className="font-medium">${profile.hourlyRate}/hr</span></div>
                  <div><span className="text-gray-400">Experience:</span> <span className="font-medium">{profile.yearsExp} years</span></div>
                  <div><span className="text-gray-400">Bookings:</span> <span className="font-medium">{profile._count?.bookings ?? 0}</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Services */}
        {tab === 'services' && profile && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-lg mb-4">Add a Service</h2>
              <form onSubmit={handleAddService} className="space-y-3">
                <select value={serviceForm.categoryId} onChange={e => setServiceForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
                <input type="text" placeholder="Service title" value={serviceForm.title}
                  onChange={e => setServiceForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
                <textarea placeholder="Service description" value={serviceForm.description}
                  onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-20 resize-none" required />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Price" value={serviceForm.price}
                    onChange={e => setServiceForm(f => ({ ...f, price: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
                  <select value={serviceForm.priceType} onChange={e => setServiceForm(f => ({ ...f, priceType: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="hourly">Hourly</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Add Service
                </button>
              </form>
            </div>

            {profile.services && profile.services.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-lg mb-4">Your Services</h2>
                <div className="space-y-3">
                  {profile.services.map(s => (
                    <div key={s.id} className="flex justify-between items-center border border-gray-100 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{s.title}</p>
                        <p className="text-xs text-gray-400">{s.category?.icon} {s.category?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">${s.price}</p>
                        <p className="text-xs text-gray-400">{s.priceType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
