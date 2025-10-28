import { getAuthClient } from './firebase';

export async function apiPost<T = any>(path: string, body?: any): Promise<T> {
  try {
    const auth = await getAuthClient();
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;
    
    // Use the deployed Firebase Functions URL
    const baseUrl = 'https://api-fu54nvsqfa-uc.a.run.app';
    const res = await fetch(`${baseUrl}/api/ahau${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`API Error: ${res.status} ${res.statusText}`, text);
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    } else {
      const text = await res.text();
      console.error('API returned non-JSON response:', text);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
