import React from 'react';
import { useRouter } from 'next/router';
import { useAuthCtx } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import TenantSettingsForm from '../components/TenantSettingsForm';
import DashboardNav from '../components/DashboardNav';

export default function SettingsPage() {
  const { session } = useAuthCtx();
  const router = useRouter();

  if (!session) {
    return (
      <ProtectedRoute>
        <div>Loading...</div>
      </ProtectedRoute>
    );
  }

  const isAdmin = session.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-ahau-blue via-ahau-dark to-black">
      <DashboardNav />
      
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Configuración</h1>
          <p className="text-gray-300 mt-2 text-sm sm:text-base">
            Gestiona la configuración de tu workspace
          </p>
        </div>

        <TenantSettingsForm 
          tenantId={session.tenantId!} 
          isAdmin={isAdmin} 
        />
      </div>
    </div>
  );
}
