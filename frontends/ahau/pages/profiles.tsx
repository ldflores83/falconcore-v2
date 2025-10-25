import React, { useState, useEffect } from 'react';
import { useAuthCtx } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardNav from '../components/DashboardNav';
import { apiGet, apiPost, apiFetch } from '../lib/api-fetch';

interface ToneProfile {
  id: string;
  displayName: string;
  role: string;
  avatarUrl?: string;
  tone: {
    clarity: number;
    warmth: number;
    energy: number;
    sobriety: number;
  };
  dos: string[];
  donts: string[];
  samples: string[];
  createdAt: string;
  createdBy: string;
}

export default function ProfilesPage() {
  const { session } = useAuthCtx();
  const [profiles, setProfiles] = useState<ToneProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (session?.tenantId) {
      loadProfiles();
    }
  }, [session?.tenantId]);

  const loadProfiles = async () => {
    try {
      const response = await apiGet(`/tenants/${session!.tenantId}/profiles`);
      if (response.success && response.data) {
        setProfiles(response.data);
      }
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError('Error al cargar los perfiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfile = async (profileData: Omit<ToneProfile, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      const response = await apiPost(`/tenants/${session!.tenantId}/profiles`, profileData);
      if (response.success) {
        setIsCreateModalOpen(false);
        loadProfiles();
      }
    } catch (err) {
      console.error('Error creating profile:', err);
      setError('Error al crear el perfil');
    }
  };

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
      
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Perfiles de Tono</h1>
            <p className="text-gray-300 mt-2 text-sm sm:text-base">
              Gestiona los perfiles de tono para generar contenido personalizado
            </p>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-ahau-gold text-ahau-dark font-semibold py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:bg-ahau-gold/90 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Crear Perfil</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4 text-red-300 text-sm sm:text-base">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 sm:p-6 animate-pulse">
                <div className="h-5 sm:h-6 bg-white/10 rounded w-3/4 mb-3 sm:mb-4"></div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 bg-white/10 rounded"></div>
                  <div className="h-3 sm:h-4 bg-white/10 rounded w-5/6"></div>
                  <div className="h-3 sm:h-4 bg-white/10 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-2">No hay perfiles</h3>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Crea tu primer perfil de tono para personalizar la generación de contenido
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-ahau-gold text-ahau-dark font-semibold py-3 px-6 rounded-xl hover:bg-ahau-gold/90 transition-colors"
              >
                Crear Primer Perfil
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {profiles.map((profile) => (
              <div key={profile.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.displayName} className="w-12 h-12 rounded-full mr-3" />
                  ) : (
                    <div className="w-12 h-12 bg-ahau-gold rounded-full flex items-center justify-center mr-3">
                      <span className="text-ahau-dark font-bold text-lg">
                        {profile.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold text-lg">{profile.displayName}</h3>
                    <p className="text-gray-300 text-sm">{profile.role}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-white font-medium text-sm mb-2">Tono</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Claridad:</span>
                        <span className="text-white">{profile.tone.clarity}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Calidez:</span>
                        <span className="text-white">{profile.tone.warmth}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Energía:</span>
                        <span className="text-white">{profile.tone.energy}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Sobriedad:</span>
                        <span className="text-white">{profile.tone.sobriety}/10</span>
                      </div>
                    </div>
                  </div>

                  {profile.dos.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium text-sm mb-1">Hacer:</h4>
                      <ul className="text-gray-300 text-xs space-y-1">
                        {profile.dos.slice(0, 2).map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-400 mr-1">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {profile.donts.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium text-sm mb-1">No hacer:</h4>
                      <ul className="text-gray-300 text-xs space-y-1">
                        {profile.donts.slice(0, 2).map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-400 mr-1">✗</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Profile Modal */}
        {isCreateModalOpen && (
          <CreateProfileModal
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateProfile}
          />
        )}
      </div>
    </div>
  );
}

// Create Profile Modal Component
function CreateProfileModal({ onClose, onSubmit }: { 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
}) {
  const [formData, setFormData] = useState({
    displayName: '',
    role: '',
    avatarUrl: '',
    tone: { clarity: 5, warmth: 5, energy: 5, sobriety: 5 },
    dos: [''],
    donts: [''],
    samples: ['']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Crear Perfil de Tono</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Nombre</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              required
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-ahau-gold"
              placeholder="Ej: María García"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Rol</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              required
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-ahau-gold"
              placeholder="Ej: CEO, Marketing Manager"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">URL del Avatar (opcional)</label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-ahau-gold"
              placeholder="https://ejemplo.com/avatar.jpg"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Tono</label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.tone).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-gray-300 text-sm mb-1 capitalize">{key}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={value}
                    onChange={(e) => setFormData({
                      ...formData, 
                      tone: {...formData.tone, [key]: parseInt(e.target.value)}
                    })}
                    className="w-full"
                  />
                  <span className="text-white text-sm">{value}/10</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-ahau-gold text-ahau-dark font-semibold px-4 py-2 rounded-lg hover:bg-ahau-gold/90 transition-colors"
            >
              Crear Perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
