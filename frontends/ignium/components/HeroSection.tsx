import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <img src="/logo.svg" alt="Ignium Logo" className="mx-auto mb-8 h-16" />
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Bring your loose idea to life...v2
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            No code. No team. No audience needed.
          </p>
        </div>
        
        <div className="mt-12">
          <button className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105">
            Join the waitlist
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 