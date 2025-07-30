import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  language: 'es' | 'en';
}

export default function SuccessModal({ isOpen, onClose, message, language }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {language === 'en' ? 'Welcome to Ignium!' : '¡Bienvenido a Ignium!'}
          </h3>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {/* Next steps */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">
              {language === 'en' ? 'What happens next?' : '¿Qué sigue?'}
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {language === 'en' ? 'We\'ll notify you when Ignium launches' : 'Te notificaremos cuando Ignium lance'}
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {language === 'en' ? 'Early access to new features' : 'Acceso temprano a nuevas funciones'}
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {language === 'en' ? 'Exclusive updates and insights' : 'Actualizaciones e insights exclusivos'}
              </li>
            </ul>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {language === 'en' ? 'Got it!' : '¡Entendido!'}
          </button>
        </div>
      </div>
    </div>
  );
} 