import React from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Brain, 
  Users, 
  Target, 
  Zap, 
  BarChart3,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '../lib/useLanguage';

const HowItWorks: React.FC = () => {
  const { content } = useLanguage();
  
  const icons = [Upload, Brain, Target, Users, Zap, BarChart3];
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-teal-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500",
    "from-indigo-500 to-purple-500"
  ];

  const steps = content.howItWorks.steps.map((step, index) => ({
    number: `0${index + 1}`,
    title: step.title,
    description: step.description,
    icon: icons[index],
    details: step.details,
    color: colors[index]
  }));

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-800/50 to-purple-900/50">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {content.howItWorks.title}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {content.howItWorks.subtitle}
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform -translate-y-1/2 opacity-30" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-white to-gray-300 rounded-full flex items-center justify-center text-black font-bold text-sm z-10">
                  {step.number}
                </div>

                <div className="relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 h-full">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors duration-300">
                    {step.description}
                  </p>

                  {/* Details */}
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <motion.li
                        key={detailIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: detailIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        {detail}
                      </motion.li>
                    ))}
                  </ul>

                  {/* Arrow for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/20 transition-colors duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-2 text-gray-400">
            <Zap className="w-5 h-5" />
            <span>¿Listo para empezar? El proceso completo toma menos de 10 minutos</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
