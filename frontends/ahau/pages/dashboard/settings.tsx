import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardNav from '../../components/DashboardNav';
import { useAuthCtx } from '../../context/AuthContext';
import { apiPost } from '../../lib/api-fetch';
import { TenantUpdateRequest } from '../../types/ahau';

export default function SettingsPage() {
  const { session, getActiveTenantId } = useAuthCtx();
  const [tenantName, setTenantName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tenantId = getActiveTenantId();
  const isAdmin = session?.role === 'admin';

  useEffect(() => {
    if (session?.tenantId) {
      setTenantName(session.tenantId);
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const updateData: TenantUpdateRequest = {
        tenantId: tenantId!,
        name: tenantName.trim(),
        logoUrl: logoUrl.trim() || undefined
      };

      await apiPost('/tenant.update', updateData);
      setSuccess('Settings updated successfully!');
    } catch (error: any) {
      console.error('Error updating settings:', error);
      setError(error.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!tenantId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-ahau-blue via-ahau-dark to-black">
          <DashboardNav />
          <div className="max-w-7xl mx-auto p-6">
            <div className="card">
              <p className="text-white">No active tenant found.</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-ahau-blue via-ahau-dark to-black">
        <DashboardNav />
        
        <div className="max-w-4xl mx-auto p-6">
          <div className="card">
            <h1 className="text-2xl font-semibold text-white mb-6">Workspace Settings</h1>

            {!isAdmin && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-400 mb-6">
                <p className="font-medium">Admin Access Required</p>
                <p className="text-sm mt-1">Only workspace administrators can modify these settings.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="form-input"
                  placeholder="Enter workspace name"
                  disabled={!isAdmin}
                  required
                />
                <p className="text-gray-400 text-sm mt-1">
                  This name will be displayed throughout the application
                </p>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="form-input"
                  placeholder="https://example.com/logo.png"
                  disabled={!isAdmin}
                />
                <p className="text-gray-400 text-sm mt-1">
                  URL to your workspace logo image
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!isAdmin || loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Workspace Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Workspace ID</p>
                  <p className="text-white font-mono text-sm">{tenantId}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Your Role</p>
                  <p className="text-white capitalize">{session?.role || 'user'}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Your Email</p>
                  <p className="text-white">{session?.email || 'N/A'}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Member Since</p>
                  <p className="text-white">Recently</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
