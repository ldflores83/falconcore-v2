import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import WaitlistForm from '../components/WaitlistForm';

export default function WaitlistPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleWaitlistSubmit = async (data: { productName: string; website: string; email: string }) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('https://api-fu54nvsqfa-uc.a.run.app/api/public/addToWaitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          projectId: 'onboardingaudit'
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message
        });
        
        // Limpiar formulario después de 3 segundos
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Failed to join waitlist. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Join Waitlist - Onboarding Audit</title>
        <meta name="description" content="Join our waitlist for Onboarding Audit services" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <button
              onClick={() => router.push('/onboardingaudit')}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Onboarding Audit
            </button>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Onboarding Audit Waitlist
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're currently at capacity with our onboarding audit services. 
              Join our waitlist to be notified when a slot becomes available!
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`max-w-md mx-auto mb-8 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Waitlist Form */}
          <WaitlistForm onSubmit={handleWaitlistSubmit} isLoading={isLoading} />

          {/* Additional Information */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                What Happens Next?
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Join Waitlist</h3>
                  <p className="text-gray-600">
                    Submit your information and we'll add you to our queue
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Notified</h3>
                  <p className="text-gray-600">
                    We'll email you as soon as a slot becomes available
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Audit</h3>
                  <p className="text-gray-600">
                    Complete your onboarding audit request and get started
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Questions? Contact us at{' '}
              <a href="mailto:support@uaylabs.com" className="text-blue-600 hover:text-blue-800">
                support@uaylabs.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
