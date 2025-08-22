import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../components/Layout/AdminLayout';
import adminAPI from '../lib/api';
import { WaitlistEntry } from '../types/admin';

export default function Waitlists() {
  const [waitlistData, setWaitlistData] = useState<Record<string, WaitlistEntry[]>>({});
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
    const loadWaitlists = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Cargar waitlist para el producto seleccionado
        const data = await adminAPI.getProductWaitlist(selectedProduct);
        setWaitlistData(prev => ({
          ...prev,
          [selectedProduct]: data
        }));
        
      } catch (err) {
        console.error('Error loading waitlist:', err);
        setError('Error loading waitlist data');
      } finally {
        setIsLoading(false);
      }
    };

    loadWaitlists();
  }, [selectedProduct]);

  const handleStatusUpdate = async (productId: string, entryId: string, newStatus: 'waiting' | 'notified' | 'converted') => {
    try {
      await adminAPI.updateWaitlistStatus(productId, entryId, newStatus);
      
      // Actualizar el estado local
      setWaitlistData(prev => ({
        ...prev,
        [productId]: prev[productId]?.map(entry => 
          entry.id === entryId ? { ...entry, status: newStatus } : entry
        ) || []
      }));
      
    } catch (err) {
      console.error('Error updating waitlist status:', err);
      alert('Error updating status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'notified': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'converted': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Waitlists">
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
      <AdminLayout title="Waitlists">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  const currentWaitlist = waitlistData[selectedProduct] || [];

  return (
    <>
      <Head>
        <title>LD Admin - Waitlists</title>
        <meta name="description" content="Waitlist management for all products" />
      </Head>

      <AdminLayout title="Waitlists">
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

        {/* Waitlist Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <div className="text-sm font-medium opacity-90">Waiting</div>
            <div className="text-3xl font-bold">
              {currentWaitlist.filter(entry => entry.status === 'waiting').length}
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="text-sm font-medium opacity-90">Notified</div>
            <div className="text-3xl font-bold">
              {currentWaitlist.filter(entry => entry.status === 'notified').length}
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="text-sm font-medium opacity-90">Converted</div>
            <div className="text-3xl font-bold">
              {currentWaitlist.filter(entry => entry.status === 'converted').length}
            </div>
          </div>
        </div>

        {/* Waitlist Entries */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Waitlist Entries - {selectedProduct.charAt(0).toUpperCase() + selectedProduct.slice(1)}
          </h3>
          
          {currentWaitlist.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No waitlist entries found for this product.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentWaitlist.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.projectId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                 <select
                           value={entry.status}
                           onChange={(e) => handleStatusUpdate(entry.projectId, entry.id, e.target.value as any)}
                           className="text-xs border border-gray-300 rounded px-2 py-1"
                         >
                          <option value="waiting">Waiting</option>
                          <option value="notified">Notified</option>
                          <option value="converted">Converted</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
