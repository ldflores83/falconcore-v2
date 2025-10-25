import { useState, useEffect } from 'react';
import DashboardNav from '../components/DashboardNav';
import { useAuthCtx } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import ContentCopilot from '../components/ContentCopilot';
import DraftCard from '../components/DraftCard';
import NotificationsPanel from '../components/NotificationsPanel';
import { apiGet } from '../lib/api-fetch';

interface Draft {
  id: string;
  title: string;
  content: string;
  topic?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  status: string;
  linkedInPostId?: string;
}

interface PostMetrics {
  totalPosts: number;
  totalImpressions: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  posts: Array<{
    id: string;
    draftId: string;
    linkedInId: string;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    createdAt: string;
    isCompanyPage: boolean;
  }>;
}

export default function Dashboard() {
  const { session } = useAuthCtx();
  const [recentDrafts, setRecentDrafts] = useState<Draft[]>([]);
  const [postMetrics, setPostMetrics] = useState<PostMetrics | null>(null);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [draftsError, setDraftsError] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (session?.tenantId) {
      loadRecentDrafts();
      loadPostMetrics();
    }
  }, [session?.tenantId]);

  const loadRecentDrafts = async () => {
    try {
      const response = await apiGet(`/drafts.list?tenantId=${session!.tenantId}&limit=3`);
      if (response.success && response.data) {
        setRecentDrafts(response.data);
      }
    } catch (err) {
      console.error('Error loading recent drafts:', err);
      setDraftsError('Error al cargar los drafts recientes');
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  const loadPostMetrics = async () => {
    try {
      const response = await apiGet('/metrics/posts');
      if (response.success && response.data) {
        setPostMetrics(response.data);
      }
    } catch (err) {
      console.error('Error loading post metrics:', err);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const handleDraftCreated = () => {
    // Refresh recent drafts when a new one is created
    loadRecentDrafts();
  };

  const getLinkedInUrl = (linkedInId: string) => {
    return `https://www.linkedin.com/feed/update/${linkedInId}/`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-ahau-blue via-ahau-dark to-black">
        <DashboardNav onNotificationsClick={() => setIsNotificationsOpen(true)} />
        
        {/* Notifications Panel */}
        <NotificationsPanel 
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
        
        <div className="mx-auto max-w-7xl p-3 sm:p-6">
          {/* Welcome Section */}
          <div className="card max-w-4xl mx-auto mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">
              Hola{session?.displayName ? `, ${session.displayName}` : ''} 👋
            </h1>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Bienvenido a tu dashboard de Ahau. Aquí podrás gestionar tu workspace y acceder a todas las funcionalidades.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4">
                <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Workspace ID</h3>
                <p className="text-gray-400 text-xs sm:text-sm font-mono break-all">{session?.tenantId || 'No asignado'}</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4">
                <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Email</h3>
                <p className="text-gray-400 text-xs sm:text-sm break-all">{session?.email || 'No disponible'}</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4">
                <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Rol</h3>
                <p className="text-gray-400 text-xs sm:text-sm capitalize">{session?.role || 'Usuario'}</p>
              </div>
            </div>
          </div>

          {/* Post Metrics Section */}
          {!isLoadingMetrics && postMetrics && postMetrics.totalPosts > 0 && (
            <div className="card max-w-6xl mx-auto mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Métricas de Posts Publicados</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {postMetrics.totalPosts}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">Posts</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {postMetrics.totalImpressions.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">Impresiones</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {postMetrics.totalLikes.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">Likes</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {postMetrics.totalComments.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">Comentarios</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {postMetrics.totalShares.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">Compartidos</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {postMetrics.avgEngagementRate}%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">Engagement</div>
                </div>
              </div>

              {/* Recent Posts */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Posts Recientes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {postMetrics.posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          {post.isCompanyPage ? 'Empresa' : 'Personal'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{post.impressions}</div>
                          <div className="text-xs text-gray-400">Impresiones</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{post.likes}</div>
                          <div className="text-xs text-gray-400">Likes</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{post.engagementRate}%</div>
                          <div className="text-xs text-gray-400">Engagement</div>
                        </div>
                      </div>
                      
                      <a
                        href={getLinkedInUrl(post.linkedInId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-ahau-gold hover:text-ahau-gold/80 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Ver en LinkedIn
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content Copilot Section */}
          <div className="mb-6 sm:mb-8">
            <ContentCopilot 
              tenantId={session?.tenantId!} 
              onDraftCreated={handleDraftCreated}
            />
          </div>

          {/* Recent Drafts Section */}
          <div className="card max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Drafts Recientes</h2>
              <a 
                href="/drafts" 
                className="text-blue-400 hover:text-blue-300 text-sm font-medium self-start sm:self-center"
              >
                Ver todos →
              </a>
            </div>

            {isLoadingDrafts ? (
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
            ) : draftsError ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-red-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Error al cargar drafts</h3>
                <p className="text-gray-300">{draftsError}</p>
              </div>
            ) : recentDrafts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-white mb-2">No hay drafts recientes</h3>
                <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                  Usa el Content Copilot para crear tu primer draft
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {recentDrafts.map((draft) => (
                  <DraftCard 
                    key={draft.id} 
                    draft={draft}
                    showLinkedInLink={Boolean(draft.status === 'published' && draft.linkedInPostId)}
                    linkedInUrl={draft.linkedInPostId ? getLinkedInUrl(draft.linkedInPostId) : undefined}
                    onPublished={() => {
                      loadRecentDrafts();
                      loadPostMetrics();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
