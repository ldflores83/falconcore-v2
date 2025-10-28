import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuthClient } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignupEmailForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const auth = await getAuthClient();
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Token is now present; any server-side provisioning can happen on first session verify
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err?.message || 'Error en el registro. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50" placeholder="tu@email.com" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white mb-2">Contraseña</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50" placeholder="••••••••" />
      </div>
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm">{error}</div>
      )}
      <button type="submit" disabled={isLoading} className="w-full bg-ahau-gold text-ahau-dark font-semibold py-3 px-4 rounded-xl hover:bg-ahau-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  );
}
