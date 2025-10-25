import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Play, 
  CheckCircle, 
  ArrowRight,
  Target,
  Zap,
  Users
} from 'lucide-react';
import { useLanguage } from '../lib/useLanguage';

const ToneTrainerTeaser: React.FC = () => {
  const { content } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayDemo = () => {
    setIsPlaying(true);
    // Simular demo por 3 segundos
    setTimeout(() => setIsPlaying(false), 3000);
  };

  return (
    <section id="try-tone-trainer" className="py-20 px-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {content.toneTrainer.title}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {content.toneTrainer.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Demo Area */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 overflow-hidden">
              {/* Demo Interface */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-400">Tone Trainer</div>
                </div>

                {/* Demo Content */}
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm text-gray-300 mb-2">Escribe tu mensaje:</div>
                    <div className="bg-black/20 rounded p-3 text-white text-sm">
                      {isPlaying ? "Nuestro equipo está comprometido con la innovación..." : "Escribe aquí tu mensaje..."}
                    </div>
                  </div>

                  {/* Analysis Results */}
                  {isPlaying && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Tono profesional ✓</span>
                        </div>
                      </div>
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-blue-400 text-sm">
                          <Target className="w-4 h-4" />
                          <span>Alineado con objetivos de marca ✓</span>
                        </div>
                      </div>
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-purple-400 text-sm">
                          <Users className="w-4 h-4" />
                          <span>Coherente con tu estilo ✓</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Play Button */}
                <div className="flex justify-center">
                  <motion.button
                    onClick={handlePlayDemo}
                    disabled={isPlaying}
                    className={`group relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                      isPlaying
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white hover:scale-105'
                    }`}
                    whileHover={{ scale: isPlaying ? 1 : 1.05 }}
                    whileTap={{ scale: isPlaying ? 1 : 0.95 }}
                  >
                    <span className="flex items-center">
                      {isPlaying ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Analizando...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                          Probar Demo
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl" />
            </div>
          </motion.div>

          {/* Right Side - Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">
                {content.toneTrainer.demoTitle}
              </h3>
              <p className="text-lg text-gray-300 mb-6">
                {content.toneTrainer.demoDescription}
              </p>
            </div>

            <div className="space-y-4">
              {content.toneTrainer.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="pt-6"
            >
              <button className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
                <span className="flex items-center justify-center">
                  {content.toneTrainer.cta}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ToneTrainerTeaser;
