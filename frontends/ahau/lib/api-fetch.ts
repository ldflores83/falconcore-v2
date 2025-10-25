import { getAuthClient } from './firebase';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const auth = await getAuthClient();
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  
  const baseUrl = 'https://api-fu54nvsqfa-uc.a.run.app';
  const url = `${baseUrl}/api/ahau${path}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  } as Record<string, string>;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    const text = await response.text();
    console.error('API returned non-JSON response:', text);
    throw new Error('Invalid JSON response from server');
  }
}

export async function apiGet<T = any>(path: string): Promise<T> {
  return apiFetch(path, { method: 'GET' });
}

export async function apiPost<T = any>(path: string, body?: any): Promise<T> {
  return apiFetch(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}
