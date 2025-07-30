import React from 'react';

const PostLaunchAndTech: React.FC = () => {
  const afterLaunchItems = [
    "Track signals from your inbox",
    "Organize new insights",
    "Iterate your proposal",
    "Activate new campaigns",
    "Generate new deliverables"
  ];

  const techItems = [
    {
      title: "MemorySync",
      description: "remembers your progress and context"
    },
    {
      title: "Multi-LLM Intelligence",
      description: "uses the best model for each task"
    },
    {
      title: "Modular architecture",
      description: "every action is a block"
    },
    {
      title: "Privacy-first",
      description: "you own your inbox and Drive"
    }
  ];

  return (
    <section className="py-20 bg-[#121212] px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Column 1: What happens after launch? */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">
              What happens after launch?
            </h3>
            <div className="space-y-4">
              {afterLaunchItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p className="text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: How does it do that? */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">
              How does it do that?
            </h3>
            <div className="space-y-4">
              {techItems.map((item, index) => (
                <div key={index}>
                  <h4 className="text-orange-500 font-semibold mb-1">
                    {item.title}:
                  </h4>
                  <p className="text-gray-300">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostLaunchAndTech; 