import env from '../config/env';

export type ApiError = { message: string; status?: number };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${env.API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 20000);
  let res: Response;
  try {
    res = await fetch(url, { ...options, headers, signal: controller.signal });
  } catch (e) {
    clearTimeout(id);
    throw { message: (e as Error)?.message || 'Network error', status: undefined } as ApiError;
  }
  clearTimeout(id);
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = isJson ? (body?.message || 'Request failed') : (body as string) || 'Request failed';
    throw { message, status: res.status } as ApiError;
  }
  return body as T;
}

async function requestAbsolute<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 20000);
  let res: Response;
  try {
    res = await fetch(url, { ...options, headers, signal: controller.signal });
  } catch (e) {
    clearTimeout(id);
    throw { message: (e as Error)?.message || 'Network error', status: undefined } as ApiError;
  }
  clearTimeout(id);
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = isJson ? (body?.message || 'Request failed') : (body as string) || 'Request failed';
    throw { message, status: res.status } as ApiError;
  }
  return body as T;
}

export type LoginPayload = { email: string; password: string };
export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  aadhar?: string;
  dob?: string; // YYYY-MM-DD
  gender?: string; // 'Male' | 'Female' | 'Other' | etc
  age?: number;
};
export type AuthResponse = { token: string; user: { id: string; name: string; email: string } };
export type RideItem = { id: string; title: string; date: string; status: 'Completed' | 'Upcoming'; place?: string; price?: string };
export type BookingItem = { id: string; title: string; date: string; status: 'Confirmed' | 'Pending'; place?: string; price?: string };
export type StatsResponse = { totalDistanceKm: number; tripsCount: number; coins?: number };
export type AccountResponse = {
  id: string;
  name: string;
  email: string;
  memberSince?: string;
  tier?: string;
  coins?: number;
  tripsCount?: number;
  totalDistanceKm?: number;
};

export type CreateTripPayload = {
  title: string;
  date: string; // ISO date
  from: string;
  to: string;
  notes?: string;
  itineraryId?: string;
};
export type CreateTripResponse = { id: string };

export const api = {
  login: (payload: LoginPayload) =>
    requestAbsolute<AuthResponse>('https://sih-km2r.onrender.com/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  // Use absolute endpoint per user request
  signup: (payload: SignupPayload) => requestAbsolute<AuthResponse>('https://sih-km2r.onrender.com/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  getRides: (token?: string) =>
    request<RideItem[]>('/rides', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getBookings: (token?: string) =>
    request<BookingItem[]>('/bookings', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  // Absolute endpoint provided by user for fetching user's trips
  getMyTrips: (token?: string) =>
    requestAbsolute<RideItem[]>('https://sih-km2r.onrender.com/my-trips', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getStats: (token?: string) =>
    request<StatsResponse>('/stats', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getAccount: (token?: string) =>
    request<AccountResponse>('/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  createTrip: (payload: CreateTripPayload, token?: string) =>
    requestAbsolute<CreateTripResponse>('https://sih-km2r.onrender.com/add_trip', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
};

export default api;
