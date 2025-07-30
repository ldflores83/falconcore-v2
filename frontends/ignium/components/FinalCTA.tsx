import React, { useState } from 'react';

const FinalCTA: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setMessage('Saving...');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('✅ Registered');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(`❌ ${data.error || 'Failed to join waitlist'}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage('❌ Error');
    }
  };

  return (
    <section className="py-20 bg-[#1a1a1a] px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Want to help shape Ignium?
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Be one of the first to try it and give feedback.
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-8 md:p-12 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                Join the waitlist
              </button>
            </div>
            
            {message && (
              <div className={`text-sm font-medium ${
                status === 'success' ? 'text-green-400' : 
                status === 'error' ? 'text-red-400' : 
                'text-orange-400'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA; 