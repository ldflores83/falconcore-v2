import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../lib/useLanguage';

const LogosStrip: React.FC = () => {
  const { content } = useLanguage();
  const logos = [
    { name: "Microsoft", logo: "🏢" },
    { name: "Google", logo: "🔍" },
    { name: "Amazon", logo: "📦" },
    { name: "Meta", logo: "📘" },
    { name: "Apple", logo: "🍎" },
    { name: "Netflix", logo: "🎬" },
    { name: "Spotify", logo: "🎵" },
    { name: "Tesla", logo: "⚡" }
  ];

  return (
    <section className="py-16 bg-white/5 backdrop-blur-sm border-y border-white/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">
            {content.logosStrip.title}
          </h2>
          <p className="text-gray-400">
            {content.logosStrip.subtitle}
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          <motion.div
            className="flex space-x-12 items-center justify-center"
            animate={{
              x: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...logos, ...logos].map((logo, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-3xl">{logo.logo}</span>
                <span className="text-lg font-medium">{logo.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LogosStrip;
