import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleOAuthLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Redirigir a OAuth con projectId específico para onboardingaudit
      // Usar URL directa de la función api (solución temporal mientras se arregla el rewrite)
      const timestamp = Date.now();
      const oauthUrl = `https://uaylabs.web.app/onboardingaudit/api/oauth/login?project_id=onboardingaudit&t=${timestamp}`;
      window.location.href = oauthUrl;
    } catch (error) {
      setError('Error starting authentication. Please try again.');
      setIsLoading(false);
    }
  };

  // Verificar si ya está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Usar URL directa de la función api para auth check
        const response = await fetch('https://uaylabs.web.app/onboardingaudit/api/auth/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: 'onboardingaudit',
            userId: 'luisdaniel883@gmail.com_onboardingaudit'
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.email === 'luisdaniel883@gmail.com') {
            router.push('/onboardingaudit/admin');
          }
        }
      } catch (error) {
        console.log('No autenticado');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
      <Head>
        <title>Admin Login - Onboarding Audit</title>
        <meta name="description" content="Administrator login for Onboarding Audit module" />
      </Head>

      <div className="max-w-md w-full mx-4">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-gray-300 text-sm">
              Onboarding Audit Administration Panel
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Access Requirements</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Only authorized administrators can access</li>
                <li>• Must use Google account: luisdaniel883@gmail.com</li>
                <li>• View and manage audit submissions</li>
              </ul>
            </div>

            <button
              onClick={handleOAuthLogin}
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            <div className="text-center">
              <a 
                href="/onboardingaudit" 
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                ← Back to Audit Form
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 