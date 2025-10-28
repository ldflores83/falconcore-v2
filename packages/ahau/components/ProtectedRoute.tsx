import React from 'react';
import { useAuthCtx } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthCtx();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ahau-blue via-ahau-dark to-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ahau-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ahau-blue via-ahau-dark to-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ahau-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
