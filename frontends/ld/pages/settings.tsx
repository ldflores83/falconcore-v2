import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../components/Layout/AdminLayout';
import adminAPI from '../lib/api';

interface ProductConfig {
  id: string;
  name: string;
  frontendUrl: string;
  features: {
    formSubmission: boolean;
    fileUpload: boolean;
    analytics: boolean;
    waitlist: boolean;
    adminPanel: boolean;
    documentGeneration: boolean;
  };
  collections: {
    submissions: string;
    waitlist: string;
    analytics: string;
  };
  storageBucket: string;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export default function Settings() {
  const [configs, setConfigs] = useState<ProductConfig[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('onboardingaudit');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Obtener producto desde la URL si está presente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const productFromUrl = urlParams.get('product');
      if (productFromUrl) {
        setSelectedProduct(productFromUrl);
      }
    }
  }, []);

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Cargar configuración real desde la API
        const configs = await adminAPI.getAllProductConfigs();
        setConfigs(configs);
        
      } catch (err) {
        console.error('Error loading configs:', err);
        setError('Error loading configuration data');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfigs();
  }, []);

  const selectedConfig = configs.find(config => config.id === selectedProduct);

  const handleFeatureToggle = (feature: keyof ProductConfig['features']) => {
    if (!selectedConfig) return;
    
    setConfigs(prev => prev.map(config => 
      config.id === selectedProduct 
        ? { ...config, features: { ...config.features, [feature]: !config.features[feature] } }
        : config
    ));
  };

  if (isLoading) {
    return (
      <AdminLayout title="Settings">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Settings">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>LD Admin - Settings</title>
        <meta name="description" content="Product configuration and settings" />
      </Head>

      <AdminLayout title="Settings">
        {/* Product Selector */}
        <div className="mb-6">
          <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Product
          </label>
          <select
            id="product-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ld-primary focus:border-ld-primary"
          >
            <option value="onboardingaudit">Onboarding Audit</option>
            <option value="ignium">Ignium</option>
            <option value="jobpulse">JobPulse</option>
            <option value="pulziohq">PulzioHQ</option>
            <option value="ahau">Ahau</option>
          </select>
        </div>

        {selectedConfig && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={selectedConfig.name}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ld-primary focus:border-ld-primary"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frontend URL</label>
                  <input
                    type="url"
                    value={selectedConfig.frontendUrl}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ld-primary focus:border-ld-primary"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Features Configuration */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedConfig.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <p className="text-xs text-gray-500">
                        {enabled ? 'Feature is enabled' : 'Feature is disabled'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleFeatureToggle(feature as keyof ProductConfig['features'])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enabled ? 'bg-ld-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Collections Configuration */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Collections</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(selectedConfig.collections).map(([type, name]) => (
                  <div key={type}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {type} Collection
                    </label>
                    <input
                      type="text"
                      value={name}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ld-primary focus:border-ld-primary"
                      readOnly
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Storage Configuration */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Storage Bucket</label>
                <input
                  type="text"
                  value={selectedConfig.storageBucket}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ld-primary focus:border-ld-primary"
                  readOnly
                />
              </div>
            </div>

            {/* Rate Limits */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requests per Minute</label>
                  <input
                    type="number"
                    value={selectedConfig.rateLimits.requestsPerMinute}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ld-primary focus:border-ld-primary"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requests per Hour</label>
                  <input
                    type="number"
                    value={selectedConfig.rateLimits.requestsPerHour}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ld-primary focus:border-ld-primary"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button className="btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
