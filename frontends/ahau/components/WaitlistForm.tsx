import React, { useState } from 'react';
import AhauClient from '../lib/api';

interface WaitlistFormProps {
  content: {
    title: string;
    description: string;
    form: {
      name: string;
      email: string;
      company: string;
      role: string;
      submit: string;
    };
  };
  onSubmit: (success: boolean, message: string) => void;
}

const WaitlistForm: React.FC<WaitlistFormProps> = ({ content, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    setIsSubmitting(true);
    try {
      const result = await AhauClient.joinWaitlist({
        ...formData,
        language: 'es', // Default to Spanish, can be made dynamic
        source: 'ahau-landing'
      });
      
      if (result.success) {
        onSubmit(true, result.message);
        setFormData({ name: '', email: '', company: '', role: '' });
      } else {
        onSubmit(false, result.message);
      }
    } catch (error) {
      console.error('Error submitting waitlist:', error);
      onSubmit(false, 'Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background with animated elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-ahau-blue/5 via-ahau-dark/5 to-black/5"></div>
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-ahau-gold/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-ahau-coral/10 rounded-full blur-3xl animate-float delay-1000"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            <span className="bg-gradient-to-r from-ahau-gold to-ahau-coral bg-clip-text text-transparent">
              {content.title}
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>
        
        <div className="relative">
          {/* Glowing border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-ahau-gold/20 via-ahau-coral/20 to-ahau-gold/20 rounded-3xl blur-xl animate-glow"></div>
          
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
              <div className="space-y-6 mb-8">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder={content.form.name}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-ahau-gold focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-ahau-gold/20 to-ahau-coral/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                </div>
                
                <div className="relative group">
                  <input
                    type="email"
                    placeholder={content.form.email}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-ahau-gold focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-ahau-gold/20 to-ahau-coral/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                </div>
                
                <div className="relative group">
                  <input
                    type="text"
                    placeholder={content.form.company}
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-ahau-gold focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-ahau-gold/20 to-ahau-coral/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                </div>
                
                <div className="relative group">
                  <input
                    type="text"
                    placeholder={content.form.role}
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-ahau-gold focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-ahau-gold/20 to-ahau-coral/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full px-8 py-5 bg-gradient-to-r from-ahau-gold to-yellow-400 text-ahau-dark font-bold text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      {content.form.submit}
                      <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-ahau-gold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
