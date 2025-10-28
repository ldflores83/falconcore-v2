let cached: any | null = null;

export async function loadPublicConfig(): Promise<{
  apiKey: string; authDomain: string; projectId: string; appId: string;
}> {
  if (cached) return cached;
  try {
    // Try the correct path first
    const res = await fetch('/ahau/ahau/config.json', { cache: 'no-store' });
    if (!res.ok) {
      // Fallback to the original path
      const res2 = await fetch('/ahau/config.json', { cache: 'no-store' });
      if (!res2.ok) throw new Error('config not found');
      cached = await res2.json();
    } else {
      cached = await res.json();
    }
  } catch {
    // Fallback opcional para dev (ajusta si quieres o deja vacío)
    cached = {
      apiKey: 'DEV_PLACEHOLDER',
      authDomain: 'dev-placeholder.firebaseapp.com',
      projectId: 'dev-placeholder',
      appId: '1:dev:web:placeholder'
    };
    // console.warn('Using fallback public config');
  }
  return cached;
}
