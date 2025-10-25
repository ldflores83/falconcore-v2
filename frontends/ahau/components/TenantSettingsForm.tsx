import React, { useState, useEffect } from 'react';
import { apiGet, apiFetch } from '../lib/api-fetch';

interface TenantSettings {
  tenantName: string;
  logoUrl?: string;
  primaryTopic: string;
  about?: string;
}

interface TenantSettingsFormProps {
  tenantId: string;
  isAdmin: boolean;
}

export default function TenantSettingsForm({ tenantId, isAdmin }: TenantSettingsFormProps) {
  const [settings, setSettings] = useState<TenantSettings>({
    tenantName: '',
    logoUrl: '',
    primaryTopic: '',
    about: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, [tenantId]);

  const loadSettings = async () => {
    try {
      const response = await apiGet(`/tenants/${tenantId}/settings`);
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiFetch(`/tenants/${tenantId}/settings`, {
        method: 'PUT',
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Configuración actualizada exitosamente');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Error al actualizar la configuración');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Error al actualizar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof TenantSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-300">
              Acceso Restringido
            </h3>
            <p className="text-sm text-yellow-200 mt-1">
              Solo los administradores pueden modificar la configuración del workspace.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Configuración del Workspace</h2>
        <p className="text-gray-300 mt-2 text-sm sm:text-base">
          Personaliza la información y configuración de tu workspace
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4 text-red-300 text-sm sm:text-base">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3 sm:p-4 text-green-300 text-sm sm:text-base">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Nombre del Workspace *
          </label>
          <input
            type="text"
            value={settings.tenantName}
            onChange={(e) => handleInputChange('tenantName', e.target.value)}
            required
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ahau-gold focus:border-transparent text-white placeholder-white/60 text-sm sm:text-base"
            placeholder="Nombre de tu empresa o proyecto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            URL del Logo
          </label>
          <input
            type="url"
            value={settings.logoUrl || ''}
            onChange={(e) => handleInputChange('logoUrl', e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ahau-gold focus:border-transparent text-white placeholder-white/60 text-sm sm:text-base"
            placeholder="https://ejemplo.com/logo.png"
          />
          <p className="text-sm text-gray-400 mt-1">
            URL de la imagen del logo de tu empresa
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Tema Principal *
          </label>
          <input
            type="text"
            value={settings.primaryTopic}
            onChange={(e) => handleInputChange('primaryTopic', e.target.value)}
            required
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ahau-gold focus:border-transparent text-white placeholder-white/60 text-sm sm:text-base"
            placeholder="Ej: Tecnología, Marketing, Salud, Educación"
          />
          <p className="text-sm text-gray-400 mt-1">
            Este tema se usará para generar contenido más relevante
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Acerca de
          </label>
          <textarea
            value={settings.about || ''}
            onChange={(e) => handleInputChange('about', e.target.value)}
            rows={4}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ahau-gold focus:border-transparent text-white placeholder-white/60 text-sm sm:text-base"
            placeholder="Descripción breve de tu empresa o proyecto"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-ahau-gold text-ahau-dark font-semibold py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:bg-ahau-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
