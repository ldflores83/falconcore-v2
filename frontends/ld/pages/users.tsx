import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../components/Layout/AdminLayout';
import adminAPI from '../lib/api';

interface User {
  id: string;
  email: string;
  projectId: string;
  role: 'admin' | 'viewer';
  lastLogin: string;
  isActive: boolean;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
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
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Por ahora, datos de ejemplo
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'admin@onboardingaudit.com',
            projectId: 'onboardingaudit',
            role: 'admin',
            lastLogin: new Date().toISOString(),
            isActive: true
          },
          {
            id: '2',
            email: 'viewer@onboardingaudit.com',
            projectId: 'onboardingaudit',
            role: 'viewer',
            lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
            isActive: true
          }
        ];
        
        setUsers(mockUsers.filter(user => user.projectId === selectedProduct));
        
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Error loading users data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [selectedProduct]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'viewer': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <AdminLayout title="Users">
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
      <AdminLayout title="Users">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>LD Admin - Users</title>
        <meta name="description" content="User management for all products" />
      </Head>

      <AdminLayout title="Users">
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

        {/* Users Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="text-sm font-medium opacity-90">Admins</div>
            <div className="text-3xl font-bold">
              {users.filter(user => user.role === 'admin').length}
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="text-sm font-medium opacity-90">Viewers</div>
            <div className="text-3xl font-bold">
              {users.filter(user => user.role === 'viewer').length}
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="text-sm font-medium opacity-90">Active Users</div>
            <div className="text-3xl font-bold">
              {users.filter(user => user.isActive).length}
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Users - {selectedProduct.charAt(0).toUpperCase() + selectedProduct.slice(1)}
            </h3>
            <button className="btn-primary text-sm">
              Add User
            </button>
          </div>
          
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found for this product.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(user.isActive)}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Remove</button>
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
