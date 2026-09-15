export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const customUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (customUrl && customUrl.startsWith('http')) {
      // Jika diset ke localhost tetapi dibuka di domain publik, alihkan ke /api/v1
      if (customUrl.includes('localhost') && window.location.hostname !== 'localhost') {
        return '/api/v1';
      }
      return customUrl;
    }
    // Default paling aman di browser adalah relative path /api/v1
    return '/api/v1';
  }
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('karsa_token');
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('karsa_token', token);
    if (token !== 'demo-token') {
      localStorage.removeItem('karsa_demo_mode');
    }
    window.dispatchEvent(new Event('karsa_auth_change'));
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('karsa_token');
    localStorage.removeItem('karsa_user');
    localStorage.removeItem('karsa_active_org');
    localStorage.removeItem('karsa_user_orgs');
    localStorage.removeItem('karsa_demo_mode');
    window.dispatchEvent(new Event('karsa_auth_change'));
  }
}

export function getActiveOrganization(): any | null {
  if (typeof window === 'undefined') return null;
  const orgStr = localStorage.getItem('karsa_active_org');
  if (!orgStr) return null;
  try {
    return JSON.parse(orgStr);
  } catch {
    return null;
  }
}

export function setActiveOrganization(org: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('karsa_active_org', JSON.stringify(org));
  }
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit & { idempotencyKey?: string } = {},
): Promise<T> {
  const token = getAuthToken();
  const activeOrg = getActiveOrganization();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (activeOrg?.id) {
    headers['X-Organization-Id'] = activeOrg.id;
  }

  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  const base = getApiBase();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${cleanPath}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData = { message: 'Terjadi kesalahan pada server' };
    try {
      errorData = await response.json();
    } catch {
      // no-op
    }
    throw new Error(errorData.message || `HTTP Error ${response.status}`);
  }

  return response.json();
}
