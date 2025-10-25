import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../lib/api-fetch';

interface ContentCopilotProps {
  tenantId: string;
  primaryTopic?: string;
  onDraftCreated?: () => void;
}

interface ToneProfile {
  id: string;
  displayName: string;
  role: string;
  tone: {
    clarity: number;
    warmth: number;
    energy: number;
    sobriety: number;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  blocks: string[];
}

export default function ContentCopilot({ tenantId, primaryTopic, onDraftCreated }: ContentCopilotProps) {
  const [prompt, setPrompt] = useState('');
  const [topic, setTopic] = useState(primaryTopic || '');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [profiles, setProfiles] = useState<ToneProfile[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfiles();
    loadTemplates();
  }, [tenantId]);

  const loadProfiles = async () => {
    try {
      const response = await apiGet(`/tenants/${tenantId}/profiles`);
      if (response.success && response.data) {
        setProfiles(response.data);
      }
    } catch (err) {
      console.error('Error loading profiles:', err);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await apiGet(`/tenants/${tenantId}/templates`);
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Por favor ingresa un prompt para generar contenido');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedContent('');

    try {
      const response = await apiPost('/content/generate', {
        tenantId,
        prompt: prompt.trim(),
        topic: topic || primaryTopic,
        profileId: selectedProfileId || undefined,
        templateId: selectedTemplateId || undefined
      });

      if (response.success && response.data?.text) {
        setGeneratedContent(response.data.text);
      } else {
        setError('Error al generar contenido');
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Error al generar contenido. Intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedContent.trim()) return;

    try {
      const response = await apiPost('/drafts.create', {
        tenantId,
        title: `Post generado: ${prompt.substring(0, 50)}...`,
        content: generatedContent,
        ownerProfileId: selectedProfileId || null
      });

      if (response.success) {
        // Show success message and notify parent
        alert('Draft guardado exitosamente');
        if (onDraftCreated) {
          onDraftCreated();
        }
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      alert('Error al guardar el draft');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('Contenido copiado al portapapeles');
  };

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">🤖 Content Copilot</h2>
        <p className="text-blue-100 mb-4 sm:mb-6 text-sm sm:text-base">
          Genera posts profesionales para LinkedIn con IA
        </p>
        
        <div className="space-y-3 sm:space-y-4">
          {/* Profile Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Perfil de Tono
            </label>
            {isLoadingProfiles ? (
              <div className="w-full p-3 bg-white/10 border border-white/20 rounded-lg animate-pulse">
                <div className="h-4 bg-white/20 rounded"></div>
              </div>
            ) : (
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full p-3 rounded-lg sm:rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
              >
                <option value="">Seleccionar perfil (opcional)</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.displayName} - {profile.role}
                  </option>
                ))}
              </select>
            )}
            {selectedProfile && (
              <div className="mt-2 p-2 bg-white/10 rounded text-xs">
                <div className="flex justify-between">
                  <span>Tono: Clarity {selectedProfile.tone.clarity}, Warmth {selectedProfile.tone.warmth}, Energy {selectedProfile.tone.energy}, Sobriety {selectedProfile.tone.sobriety}</span>
                </div>
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Plantilla
            </label>
            {isLoadingTemplates ? (
              <div className="w-full p-3 bg-white/10 border border-white/20 rounded-lg animate-pulse">
                <div className="h-4 bg-white/20 rounded"></div>
              </div>
            ) : (
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full p-3 rounded-lg sm:rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
              >
                <option value="">Seleccionar plantilla (opcional)</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            )}
            {selectedTemplate && (
              <div className="mt-2 p-2 bg-white/10 rounded text-xs">
                <div className="text-white/80 mb-1">{selectedTemplate.description}</div>
                <div className="text-white/60">
                  Estructura: {selectedTemplate.blocks.join(' → ')}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: Genera un post sobre innovación en tecnología"
              className="w-full p-3 rounded-lg sm:rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tema (opcional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={primaryTopic || "Tema de tu empresa"}
              className="w-full p-3 rounded-lg sm:rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-white text-blue-600 font-semibold py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            {isGenerating ? 'Generando...' : 'Generar Contenido'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4 text-red-300 text-sm sm:text-base">
          {error}
        </div>
      )}

      {generatedContent && (
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Contenido Generado</h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                📋 Copiar
              </button>
              <button
                onClick={handleSaveDraft}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                💾 Guardar Draft
              </button>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <div 
              className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: generatedContent.replace(/\n/g, '<br/>') }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
