import React, { useState } from 'react';
import Head from 'next/head';
import { useLanguage } from '../lib/useLanguage';
import HeroSection from '../components/HeroSection';
import WaitlistForm from '../components/WaitlistForm';

export default function Ahau() {
  const { content, language, isLoading } = useLanguage();
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCTAClick = () => {
    setShowWaitlist(true);
    document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWaitlistSubmit = (success: boolean, message: string) => {
    if (success) {
      setSuccessMessage(message);
      setShowSuccessModal(true);
    } else {
      alert(message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Head>
        <title>Ahau - El liderazgo, sincronizado</title>
        <meta name="description" content="Sincroniza las voces de tus líderes para amplificar tu marca en LinkedIn" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Ahau - El liderazgo, sincronizado" />
        <meta property="og:description" content="Sincroniza las voces de tus líderes para amplificar tu marca en LinkedIn" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://uaylabs.web.app/ahau" />
      </Head>

      {/* Hero Section */}
      <HeroSection content={content.hero} onCTAClick={handleCTAClick} />

      {/* Problem Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {content.problem.title}
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              {content.problem.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.problem.painPoints.map((point, index) => (
              <div key={index} className="card">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-ahau-coral rounded-full flex items-center justify-center mt-1">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {point}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-r from-ahau-blue/10 to-ahau-dark/10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {content.solution.title}
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              {content.solution.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.solution.features.map((feature, index) => (
              <div key={index} className="card">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-ahau-gold rounded-full flex items-center justify-center mt-1">
                    <span className="text-ahau-dark font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {feature}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {content.benefits.title}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.benefits.items.map((item, index) => (
              <div key={index} className="card">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-ahau-gold to-ahau-coral rounded-full flex items-center justify-center mx-auto mb-4">
                    {index === 0 && (
                      <svg className="w-8 h-8 text-ahau-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                    {index === 1 && (
                      <svg className="w-8 h-8 text-ahau-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                    {index === 2 && (
                      <svg className="w-8 h-8 text-ahau-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {index === 3 && (
                      <svg className="w-8 h-8 text-ahau-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <div id="waitlist-section">
        <WaitlistForm content={content.waitlist} onSubmit={handleWaitlistSubmit} />
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 Ahau. Built by UayLabs.
          </p>
        </div>
      </footer>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ¡Bienvenido a Ahau!
              </h3>
              <p className="text-gray-600 mb-6">
                {successMessage}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">¿Qué sigue?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Te notificaremos cuando Ahau lance
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Acceso temprano a funciones de personalización
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Insights exclusivos sobre estrategias de LinkedIn
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-ahau-gold to-ahau-coral hover:from-yellow-500 hover:to-red-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
