import { useState, useEffect } from 'react';
import DashboardNav from '../components/DashboardNav';
import { useAuthCtx } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DraftCard from '../components/DraftCard';
import { apiGet } from '../lib/api-fetch';
import { useRouter } from 'next/router';

interface Draft {
  id: string;
  title: string;
  content: string;
  topic?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export default function DraftsPage() {
  const { session } = useAuthCtx();
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.tenantId) {
      loadDrafts();
    }
  }, [session?.tenantId]);

  const loadDrafts = async () => {
    try {
      const response = await apiGet(`/drafts.list?tenantId=${session!.tenantId}`);
      if (response.success && response.data) {
        setDrafts(response.data);
      }
    } catch (err) {
      console.error('Error loading drafts:', err);
      setError('Error al cargar los drafts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDraft = (draft: Draft) => {
    // TODO: Implementar edición de draft
    console.log('Edit draft:', draft);
  };

  const handleDeleteDraft = async (draftId: string) => {
    // TODO: Implementar eliminación de draft
    console.log('Delete draft:', draftId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ahau-blue via-ahau-dark to-black">
      <DashboardNav />
      
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Drafts</h1>
          <p className="text-gray-300 mt-2 text-sm sm:text-base">
            Gestiona tus borradores de contenido
          </p>
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
        ) : drafts.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-2">No hay drafts</h3>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Crea tu primer draft usando el Content Copilot en el dashboard
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-ahau-gold text-ahau-dark font-semibold py-3 px-6 rounded-xl hover:bg-ahau-gold/90 transition-colors"
            >
              Ir al Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {drafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onEdit={handleEditDraft}
                onDelete={handleDeleteDraft}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
