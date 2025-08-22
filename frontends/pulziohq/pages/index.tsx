import React, { useEffect } from 'react';
import Head from 'next/head';
import { createAnalyticsTracker } from '../lib/analytics';

export default function PulzioHQ() {
  // Initialize analytics tracker
  useEffect(() => {
    const tracker = createAnalyticsTracker('pulziohq');
    tracker.trackPageVisit('pulziohq-landing');

    // Track page exit
    const handleBeforeUnload = () => {
      tracker.trackPageExit();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
      <Head>
        <title>PulzioHQ - UayLabs Venture Builder</title>
        <meta name="description" content="PulzioHQ - Coming Soon" />
      </Head>
      
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">PulzioHQ</h1>
        <p className="text-xl mb-8">Coming Soon</p>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">🚀 Producto en Desarrollo</h2>
          <p className="text-gray-200">
            Estamos trabajando en algo increíble. 
            Pronto tendrás más información sobre este nuevo producto de UayLabs.
          </p>
          <a 
            href="/"
            className="inline-block mt-6 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Volver a UayLabs
          </a>
        </div>
      </div>
    </div>
  );
} 