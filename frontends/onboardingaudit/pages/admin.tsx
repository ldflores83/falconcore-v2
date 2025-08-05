import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

interface Submission {
  id: string;
  email: string;
  productName: string;
  productUrl: string;
  targetUser: string;
  mainGoal: string;
  createdAt: string;
  status: 'pending' | 'synced' | 'in_progress' | 'completed';
  folderId?: string;
}

export default function AdminPanel() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'submissions' | 'analytics'>('submissions');
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Verificar autenticación usando URL del dominio principal
      const authResponse = await fetch('https://uaylabs.web.app/onboardingaudit/api/auth/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'onboardingaudit',
          userId: 'luisdaniel883@gmail.com_onboardingaudit'
        })
      });

      if (!authResponse.ok) {
        const authError = await authResponse.json();
        console.log('❌ Auth check failed:', authError);
        
        if (authError.requiresLogin) {
          // Redirigir al login si requiere autenticación
          router.push('/onboardingaudit/login');
          return;
        } else {
          setError('Access denied. Only authorized administrators can view this panel.');
          setIsLoading(false);
          return;
        }
      }

      const authData = await authResponse.json();
      
      if (authData.email !== 'luisdaniel883@gmail.com') {
        setError('Access denied. Only authorized administrators can view this panel.');
        setIsLoading(false);
        return;
      }

      setUserEmail(authData.email);

      // Cargar datos de formularios usando URL del dominio principal
      const submissionsResponse = await fetch('https://uaylabs.web.app/onboardingaudit/api/admin/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'onboardingaudit',
          userId: 'luisdaniel883@gmail.com_onboardingaudit'
        })
      });

      if (submissionsResponse.ok) {
        const data = await submissionsResponse.json();
        setSubmissions(data.submissions || []);
        setPendingCount(data.pendingCount || 0);
      } else {
        setError('Error loading submissions data.');
      }
    } catch (error) {
      setError('Authentication failed. Please login again.');
      router.push('/onboardingaudit/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('https://uaylabs.web.app/onboardingaudit/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'onboardingaudit',
          userId: 'luisdaniel883@gmail.com_onboardingaudit'
        })
      });
      router.push('/onboardingaudit/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleStatusUpdate = async (submissionId: string, newStatus: string) => {
    try {
      const response = await fetch('https://uaylabs.web.app/onboardingaudit/api/admin/updateSubmissionStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'onboardingaudit',
          userId: 'luisdaniel883@gmail.com_onboardingaudit',
          submissionId,
          newStatus
        })
      });

      if (response.ok) {
        // Recargar datos después de actualizar estado
        await checkAuthAndLoadData();
      } else {
        setError('Error updating submission status.');
      }
    } catch (error) {
      console.error('Status update error:', error);
      setError('Failed to update submission status.');
    }
  };

  const handleProcessSubmissions = async () => {
    try {
      setError('');
      const response = await fetch('https://uaylabs.web.app/onboardingaudit/api/admin/processSubmissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'onboardingaudit',
          userId: 'luisdaniel883@gmail.com_onboardingaudit'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Submissions processed:', result);
        // Recargar datos después de procesar
        await checkAuthAndLoadData();
      } else {
        const errorData = await response.json();
        setError(`Error processing submissions: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Process submissions error:', error);
      setError('Failed to process submissions.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', text: 'Pending' },
      synced: { color: 'bg-purple-500', text: 'Synced' },
      in_progress: { color: 'bg-blue-500', text: 'In Progress' },
      completed: { color: 'bg-green-500', text: 'Completed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <Head>
        <title>Admin Panel - Onboarding Audit</title>
        <meta name="description" content="Administration panel for Onboarding Audit submissions" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Onboarding Audit Admin</h1>
            <p className="text-gray-300">Manage audit submissions and track analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">
              Logged in as: <span className="text-white font-medium">{userEmail}</span>
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary text-sm px-4 py-2"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'submissions'
                ? 'bg-white text-gray-900'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white text-gray-900'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Analytics
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'submissions' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="card text-center">
                <div className="text-2xl font-bold text-white">{submissions.length}</div>
                <div className="text-sm text-gray-300">Total Submissions</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {pendingCount}
                </div>
                <div className="text-sm text-gray-300">Pending</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {submissions.filter(s => s.status === 'synced').length}
                </div>
                <div className="text-sm text-gray-300">Synced</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {submissions.filter(s => s.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-300">In Progress</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-400">
                  {submissions.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-300">Completed</div>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Audit Submissions</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={handleProcessSubmissions}
                    disabled={pendingCount === 0}
                    className="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Process Pending ({pendingCount})
                  </button>
                  <button
                    onClick={checkAuthAndLoadData}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Refresh
                  </button>
                </div>
              </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-300">No submissions found</p>
              <p className="text-sm text-gray-400 mt-2">Audit submissions will appear here once users submit their forms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-white font-medium">User</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Product</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Target User</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Goal</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="border-b border-gray-600/30 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-white font-medium">{submission.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-white font-medium">{submission.productName}</div>
                          <div className="text-sm text-gray-400 truncate max-w-xs">
                            <a href={submission.productUrl} target="_blank" rel="noopener noreferrer" 
                               className="hover:text-blue-300 transition-colors">
                              {submission.productUrl}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{submission.targetUser}</td>
                      <td className="py-3 px-4 text-gray-300">{submission.mainGoal}</td>
                      <td className="py-3 px-4">{getStatusBadge(submission.status)}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-400 hover:text-blue-300 text-sm"
                            onClick={() => window.open(submission.folderId ? `https://drive.google.com/drive/folders/${submission.folderId}` : '#', '_blank')}
                          >
                            View Files
                          </button>
                          {submission.status === 'pending' && (
                            <button
                              className="text-purple-400 hover:text-purple-300 text-sm"
                              onClick={() => handleStatusUpdate(submission.id, 'synced')}
                            >
                              Mark Synced
                            </button>
                          )}
                          {submission.status === 'synced' && (
                            <button
                              className="text-yellow-400 hover:text-yellow-300 text-sm"
                              onClick={() => handleStatusUpdate(submission.id, 'in_progress')}
                            >
                              Start Work
                            </button>
                          )}
                          {submission.status === 'in_progress' && (
                            <button
                              className="text-green-400 hover:text-green-300 text-sm"
                              onClick={() => handleStatusUpdate(submission.id, 'completed')}
                            >
                              Mark Complete
                            </button>
                          )}
                          {submission.status === 'completed' && (
                            <span className="text-green-400 text-sm">✓ Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
      ) : (
        <AnalyticsDashboard projectId="onboardingaudit" />
      )}

      {/* Footer */}
      <div className="text-center mt-8">
        <a 
          href="/onboardingaudit" 
          className="text-gray-300 hover:text-white transition-colors text-sm"
        >
          ← Back to Audit Form
        </a>
      </div>
      </div>
    </div>
  );
} 