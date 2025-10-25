import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardNav from '../../components/DashboardNav';
import { useAuthCtx } from '../../context/AuthContext';
import { apiGet, apiPost } from '../../lib/api-fetch';
import { TenantUser, UserInviteRequest } from '../../types/ahau';

export default function UsersPage() {
  const router = useRouter();
  const { session, getActiveTenantId } = useAuthCtx();
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  const tenantId = getActiveTenantId();
  const isAdmin = session?.role === 'admin';

  useEffect(() => {
    if (tenantId) {
      loadUsers();
    }
  }, [tenantId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/users.list?tenantId=${tenantId}`);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setInviting(true);
      setError('');
      
      const inviteData: UserInviteRequest = {
        tenantId: tenantId!,
        email: inviteEmail.trim()
      };

      await apiPost('/users.invite', inviteData);
      setInviteEmail('');
      setShowInviteModal(false);
      await loadUsers(); // Reload users list
    } catch (error: any) {
      console.error('Error inviting user:', error);
      setError(error.message || 'Failed to invite user');
    } finally {
      setInviting(false);
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
              <h1 className="text-2xl font-semibold text-white">Users</h1>
              {isAdmin && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn-primary"
                >
                  Invite User
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-ahau-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 px-4 text-gray-300 font-medium">Email</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">Role</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">Status</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.uid} className="border-b border-white/5">
                        <td className="py-3 px-4 text-white">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded capitalize ${
                            user.role === 'admin' 
                              ? 'bg-ahau-gold/20 text-ahau-gold' 
                              : 'bg-white/10 text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded capitalize ${
                            user.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {user.addedAt ? new Date(user.addedAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white">Invite User</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Send an invitation to join your workspace
                </p>
              </div>

              <form onSubmit={handleInviteUser} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="form-input"
                  required
                />
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 btn-secondary"
                    disabled={inviting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={inviting || !inviteEmail.trim()}
                  >
                    {inviting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Inviting...
                      </div>
                    ) : (
                      'Send Invitation'
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
