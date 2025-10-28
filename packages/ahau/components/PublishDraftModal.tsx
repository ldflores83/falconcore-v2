import React, { useState } from 'react';
import { apiPost } from '../lib/api-fetch';
import { useNotifications } from '../context/NotificationsContext';

interface Draft {
  id: string;
  title: string;
  content: string;
  topic?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  status?: string;
  linkedInPostId?: string;
}

interface PublishDraftModalProps {
  draft: Draft;
  isOpen: boolean;
  onClose: () => void;
  onPublished?: () => void;
}

export default function PublishDraftModal({ draft, isOpen, onClose, onPublished }: PublishDraftModalProps) {
  const [isCompanyPage, setIsCompanyPage] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { addNotification } = useNotifications();

  if (!isOpen) return null;

  const handlePublish = async () => {
    if (!draft.status || draft.status !== 'approved') {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Solo se pueden publicar drafts aprobados'
      });
      return;
    }

    setIsPublishing(true);
    try {
      const response = await apiPost('/publish', {
        draftId: draft.id,
        isCompanyPage
      });

      if (response.success) {
        addNotification({
          type: 'success',
          title: '¡Publicado!',
          message: `"${draft.title}" ha sido publicado exitosamente en LinkedIn`
        });
        onPublished?.();
        onClose();
      } else {
        throw new Error(response.error?.message || 'Error al publicar');
      }
    } catch (error) {
      console.error('Error publishing draft:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo publicar el draft. Verifica la configuración de LinkedIn.'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Publicar en LinkedIn</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{draft.title}</h3>
            <p className="text-gray-300 text-sm line-clamp-3">{draft.content}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Configuración de publicación</h4>
            
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="personal"
                name="pageType"
                checked={!isCompanyPage}
                onChange={() => setIsCompanyPage(false)}
                className="text-ahau-gold focus:ring-ahau-gold"
              />
              <label htmlFor="personal" className="text-white text-sm">
                Perfil personal
              </label>
            </div>
            
            <div className="flex items-center space-x-3 mt-2">
              <input
                type="radio"
                id="company"
                name="pageType"
                checked={isCompanyPage}
                onChange={() => setIsCompanyPage(true)}
                className="text-ahau-gold focus:ring-ahau-gold"
              />
              <label htmlFor="company" className="text-white text-sm">
                Página de empresa
              </label>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-blue-300 font-medium text-sm">Importante</h4>
                <p className="text-blue-200 text-sm mt-1">
                  Asegúrate de que tu cuenta de LinkedIn esté configurada correctamente en la configuración del tenant.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            disabled={isPublishing}
          >
            Cancelar
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing || draft.status !== 'approved'}
            className="bg-ahau-gold text-ahau-dark font-semibold px-4 py-2 rounded-lg hover:bg-ahau-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isPublishing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Publicando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>Publicar en LinkedIn</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
