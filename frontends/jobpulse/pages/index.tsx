import React from 'react';
import Head from 'next/head';

export default function JobPulse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
      <Head>
        <title>JobPulse - UayLabs Venture Builder</title>
        <meta name="description" content="JobPulse - Coming Soon" />
      </Head>
      
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">JobPulse</h1>
        <p className="text-xl mb-8">Coming Soon</p>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">💼 Producto en Desarrollo</h2>
          <p className="text-gray-200">
            Estamos trabajando en algo increíble. 
            Pronto tendrás más información sobre este nuevo producto de UayLabs.
          </p>
          <a 
            href="/"
            className="inline-block mt-6 px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Volver a UayLabs
          </a>
        </div>
      </div>
    </div>
  );
} 