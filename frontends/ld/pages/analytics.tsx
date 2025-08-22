import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../components/Layout/AdminLayout';
import adminAPI from '../lib/api';

interface AnalyticsData {
  productId: string;
  totalVisits: number;
  totalSubmissions: number;
  totalWaitlist: number;
  conversionRate: number;
  lastActivity: string;
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
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
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const data = await adminAPI.getProductStats(selectedProduct);
        setAnalyticsData(data);
        
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Error loading analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedProduct]);

  if (isLoading) {
    return (
      <AdminLayout title="Analytics">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Analytics">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>LD Admin - Analytics</title>
        <meta name="description" content="Analytics dashboard for all products" />
      </Head>

      <AdminLayout title="Analytics">
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

        {analyticsData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="text-sm font-medium opacity-90">Total Visits</div>
                <div className="text-3xl font-bold">{analyticsData.totalVisits}</div>
              </div>
              
              <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="text-sm font-medium opacity-90">Total Submissions</div>
                <div className="text-3xl font-bold">{analyticsData.totalSubmissions}</div>
              </div>
              
              <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="text-sm font-medium opacity-90">Total Waitlist</div>
                <div className="text-3xl font-bold">{analyticsData.totalWaitlist}</div>
              </div>
              
              <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="text-sm font-medium opacity-90">Conversion Rate</div>
                <div className="text-3xl font-bold">{analyticsData.conversionRate.toFixed(1)}%</div>
              </div>
            </div>

            {/* Product Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Product ID:</span>
                  <p className="text-gray-900">{analyticsData.productId}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Activity:</span>
                  <p className="text-gray-900">{new Date(analyticsData.lastActivity).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
}
