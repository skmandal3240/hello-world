export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  _count?: { services: number };
}

export interface ProviderProfile {
  id: string;
  userId: string;
  bio: string;
  location: string;
  zipCode: string;
  hourlyRate: number;
  yearsExp: number;
  isVerified: boolean;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  user: { id: string; name: string; avatarUrl?: string };
  services?: Service[];
  reviews?: Review[];
  _count?: { reviews: number; bookings: number };
}

export interface Service {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  priceType: 'hourly' | 'fixed';
  category: Category;
  provider?: ProviderProfile;
}

export interface JobRequest {
  id: string;
  customerId: string;
  serviceId: string;
  title: string;
  description: string;
  location: string;
  zipCode: string;
  budget?: number;
  scheduledAt?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  service?: Service;
  booking?: Booking;
  createdAt: string;
}

export interface Booking {
  id: string;
  jobRequestId: string;
  providerId: string;
  agreedPrice: number;
  status: string;
  completedAt?: string;
  provider?: ProviderProfile;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: { name: string; avatarUrl?: string };
}
