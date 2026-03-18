import { Link } from 'react-router-dom';
import { ProviderProfile } from '../types';
import StarRating from './StarRating';

interface Props {
  provider: ProviderProfile;
}

export default function ProviderCard({ provider }: Props) {
  return (
    <Link to={`/providers/${provider.id}`} className="block bg-white rounded-xl shadow hover:shadow-md transition-shadow p-5 border border-gray-100">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 flex-shrink-0">
          {provider.user.avatarUrl
            ? <img src={provider.user.avatarUrl} alt={provider.user.name} className="w-14 h-14 rounded-full object-cover" />
            : provider.user.name[0].toUpperCase()
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{provider.user.name}</h3>
            {provider.isVerified && (
              <span className="text-blue-500 text-sm" title="Verified">✓</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{provider.location}</p>
          <div className="mt-1">
            <StarRating rating={provider.rating} size="sm" count={provider.totalReviews} />
          </div>
          {provider.services && provider.services.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {provider.services.slice(0, 3).map(s => (
                <span key={s.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  {s.category.icon} {s.category.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-blue-600">${provider.hourlyRate}/hr</p>
          <p className="text-xs text-gray-400">{provider.yearsExp}y exp</p>
          {provider.isAvailable
            ? <span className="text-xs text-green-600 font-medium">● Available</span>
            : <span className="text-xs text-red-400">● Unavailable</span>
          }
        </div>
      </div>
    </Link>
  );
}
