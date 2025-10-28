import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Play, CheckCircle, Users, Target, Zap } from 'lucide-react';
import { useLanguage } from '../lib/useLanguage';

interface HeroAhauProps {
  onCTAClick?: () => void;
}

const HeroAhau: React.FC<HeroAhauProps> = ({ onCTAClick }) => {
  const { content } = useLanguage();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const phases = [
    {
      title: content.hero.phases[0].title,
      subtitle: content.hero.phases[0].subtitle,
      description: content.hero.phases[0].description,
      icon: Users,
      color: "from-red-500 to-orange-500"
    },
    {
      title: content.hero.phases[1].title,
      subtitle: content.hero.phases[1].subtitle,
      description: content.hero.phases[1].description,
      icon: Target,
      color: "from-blue-500 to-purple-500"
    },
    {
      title: content.hero.phases[2].title,
      subtitle: content.hero.phases[2].subtitle,
      description: content.hero.phases[2].description,
      icon: Zap,
      color: "from-green-500 to-teal-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentPhase(prev => (prev + 1) % phases.length);
          return 0;
        }
        return prev + 2;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [phases.length]);

  const currentPhaseData = phases[currentPhase];
  const IconComponent = currentPhaseData.icon;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            {content.hero.badge}
          </motion.div>

          {/* Main Content */}
          <div className="mb-12">
            {/* Animated Phase Content */}
            <div className="h-32 flex items-center justify-center mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhase}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${currentPhaseData.color} mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                    {currentPhaseData.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-300 mb-2">
                    {currentPhaseData.subtitle}
                  </p>
                  <p className="text-lg text-gray-400">
                    {currentPhaseData.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto mb-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Fase {currentPhase + 1} de {phases.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full bg-gradient-to-r ${currentPhaseData.color}`}
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={onCTAClick}
                className="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
              >
                <span className="flex items-center">
                  {content.hero.ctaPrimary}
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button
                onClick={onCTAClick}
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  {content.hero.ctaSecondary}
                </span>
              </button>
            </motion.div>
          </div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {content.hero.socialProof.map((text, index) => {
              const icons = [CheckCircle, Target, Zap];
              const colors = ["text-green-400", "text-blue-400", "text-purple-400"];
              const IconComponent = icons[index];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="flex items-center justify-center space-x-2 text-gray-300"
                >
                  <IconComponent className={`w-5 h-5 ${colors[index]}`} />
                  <span className="text-sm font-medium">{text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroAhau;
