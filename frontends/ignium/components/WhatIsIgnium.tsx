import React from 'react';

const WhatIsIgnium: React.FC = () => {
  return (
    <section className="py-20 bg-[#121212] px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What is Ignium?
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Ignium is your tactical copilot. It helps you structure your idea, take action, and get real feedback. Yeka, your conversational guide, helps activate the right modules at the right time.
            </p>
          </div>
          
          <div className="flex justify-center">
            <img src="/yeka.png" alt="Yeka" className="max-w-md w-full h-auto" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsIgnium; 