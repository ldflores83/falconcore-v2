import { useState } from 'react';
import { apiPost } from '../lib/auth-api';
import { useRouter } from 'next/router';
import { getRoute } from '../lib/routes';

interface CreateTenantFormProps {
  onCreated: () => void;
}

export default function CreateTenantForm({ onCreated }: CreateTenantFormProps) {
  const [tenantName, setTenantName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenantName.trim()) {
      setError('Por favor ingresa el nombre del workspace');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiPost('/tenants/create', {
        name: tenantName.trim()
      });

      if (response.success) {
        onCreated();
      } else {
        setError(response.error || 'Error al crear el workspace');
      }
    } catch (err) {
      console.error('Error creating tenant:', err);
      setError('Error al crear el workspace. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="tenantName" className="block text-sm font-medium text-white mb-2">
          Nombre del Workspace
        </label>
        <input
          id="tenantName"
          type="text"
          value={tenantName}
          onChange={(e) => setTenantName(e.target.value)}
          required
          disabled={isLoading}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
          placeholder="Mi Empresa"
        />
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-ahau-gold text-ahau-dark font-semibold py-3 px-4 rounded-xl hover:bg-ahau-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Creando...' : 'Crear Workspace'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="text-white/60 hover:text-white text-sm"
        >
          ¿Ya tienes una cuenta? Inicia sesión
        </button>
      </div>
    </form>
  );
}
