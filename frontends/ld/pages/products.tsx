import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../components/Layout/AdminLayout';
import { Product, ProductStats } from '../types/admin';
import adminAPI from '../lib/api';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productStats, setProductStats] = useState<Record<string, ProductStats>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const productsList = await adminAPI.getProducts();
        setProducts(productsList);
        
        // Cargar estadísticas para cada producto
        const stats: Record<string, ProductStats> = {};
        for (const product of productsList) {
          try {
            const productStat = await adminAPI.getProductStats(product.id);
            stats[product.id] = productStat;
          } catch (err) {
            console.error(`Error loading stats for ${product.id}:`, err);
          }
        }
        setProductStats(stats);
        
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Error loading products');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'development':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paused':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Productos">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Productos">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>LD Admin - Productos</title>
        <meta name="description" content="Gestión de productos del dashboard centralizado" />
      </Head>

      <AdminLayout title="Productos">
        <div className="space-y-6">
          {products.map((product) => {
            const stats = productStats[product.id];
            return (
              <div key={product.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-gray-600 mt-1">{product.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>ID: {product.id}</span>
                      <span>Creado: {new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </div>

                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-ld-primary">{stats.totalVisits}</div>
                      <div className="text-sm text-gray-500">Visitas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-ld-success">{stats.totalSubmissions}</div>
                      <div className="text-sm text-gray-500">Submissions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-ld-warning">{stats.totalWaitlist}</div>
                      <div className="text-sm text-gray-500">Waitlist</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-ld-secondary">{stats.conversionRate}%</div>
                      <div className="text-sm text-gray-500">Conversión</div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                  <button className="btn-primary text-sm">
                    Ver Analytics
                  </button>
                  <button className="btn-secondary text-sm">
                    Gestionar Waitlist
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors">
                    Configurar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </AdminLayout>
    </>
  );
}
