import React, { useState } from 'react';
import PublishDraftModal from './PublishDraftModal';

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

interface DraftCardProps {
  draft: Draft;
  onEdit?: (draft: Draft) => void;
  onDelete?: (draftId: string) => void;
  showLinkedInLink?: boolean;
  linkedInUrl?: string;
  onPublished?: () => void;
}

export default function DraftCard({ draft, onEdit, onDelete, showLinkedInLink, linkedInUrl, onPublished }: DraftCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha desconocida';
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft.content);
    alert('Contenido copiado al portapapeles');
  };

  const getStatusBadge = () => {
    if (!draft.status) return null;
    
    const statusConfig = {
      'idea': { label: 'Idea', color: 'bg-gray-500/20 text-gray-300' },
      'draft': { label: 'Draft', color: 'bg-blue-500/20 text-blue-300' },
      'reviewed': { label: 'Revisado', color: 'bg-yellow-500/20 text-yellow-300' },
      'approved': { label: 'Aprobado', color: 'bg-green-500/20 text-green-300' },
      'published': { label: 'Publicado', color: 'bg-purple-500/20 text-purple-300' }
    };

    const config = statusConfig[draft.status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`inline-block px-2 py-1 ${config.color} text-xs font-medium rounded-full`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-colors">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2">
              {draft.title}
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-2 sm:mb-3">
              {draft.topic && (
                <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">
                  {draft.topic}
                </span>
              )}
              {getStatusBadge()}
            </div>
          </div>
          
          <div className="flex space-x-1 sm:space-x-2 ml-2 sm:ml-4 flex-shrink-0">
            {showLinkedInLink && linkedInUrl && (
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 text-ahau-gold hover:text-ahau-gold/80 hover:bg-ahau-gold/10 rounded-lg transition-colors"
                title="Ver en LinkedIn"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
            
            {draft.status === 'approved' && !draft.linkedInPostId && (
              <button
                onClick={() => setIsPublishModalOpen(true)}
                className="p-1.5 sm:p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                title="Publicar en LinkedIn"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            )}
            
            <button
              onClick={handleCopy}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Copiar contenido"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            
            {onEdit && (
              <button
                onClick={() => onEdit(draft)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                title="Editar draft"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => onDelete(draft.id)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Eliminar draft"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="mb-3 sm:mb-4">
          <div className={`text-gray-300 text-sm sm:text-base ${isExpanded ? '' : 'line-clamp-3'}`}>
            {isExpanded ? draft.content : truncateContent(draft.content)}
          </div>
          
          {draft.content.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-ahau-gold hover:text-ahau-gold/80 text-sm font-medium mt-2"
            >
              {isExpanded ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-400 border-t border-white/10 pt-3 sm:pt-4 gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-1">
            <span>📅 {formatDate(draft.createdAt)}</span>
            {draft.updatedAt !== draft.createdAt && (
              <span>✏️ {formatDate(draft.updatedAt)}</span>
            )}
          </div>
          
          <div className="text-xs bg-white/10 px-2 py-1 rounded-full self-start sm:self-center text-white">
            {draft.createdBy}
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      <PublishDraftModal
        draft={draft}
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublished={onPublished}
      />
    </>
  );
}
