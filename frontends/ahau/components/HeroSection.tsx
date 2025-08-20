import React from 'react';

interface HeroSectionProps {
  content: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    ctaPrimary: string;
    socialProof: string[];
  };
  onCTAClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ content, onCTAClick }) => {
  return (
    <section className="min-h-screen relative overflow-hidden bg-gradient-to-br from-ahau-blue via-ahau-dark to-black">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-30"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-ahau-gold/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-ahau-coral/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-ahau-blue/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-1/4 right-1/4 w-16 h-16 border border-ahau-gold/30 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-ahau-coral/20 rounded-full animate-bounce"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo and Badge */}
          <div className="mb-8">
            <div className="mx-auto mb-8 w-20 h-20 bg-gradient-to-br from-ahau-gold to-yellow-400 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <span className="text-3xl font-bold text-ahau-dark">A</span>
            </div>
            
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-ahau-gold/20 to-ahau-coral/20 border border-ahau-gold/40 rounded-full text-ahau-gold text-sm font-semibold mb-8 backdrop-blur-sm">
              <span className="w-3 h-3 bg-ahau-gold rounded-full mr-3 animate-pulse"></span>
              {content.badge}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              <span className="bg-gradient-to-r from-ahau-gold via-yellow-400 to-ahau-coral bg-clip-text text-transparent">
                {content.title.split(' ').slice(0, 2).join(' ')}
              </span>
              <br />
              <span className="text-white">
                {content.title.split(' ').slice(2).join(' ')}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8 font-light">
              {content.subtitle}
            </p>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              {content.description}
            </p>
          </div>
          
          {/* CTA Button */}
          <div className="flex justify-center mb-16">
            <button
              onClick={onCTAClick}
              className="group relative px-12 py-5 bg-gradient-to-r from-ahau-gold to-yellow-400 text-ahau-dark font-bold text-xl rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-ahau-gold/25"
            >
              <span className="relative z-10 flex items-center justify-center">
                {content.ctaPrimary}
                <svg className="ml-3 w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-ahau-gold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400">
            {content.socialProof.map((proof, index) => (
              <div key={index} className="flex items-center bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <span className="text-ahau-gold mr-2 text-lg">✨</span>
                <span className="text-sm font-medium">{proof}</span>
              </div>
            ))}
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-ahau-gold/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-ahau-gold rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
