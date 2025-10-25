import { useEffect, useState } from 'react';
import { useAuthCtx } from '../context/AuthContext';
import { useRouter } from 'next/router';
import SigninEmailForm from '../components/SigninEmailForm';
import SignupEmailForm from '../components/SignupEmailForm';
import CreateTenantForm from '../components/CreateTenantForm';
import { getAuthClient, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function LoginPage() {
  const { session, refreshSession } = useAuthCtx();
  const router = useRouter();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (session?.tenantId) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleGoogleSignIn = async () => {
    try {
      const auth = await getAuthClient();
      await signInWithPopup(auth, googleProvider);
      await refreshSession();
      router.push('/dashboard');
    } catch (error) {
      console.error('Google sign in error:', error);
      alert('No se pudo iniciar sesión con Google. Intenta nuevamente.');
    }
  };

  const handleTenantCreated = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ahau-blue via-ahau-dark to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Ahau</h1>
          <p className="text-gray-300">Tu asistente de contenido inteligente</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex mb-4 rounded-lg overflow-hidden border border-white/10">
            <button onClick={() => setTab('signin')} className={`flex-1 py-2 text-sm font-medium ${tab==='signin' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}>Iniciar sesión</button>
            <button onClick={() => setTab('signup')} className={`flex-1 py-2 text-sm font-medium ${tab==='signup' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}>Crear cuenta</button>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-gray-900 font-semibold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continuar con Google</span>
            </button>

            {tab === 'signin' ? <SigninEmailForm/> : <SignupEmailForm/>}
          </div>
        </div>

        <div className="text-center">
          <p className="text-white/60 text-sm">
            ¿No tienes un workspace?{' '}
            <button
              onClick={() => document.getElementById('create-tenant')?.scrollIntoView()}
              className="text-ahau-gold hover:text-ahau-gold/80 font-medium"
            >
              Crea uno aquí
            </button>
          </p>
        </div>

        <div id="create-tenant" className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Crear Nuevo Workspace</h2>
          <CreateTenantForm onCreated={handleTenantCreated} />
        </div>
      </div>
    </div>
  );
}
