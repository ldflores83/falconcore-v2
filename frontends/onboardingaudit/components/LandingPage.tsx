import React from 'react';
import Head from 'next/head';
import { createAnalyticsTracker } from '../lib/analytics';

export default function LandingPage() {
  // Initialize analytics tracking
  React.useEffect(() => {
    const tracker = createAnalyticsTracker('onboardingaudit');
    tracker.trackPageVisit('landing');

    // Track page exit
    const handleBeforeUnload = () => {
      tracker.trackPageExit();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleCTAClick = () => {
    // Track CTA click
    const tracker = createAnalyticsTracker('onboardingaudit');
    tracker.trackPageVisit('cta_click');
    
    // Navigate to form
    window.location.href = '/onboardingaudit/form';
  };

  return (
    <>
      <Head>
        <title>Onboarding Audit - Maximize Your Activation Rate | UayLabs</title>
        <meta name="description" content="Get a professional onboarding audit in 48 hours. Improve user activation, reduce churn, and boost retention with actionable recommendations." />
        <meta name="keywords" content="onboarding audit, user activation, conversion optimization, SaaS growth, user experience" />
        <meta property="og:title" content="Onboarding Audit - Maximize Your Activation Rate" />
        <meta property="og:description" content="Get a professional onboarding audit in 48 hours with actionable recommendations to improve user activation and reduce churn." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://uaylabs.web.app/onboardingaudit" />
        <meta property="og:image" content="https://uaylabs.web.app/onboardingaudit/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Onboarding Audit - Maximize Your Activation Rate" />
        <meta name="twitter:description" content="Get a professional onboarding audit in 48 hours with actionable recommendations." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <a href="/" className="text-xl font-bold text-gray-900">
                  UayLabs
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <a 
                  href="/onboardingaudit/form" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Start Audit
                </a>
                <a 
                  href="/" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Section 1: Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Maximize Your Activation Rate with a{' '}
                <span className="text-yellow-300">Professional Onboarding Audit</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Your first impression matters. Improve user activation, reduce churn, and boost retention by optimizing your onboarding flow.
              </p>
              <button
                onClick={handleCTAClick}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Start My Audit
              </button>
              <p className="text-blue-200 mt-4 text-sm">
                Get your report in 48 hours • Free during beta
              </p>
            </div>
          </div>
          
          {/* Hero Image Placeholder */}
          <div className="absolute bottom-0 right-0 w-1/3 h-full opacity-20">
            <div className="w-full h-full bg-gradient-to-t from-blue-800 to-transparent"></div>
          </div>
        </section>

        {/* Section 2: Why Onboarding Matters */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Onboarding Matters
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Onboarding is the user's first experience with your product. A smooth, well-designed onboarding guides them to their "aha moment" quickly, increasing the chance they'll stay and succeed.
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-4xl font-bold text-blue-600 mb-2">50%</div>
                <p className="text-gray-700">Higher activation rates for companies with optimized onboarding</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-4xl font-bold text-green-600 mb-2">20%</div>
                <p className="text-gray-700">Reduction in churn by improving Time-to-Aha</p>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-xl">
                <div className="text-4xl font-bold text-red-600 mb-2">#3</div>
                <p className="text-gray-700">Poor onboarding is a top reason users abandon products</p>
              </div>
            </div>

            {/* Funnel Visualization */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">The Onboarding Funnel</h3>
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Signup</h4>
                  <p className="text-sm text-gray-600">User registers</p>
                </div>
                <div className="hidden md:block text-blue-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">First Action</h4>
                  <p className="text-sm text-gray-600">User takes first step</p>
                </div>
                <div className="hidden md:block text-green-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Aha Moment</h4>
                  <p className="text-sm text-gray-600">User sees value</p>
                </div>
                <div className="hidden md:block text-purple-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Activation</h4>
                  <p className="text-sm text-gray-600">User is engaged</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: What the Audit Delivers */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                What the Audit Delivers
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Unlike generic checklists, our audit provides tailored, actionable recommendations based on your actual flow and business goals.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Complete Audit Package</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Clear Onboarding Map</h4>
                      <p className="text-gray-600">Detailed visualization of your current onboarding steps</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Bottleneck Analysis</h4>
                      <p className="text-gray-600">Identification of drop-off points and friction areas</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">7-Day Action Plan</h4>
                      <p className="text-gray-600">Quick wins you can implement immediately</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Industry Benchmarks</h4>
                      <p className="text-gray-600">Compare your metrics to similar products</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Before/After Comparison */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Before vs After</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="bg-red-100 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-red-800 mb-2">Before Audit</h4>
                      <div className="space-y-2">
                        <div className="w-full h-2 bg-red-300 rounded"></div>
                        <div className="w-3/4 h-2 bg-red-300 rounded"></div>
                        <div className="w-1/2 h-2 bg-red-300 rounded"></div>
                        <div className="w-1/4 h-2 bg-red-300 rounded"></div>
                      </div>
                      <p className="text-sm text-red-600 mt-2">Confusing flow</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-green-800 mb-2">After Audit</h4>
                      <div className="space-y-2">
                        <div className="w-full h-2 bg-green-400 rounded"></div>
                        <div className="w-full h-2 bg-green-400 rounded"></div>
                        <div className="w-full h-2 bg-green-400 rounded"></div>
                        <div className="w-full h-2 bg-green-400 rounded"></div>
                      </div>
                      <p className="text-sm text-green-600 mt-2">Streamlined flow</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Who Should Use It */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Who Should Use It
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Perfect for teams focused on user growth and product success
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-blue-50 rounded-2xl">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">SaaS Founders</h3>
                <p className="text-gray-600">
                  Improve conversion from signup to paid and reduce customer acquisition costs
                </p>
              </div>
              <div className="text-center p-8 bg-green-50 rounded-2xl">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Growth Leads</h3>
                <p className="text-gray-600">
                  Boost activation rates and optimize the user journey for better retention
                </p>
              </div>
              <div className="text-center p-8 bg-purple-50 rounded-2xl">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Success</h3>
                <p className="text-gray-600">
                  Improve adoption and retention by identifying onboarding friction points
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: How It Works */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Simple 3-step process to get your personalized onboarding audit
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Fill out the form</h3>
                <p className="text-gray-600">
                  Share details about your current onboarding flow and business goals
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">We analyze</h3>
                <p className="text-gray-600">
                  Our experts review your flow and metrics to identify opportunities
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Receive your report</h3>
                <p className="text-gray-600">
                  Get quick wins, benchmarks, and a 4-8 week improvement plan
                </p>
              </div>
            </div>

            <div className="text-center bg-blue-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Turnaround Time: 3-5 Business Days
              </h3>
              <p className="text-gray-600">
                Initial report delivered within 3-5 business days
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Pricing & Limited Free Offer */}
        <section className="py-20 bg-gradient-to-br from-yellow-400 to-orange-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Introductory Free Audits – Limited Spots Available
            </h2>
            <p className="text-xl text-gray-800 mb-8">
              This audit is currently in <strong>beta</strong>. We're offering a limited number of{' '}
              <strong>free audits</strong> to collect feedback and refine our process. Once these spots are filled, 
              the audit will be available at an <strong>introductory price of $50 USD</strong>.
            </p>
            <button
              onClick={handleCTAClick}
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Claim My Free Audit
            </button>
            <p className="text-gray-700 mt-4 text-sm">
              Limited time offer • No credit card required
            </p>
          </div>
        </section>

        {/* Section 7: Final Call to Action */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to improve your onboarding?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              The more complete your answers in the form, the more precise and actionable your audit will be.
            </p>
            <button
              onClick={handleCTAClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start My Audit Now
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">UayLabs Venture Builder</h3>
              <p className="text-gray-400 mb-6">
                Helping founders build better products through data-driven insights
              </p>
              <div className="flex justify-center space-x-6">
                <a href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </a>
                <a href="/onboardingaudit/form" className="text-gray-400 hover:text-white transition-colors">
                  Start Audit
                </a>
                <a href="mailto:support@uaylabs.com" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-800">
                <p className="text-gray-500 text-sm">
                  © 2024 UayLabs. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
