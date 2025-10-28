import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardNav from '../../components/DashboardNav';
import { useAuthCtx } from '../../context/AuthContext';
import { apiGet, apiPost } from '../../lib/api-fetch';
import { Draft, DraftCreateRequest } from '../../types/ahau';

export default function ContentPage() {
  const { session, getActiveTenantId } = useAuthCtx();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const tenantId = getActiveTenantId();

  useEffect(() => {
    if (tenantId) {
      loadDrafts();
    }
  }, [tenantId]);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/drafts.list?tenantId=${tenantId}`);
      setDrafts(response.data || []);
    } catch (error) {
      console.error('Error loading drafts:', error);
      setError('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setCreating(true);
      setError('');
      setSuccess('');

      const draftData: DraftCreateRequest = {
        tenantId: tenantId!,
        title: title.trim(),
        content: content.trim()
      };

      await apiPost('/drafts.create', draftData);
      setTitle('');
      setContent('');
      setShowCreateModal(false);
      setSuccess('Draft created successfully!');
      await loadDrafts(); // Reload drafts list
    } catch (error: any) {
      console.error('Error creating draft:', error);
      setError(error.message || 'Failed to create draft');
    } finally {
      setCreating(false);
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
        
        <div className="max-w-7xl mx-auto p-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-white">Content Drafts</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Draft
              </button>
            </div>

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

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-ahau-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300">Loading drafts...</p>
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-white mb-2">No drafts yet</h3>
                <p className="text-gray-400 mb-6">Create your first content draft to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Your First Draft
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drafts.map((draft) => (
                  <div key={draft.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
                    <h3 className="text-white font-semibold mb-2 line-clamp-2">
                      {draft.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                      {draft.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>By {draft.createdBy}</span>
                      <span>
                        {draft.createdAt ? new Date(draft.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Draft Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white">Create New Draft</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Write your content draft
                </p>
              </div>

              <form onSubmit={handleCreateDraft} className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input"
                    placeholder="Enter draft title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="form-input min-h-[200px] resize-y"
                    placeholder="Write your content here..."
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 btn-secondary"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={creating || !title.trim() || !content.trim()}
                  >
                    {creating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Draft'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
