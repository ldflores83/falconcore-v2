import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../components/Layout/AdminLayout';
import { GlobalStats, Product } from '../types/admin';
import adminAPI from '../lib/api';

export default function Dashboard() {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Cargar estadísticas globales
        const stats = await adminAPI.getGlobalStats();
        setGlobalStats(stats);
        
        // Cargar productos
        const productsList = await adminAPI.getProducts();
        setProducts(productsList);
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Error loading dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="animate-pulse space-y-6">
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
      <AdminLayout title="Dashboard">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>LD Admin - Dashboard Centralizado</title>
        <meta name="description" content="Dashboard de administración centralizado para todos los productos de UayLabs" />
      </Head>

      <AdminLayout title="Dashboard">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="text-sm font-medium opacity-90">Total Productos</div>
            <div className="text-3xl font-bold">{globalStats?.totalProducts || 0}</div>
          </div>
          
          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="text-sm font-medium opacity-90">Total Visitas</div>
            <div className="text-3xl font-bold">{globalStats?.totalVisits || 0}</div>
          </div>
          
          <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="text-sm font-medium opacity-90">Total Submissions</div>
            <div className="text-3xl font-bold">{globalStats?.totalSubmissions || 0}</div>
          </div>
          
          <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="text-sm font-medium opacity-90">Total Waitlist</div>
            <div className="text-3xl font-bold">{globalStats?.totalWaitlist || 0}</div>
          </div>
        </div>

        {/* Products Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Activos</h3>
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.description}</div>
                  </div>
                  <span className={`status-badge ${
                    product.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                    product.status === 'development' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {product.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              {globalStats?.recentActivity?.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-2 h-2 bg-ld-primary rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900">{activity.description}</div>
                    <div className="text-xs text-gray-500">{activity.productName}</div>
                    <div className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
