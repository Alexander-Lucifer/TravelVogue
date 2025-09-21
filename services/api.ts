import env from '../config/env';

export type ApiError = { message: string; status?: number };

function sanitizeBodyForLog(body?: any) {
  if (!body) return body;
  try {
    const obj = typeof body === 'string' ? JSON.parse(body) : { ...body };
    if (obj.password) obj.password = '***';
    if (obj.confirm) obj.confirm = '***';
    if (obj.aadhar) obj.aadhar = obj.aadhar.replace(/\d(?=\d{4})/g, '*');
    return obj;
  } catch {
    return body;
  }
}

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
    if (env.DEBUG_NETWORK) {
      // eslint-disable-next-line no-console
      console.log('[HTTP] ', options.method || 'GET', url, sanitizeBodyForLog(options.body as any));
    }
    // Retry up to 2 times on network error or 5xx
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        res = await fetch(url, { ...options, headers, signal: controller.signal });
        if (res.status >= 500 && res.status < 600 && attempt < 2) {
          attempt++;
          await new Promise<void>((resolve) => setTimeout(() => resolve(), 500 * attempt));
          continue;
        }
        break;
      } catch (e) {
        if (attempt < 2) {
          attempt++;
          await new Promise<void>((resolve) => setTimeout(() => resolve(), 500 * attempt));
          continue;
        }
        throw e;
      }
    }
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
    if (env.DEBUG_NETWORK) {
      // eslint-disable-next-line no-console
      console.log('[HTTP ERR]', res.status, url, message);
    }
    throw { message, status: res.status } as ApiError;
  }
  if (env.DEBUG_NETWORK) {
    // eslint-disable-next-line no-console
    console.log('[HTTP OK] ', res.status, url, typeof body === 'string' ? body.slice(0, 200) : body);
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
    if (env.DEBUG_NETWORK) {
      // eslint-disable-next-line no-console
      console.log('[HTTP] ', options.method || 'GET', url, sanitizeBodyForLog(options.body as any));
    }
    // Retry up to 2 times on network error or 5xx
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        res = await fetch(url, { ...options, headers, signal: controller.signal });
        if (res.status >= 500 && res.status < 600 && attempt < 2) {
          attempt++;
          await new Promise<void>((resolve) => setTimeout(resolve, 500 * attempt));
          continue;
        }
        break;
      } catch (e) {
        if (attempt < 2) {
          attempt++;
          await new Promise<void>((resolve) => setTimeout(resolve, 500 * attempt));
          continue;
        }
        throw e;
      }
    }
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
    if (env.DEBUG_NETWORK) {
      // eslint-disable-next-line no-console
      console.log('[HTTP ERR]', res.status, url, message);
    }
    throw { message, status: res.status } as ApiError;
  }
  if (env.DEBUG_NETWORK) {
    // eslint-disable-next-line no-console
    console.log('[HTTP OK] ', res.status, url, typeof body === 'string' ? body.slice(0, 200) : body);
  }
  return body as T;
}

export type LoginPayload = { email: string; password: string };
export type SignupPayload = {
  email: string;
  password: string;
};
export type ProfilePayload = {
  name: string;
  phone_number: string;
  aadhaar_number: string;
  date_of_birth: string; // YYYY-MM-DD
  gender: string;
  age: number;
};
export type AuthResponse = { token: string; user: { id: string; name: string; email: string } };
export type RideItem = { id: string; title: string; date: string; status: 'Completed' | 'Upcoming'; place?: string; price?: string };
export type BookingItem = { id: string; title: string; date: string; status: 'Confirmed' | 'Pending'; place?: string; price?: string };
export type StatsResponse = { totalDistanceKm: number; tripsCount: number; coins?: number; vehicleType?: string; passengerCount?: number };
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
  // Absolute profile endpoints provided by user
  updateProfile: (profile: ProfilePayload, token: string) =>
    requestAbsolute<any>('https://sih-km2r.onrender.com/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
      headers: { Authorization: `Bearer ${token}` },
    }),
  getProfile: (token: string) =>
    requestAbsolute<any>('https://sih-km2r.onrender.com/profile', {
      headers: { Authorization: `Bearer ${token}` },
    }),
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
