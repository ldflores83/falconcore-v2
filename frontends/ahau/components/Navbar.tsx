import React from 'react';
import { useAuthCtx } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Navbar({ tenantName }: { tenantName?: string | null }) {
  const { user } = useAuthCtx();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const auth = await import('../lib/firebase').then(m => m.getAuthClient());
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-full border-b border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="font-semibold text-white">
            Ahau {tenantName ? `· ${tenantName}` : ''}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-300">
                {user.email}
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
