import React from 'react';

interface SuccessMessageProps {
  message: string;
  onBack: () => void;
}

export default function SuccessMessage({ message, onBack }: SuccessMessageProps) {
  return (
    <div className="card text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
        <p className="text-gray-200">{message}</p>
      </div>
      
      <div className="bg-white/5 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-white mb-2">What happens next?</h4>
        <ul className="text-sm text-gray-200 space-y-2 text-left">
          <li className="flex items-start">
            <span className="text-success-400 mr-2">✓</span>
            We'll review your onboarding flow and identify key friction points
          </li>
          <li className="flex items-start">
            <span className="text-success-400 mr-2">✓</span>
            Our team will create a detailed 2-3 page report with actionable recommendations
          </li>
          <li className="flex items-start">
            <span className="text-success-400 mr-2">✓</span>
            You'll receive your report within 48 hours in your preferred format
          </li>
        </ul>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={onBack}
          className="btn-primary w-full"
        >
          Submit Another Request
        </button>
        
        <a
          href="/"
          className="btn-secondary w-full block text-center"
        >
          Back to UayLabs
        </a>
      </div>
    </div>
  );
} 