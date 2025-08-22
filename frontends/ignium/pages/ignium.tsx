import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useLanguage } from '../lib/useLanguage';
import SuccessModal from '../components/SuccessModal';
import { createAnalyticsTracker } from '../lib/analytics';

export default function Ignium() {
  const { content, language, isLoading } = useLanguage();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize analytics tracker
  useEffect(() => {
    const tracker = createAnalyticsTracker('ignium');
    tracker.trackPageVisit('ignium-landing');

    // Track page exit
    const handleBeforeUnload = () => {
      tracker.trackPageExit();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      // Call the Cloud Function instead of Next.js API
      const response = await fetch('https://api-fu54nvsqfa-uc.a.run.app/api/public/addToWaitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          language,
          projectId: 'ignium',
          productName: 'Ignium',
          website: 'https://uaylabs.web.app/ignium'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Track successful waitlist submission
        const tracker = createAnalyticsTracker('ignium');
        tracker.trackPageVisit('waitlist-success');
        
        setSuccessMessage(data.message);
        setShowSuccessModal(true);
        setEmail('');
        setName('');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error submitting waitlist:', error);
      alert(language === 'en' ? 'Error submitting form. Please try again.' : 'Error al enviar el formulario. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]">
      <Head>
        <title>Ignium - {content.hero.title}</title>
        <meta name="description" content={content.hero.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Hero Section - Más Impactante */}
      <section className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-500 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <img 
              src="/logo.svg" 
              alt="Ignium Logo" 
              className="mx-auto mb-8 h-16 md:h-20" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            
            {/* Badge destacado */}
            <div className="inline-flex items-center px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
              {content.hero.badge}
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {content.hero.title.split('primer cliente').map((part, index) => 
                index === 0 ? (
                  <span key={index}>
                    {part}
                    <span className="bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
                      {language === 'en' ? ' first customer' : ' primer cliente'}
                    </span>
                  </span>
                ) : (
                  <span key={index}>{part}</span>
                )
              )}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
              {content.hero.subtitle}
            </p>
            <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              {content.hero.description}
            </p>
          </div>
          
          {/* Waitlist Form */}
          <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder={language === 'en' ? 'Your name (optional)' : 'Tu nombre (opcional)'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <input
                type="email"
                placeholder={language === 'en' ? 'Your email' : 'Tu email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {language === 'en' ? 'Joining...' : 'Uniéndose...'}
                </span>
              ) : (
                content.hero.ctaPrimary
              )}
            </button>
          </form>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-400 text-sm">
            {content.hero.socialProof.map((proof, index) => (
              <div key={index} className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                {proof}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Yeka Section - Destacado */}
      <section className="py-20 bg-gradient-to-r from-[#121212] to-[#1a1a2e] px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium mb-4">
                {content.yeka.badge}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                {content.yeka.title}
              </h2>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
                {content.yeka.description}
              </p>
              <div className="space-y-4">
                {content.yeka.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <img 
                  src="/yeka.png" 
                  alt="Yeka - Tu copiloto conversacional" 
                  className="relative max-w-sm md:max-w-md w-full h-auto rounded-xl shadow-2xl" 
                />
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  AI Copilot
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos Section - Nuevo */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {content.modules.title}
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              {content.modules.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.modules.items.map((item, index) => {
              const colors = [
                'from-orange-500/10 to-orange-600/10 border-orange-500/20',
                'from-purple-500/10 to-purple-600/10 border-purple-500/20',
                'from-blue-500/10 to-blue-600/10 border-blue-500/20',
                'from-green-500/10 to-green-600/10 border-green-500/20',
                'from-red-500/10 to-red-600/10 border-red-500/20',
                'from-yellow-500/10 to-yellow-600/10 border-yellow-500/20'
              ];
              
              return (
                <div key={index} className={`bg-gradient-to-br ${colors[index]} backdrop-blur-sm rounded-xl p-6 border hover:border-opacity-40 transition-all duration-300`}>
                  <div className="text-3xl mb-4">{['🧠', '✍️', '📬', '🧪', '📈', '🖼️'][index]}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.name}</h3>
                  <p className="text-gray-300 text-sm">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Diferenciadores Section */}
      <section className="py-20 bg-gradient-to-r from-[#121212] to-[#1a1a2e] px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-12">
            {content.differentiators.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.differentiators.items.map((item, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10">
                <div className="text-4xl mb-4">{['🎯', '⚡', '📧', '🧠'][index]}</div>
                <h3 className="text-2xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-gray-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resultado Final Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8">
            {content.results.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {content.results.items.map((item, index) => {
              const colors = [
                'from-green-500/20 to-green-600/20 border-green-500/30',
                'from-blue-500/20 to-blue-600/20 border-blue-500/30',
                'from-purple-500/20 to-purple-600/20 border-purple-500/30',
                'from-orange-500/20 to-orange-600/20 border-orange-500/30',
                'from-red-500/20 to-red-600/20 border-red-500/30',
                'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30'
              ];
              
              return (
                <div key={index} className={`bg-gradient-to-br ${colors[index]} rounded-lg p-6 border`}>
                  <div className="text-2xl mb-3">{['📋', '🎤', '🖼️', '📊', '📈', '💬'][index]}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item}</h3>
                </div>
              );
            })}
          </div>
          <p className="text-lg text-gray-300 mb-8">
            {content.results.subtitle}
          </p>
        </div>
      </section>

      {/* Final CTA Section - Más Impactante */}
      <section className="py-20 bg-gradient-to-r from-orange-500/10 to-purple-500/10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {content.cta.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {content.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => document.getElementById('hero-waitlist')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {content.cta.primary}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 Ignium. Built by UayLabs.
          </p>
        </div>
      </footer>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
        language={language}
      />
    </div>
  );
} 