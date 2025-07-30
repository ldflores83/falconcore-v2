import React from 'react';

const WhatCanItDo: React.FC = () => {
  const modules = [
    { icon: '🧠', name: 'Yeka (your copilot)' },
    { icon: '🧱', name: 'Mockup Generator' },
    { icon: '✍️', name: 'Pitch Generator' },
    { icon: '🧪', name: 'Validation Planner' },
    { icon: '💬', name: 'Signal Collector' },
    { icon: '📬', name: 'Inbox Sync' },
    { icon: '📤', name: 'Asset Organizer' },
    { icon: '📈', name: 'Traction Tracker' }
  ];

  return (
    <section className="py-20 bg-[#0f0f1a] px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            What can Ignium do?
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-4">{module.icon}</div>
              <p className="text-lg text-gray-300 font-medium">
                {module.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatCanItDo; 