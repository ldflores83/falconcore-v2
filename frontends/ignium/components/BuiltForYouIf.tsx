import React from 'react';

const BuiltForYouIf: React.FC = () => {
  const items = [
    "You don't know where to start",
    "You're tired of theory and want action",
    "You want to validate before you build",
    "You work solo and want a system that supports you"
  ];

  return (
    <section className="py-20 bg-[#1a1a1a] px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Built for you if...
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full mt-1"></div>
              <p className="text-xl text-gray-300 leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BuiltForYouIf; 