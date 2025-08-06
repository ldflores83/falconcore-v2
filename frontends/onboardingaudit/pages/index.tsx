import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AuditForm from '../components/AuditForm';
import SuccessMessage from '../components/SuccessMessage';
import { initAnalytics } from '../lib/analytics';
import { OnboardingAuditAPI } from '../lib/api';

export default function OnboardingAudit() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [canSubmit, setCanSubmit] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  // Initialize analytics tracking
  useEffect(() => {
    initAnalytics('onboardingaudit');
  }, []);

  // Set default state on component mount
  useEffect(() => {
    setIsLoading(false);
    setCanSubmit(true); // Always allow submission
  }, []);

  const handleSubmit = (success: boolean, message: string) => {
    if (success) {
      setSuccessMessage(message);
      setIsSubmitted(true);
    } else {
      // Handle error - you could show an error message component
      alert(message);
    }
  };

  const handleBack = () => {
    setIsSubmitted(false);
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <Head>
        <title>Onboarding Audit - UayLabs Venture Builder</title>
        <meta name="description" content="Get your onboarding audit in 48 hours. We'll review your signup flow and deliver a 2-3 page report with actionable recommendations." />
        <meta name="keywords" content="onboarding audit, user experience, conversion optimization, startup growth" />
        <meta property="og:title" content="Onboarding Audit - UayLabs" />
        <meta property="og:description" content="Get your onboarding audit in 48 hours with actionable recommendations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://uaylabs.web.app/onboardingaudit" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-8">
            <a 
              href="/" 
              className="inline-flex items-center text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to UayLabs
            </a>
            
            {/* Admin link - discreto */}
            <a 
              href="/onboardingaudit/login" 
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
              title="Admin Panel"
            >
              Admin
            </a>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Get your onboarding audit in{' '}
              <span className="text-yellow-300">48 hours</span>
            </h1>
            
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              We'll review your signup flow and deliver a 2-3 page report with actionable recommendations to improve your user activation and reduce churn.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-300">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Free audit
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                2-3 page report
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Actionable insights
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                48-hour delivery
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {!isSubmitted ? (
            <div className="space-y-8">
              {/* Loading State */}
              {isLoading && (
                <div className="card text-center">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="text-white">Checking availability...</p>
                </div>
              )}

              {/* Waitlist Message */}
              {!isLoading && !canSubmit && (
                <div className="card text-center">
                  <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Currently at Capacity</h3>
                  <p className="text-gray-300 mb-6">
                    We are currently working on {pendingCount} pending requests. 
                    We want to ensure the quality of each analysis.
                  </p>
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <p className="text-blue-200 text-sm">
                      <strong>Join the waitlist!</strong> We'll notify you when new spots become available.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button 
                      onClick={() => window.location.reload()} 
                      className="btn-secondary"
                    >
                      Check Again
                    </button>
                    <div className="text-xs text-gray-400">
                      Spots open up as we complete audits
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits Section */}
              {!isLoading && canSubmit && (
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="card text-center">
                  <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Identify Friction</h3>
                  <p className="text-sm text-gray-300">
                    We'll pinpoint exactly where users drop off in your onboarding flow
                  </p>
                </div>
                
                <div className="card text-center">
                  <div className="w-12 h-12 bg-success-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Actionable Insights</h3>
                  <p className="text-sm text-gray-300">
                    Get specific recommendations you can implement immediately
                  </p>
                </div>
                
                <div className="card text-center">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Fast Delivery</h3>
                  <p className="text-sm text-gray-300">
                    Receive your comprehensive report within 48 hours
                  </p>
                </div>
              </div>
              )}

              {/* Form */}
              {!isLoading && canSubmit && (
                <AuditForm onSubmit={handleSubmit} />
              )}
            </div>
          ) : (
            <SuccessMessage message={successMessage} onBack={handleBack} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-300 text-sm">
          <p>
            Powered by{' '}
            <a href="/" className="text-white hover:text-primary-300 transition-colors">
              UayLabs Venture Builder
            </a>
          </p>
          <p className="mt-2">
            Helping founders build better products through data-driven insights
          </p>
        </div>
      </div>
    </div>
  );
} 