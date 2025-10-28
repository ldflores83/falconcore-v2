import React, { useState, useEffect } from 'react';
import { useAuthCtx } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardNav from '../components/DashboardNav';
import { apiGet, apiPost } from '../lib/api-fetch';

interface Template {
  id: string;
  name: string;
  description: string;
  blocks: string[];
  createdAt: string;
  createdBy: string;
}

export default function TemplatesPage() {
  const { session } = useAuthCtx();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (session?.tenantId) {
      loadTemplates();
    }
  }, [session?.tenantId]);

  const loadTemplates = async () => {
    try {
      const response = await apiGet(`/tenants/${session!.tenantId}/templates`);
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Error al cargar las plantillas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData: Omit<Template, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      const response = await apiPost(`/tenants/${session!.tenantId}/templates`, templateData);
      if (response.success) {
        setIsCreateModalOpen(false);
        loadTemplates();
      }
    } catch (err) {
      console.error('Error creating template:', err);
      setError('Error al crear la plantilla');
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Plantillas de Posts</h1>
            <p className="text-gray-300 mt-2 text-sm sm:text-base">
              Gestiona las estructuras de posts para generar contenido consistente
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
              <span>Crear Plantilla</span>
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
        ) : templates.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-2">No hay plantillas</h3>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Crea tu primera plantilla para estructurar la generación de contenido
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-ahau-gold text-ahau-dark font-semibold py-3 px-6 rounded-xl hover:bg-ahau-gold/90 transition-colors"
              >
                Crear Primera Plantilla
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-white font-semibold text-lg mb-2">{template.name}</h3>
                  <p className="text-gray-300 text-sm">{template.description}</p>
                </div>

                <div>
                  <h4 className="text-white font-medium text-sm mb-2">Estructura</h4>
                  <div className="space-y-2">
                    {template.blocks.map((block, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-ahau-gold text-xs font-mono mr-2">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-gray-300 text-sm">{block}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Bloques: {template.blocks.length}</span>
                    <span>Creado: {new Date(template.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Template Modal */}
        {isCreateModalOpen && (
          <CreateTemplateModal
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateTemplate}
          />
        )}
      </div>
    </div>
  );
}

// Create Template Modal Component
function CreateTemplateModal({ onClose, onSubmit }: { 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    blocks: ['Hook', 'Insight', 'Example', 'CTA']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addBlock = () => {
    setFormData({
      ...formData,
      blocks: [...formData.blocks, '']
    });
  };

  const removeBlock = (index: number) => {
    if (formData.blocks.length > 1) {
      setFormData({
        ...formData,
        blocks: formData.blocks.filter((_, i) => i !== index)
      });
    }
  };

  const updateBlock = (index: number, value: string) => {
    const newBlocks = [...formData.blocks];
    newBlocks[index] = value;
    setFormData({
      ...formData,
      blocks: newBlocks
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Crear Plantilla</h2>
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
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-ahau-gold"
              placeholder="Ej: Opinión + Mini-case"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-ahau-gold"
              placeholder="Describe el propósito y uso de esta plantilla"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-white font-medium">Bloques de Estructura</label>
              <button
                type="button"
                onClick={addBlock}
                className="text-ahau-gold hover:text-ahau-gold/80 text-sm"
              >
                + Agregar bloque
              </button>
            </div>
            <div className="space-y-2">
              {formData.blocks.map((block, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-ahau-gold text-xs font-mono w-6">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <input
                    type="text"
                    value={block}
                    onChange={(e) => updateBlock(index, e.target.value)}
                    required
                    className="flex-1 p-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-ahau-gold text-sm"
                    placeholder="Ej: Hook, Insight, Example, CTA"
                  />
                  {formData.blocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
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
              Crear Plantilla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
