import React, { useState } from 'react';

interface WaitlistFormProps {
  onSubmit: (data: { productName: string; website: string; email: string }) => void;
  isLoading?: boolean;
}

export default function WaitlistForm({ onSubmit, isLoading = false }: WaitlistFormProps) {
  const [formData, setFormData] = useState({
    productName: '',
    website: '',
    email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.website.trim()) {
      newErrors.website = 'Website is required';
    } else if (!formData.website.startsWith('http://') && !formData.website.startsWith('https://')) {
      newErrors.website = 'Website must start with http:// or https:// (e.g., https://yourcompany.com)';
    } else if (formData.website.length < 10) {
      newErrors.website = 'Website seems too short. Please enter a complete URL.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., user@company.com)';
    } else if (formData.email.length < 5) {
      newErrors.email = 'Email seems too short. Please enter a complete email address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation for website field
    if (field === 'website' && value.trim()) {
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        setErrors(prev => ({ ...prev, website: 'Website must start with http:// or https://' }));
      } else if (value.length < 10) {
        setErrors(prev => ({ ...prev, website: 'Website seems too short' }));
      } else {
        setErrors(prev => ({ ...prev, website: '' }));
      }
    }
    
    // Real-time validation for email field
    if (field === 'email' && value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Our Waitlist</h2>
        <p className="text-gray-600">
          We're currently working on other reports. Join our waitlist to be notified when a slot becomes available!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            id="productName"
            value={formData.productName}
            onChange={(e) => handleInputChange('productName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.productName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your product name"
            disabled={isLoading}
          />
          {errors.productName && (
            <p className="mt-1 text-sm text-red-600">{errors.productName}</p>
          )}
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
            Website *
          </label>
          <input
            type="url"
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.website ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://www.yourcompany.com"
            disabled={isLoading}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your@email.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Formato esperado:</strong><br/>
            • Website: debe comenzar con http:// o https:// (ej: https://www.empresa.com)<br/>
            • Email: formato válido (ej: admin@empresa.com)
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Joining Waitlist...
            </div>
          ) : (
            'Join Waitlist'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          We'll notify you via email when a slot becomes available.
        </p>
      </div>
    </div>
  );
}
