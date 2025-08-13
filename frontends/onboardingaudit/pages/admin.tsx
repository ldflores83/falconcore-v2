import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Suspense } from 'react';

// Lazy load AnalyticsDashboard
const AnalyticsDashboard = React.lazy(() => import('../components/AnalyticsDashboard'));

// Loading component for AnalyticsDashboard
const AnalyticsLoading = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

// Memoized StatusBadge component
const StatusBadge = React.memo(({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'synced':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
      {status}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    error: 0
  });
  const router = useRouter();

  // Memoized constants
  const maxFileSize = useMemo(() => 10 * 1024 * 1024, []); // 10MB
  const maxIndividualSize = useMemo(() => 5 * 1024 * 1024, []); // 5MB

  // Memoized auth body - Generate clientId dynamically
  const authBody = useMemo(() => {
    // Generate clientId dynamically based on the authenticated user
    // This will be updated after successful authentication
    return {
      projectId: 'onboardingaudit',
      clientId: undefined // Will be set dynamically after OAuth
    };
  }, []);

  // State to store the authenticated user's clientId
  const [userClientId, setUserClientId] = useState<string | null>(null);

  // Memoized stats
  const memoizedStats = useMemo(() => stats, [stats]);

              const checkAuthAndLoadData = useCallback(async () => {
     try {
       // Extraer token de sesión de la URL si existe
       const urlParams = new URLSearchParams(window.location.search);
       const sessionToken = urlParams.get('token');
       
       // Limpiar la URL después de extraer el token
       if (sessionToken) {
         window.history.replaceState({}, document.title, window.location.pathname);
       }

       // Si tenemos un sessionToken, intentar autenticación con sesión
       if (sessionToken) {
         const requestBody = {
           projectId: 'onboardingaudit',
           sessionToken: sessionToken
         };
        
        const authResponse = await fetch('https://api-fu54nvsqfa-uc.a.run.app/api/auth/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          if (authData.success) {
            setIsAuthenticated(true);
            // Store the user's email for future reference
            const clientId = authData.clientId || 'e34cada489125b06714195f25d820e3da84333c4166548bba77e1952e05a6912';
            setUserClientId(clientId);
          
            // Cargar submissions usando el clientId que acabamos de recibir
            const submissionsResponse = await fetch('https://api-fu54nvsqfa-uc.a.run.app/api/admin/submissions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                projectId: 'onboardingaudit',
                clientId: clientId
              })
            });

            if (submissionsResponse.ok) {
              const submissionsData = await submissionsResponse.json();
              setSubmissions(submissionsData.submissions || []);
              
              // Calcular stats
              const total = submissionsData.submissions?.length || 0;
              const pending = submissionsData.submissions?.filter((s: any) => s.status === 'pending').length || 0;
              const synced = submissionsData.submissions?.filter((s: any) => s.status === 'synced').length || 0;
              const inProgress = submissionsData.submissions?.filter((s: any) => s.status === 'in_progress').length || 0;
              const completed = submissionsData.submissions?.filter((s: any) => s.status === 'completed').length || 0;
              const error = submissionsData.submissions?.filter((s: any) => s.status === 'error').length || 0;
              
              setStats({ total, pending, completed: completed + inProgress, error });
            }
          } else {
            setIsAuthenticated(false);
            router.push('/onboardingaudit/login');
          }
        } else {
          setIsAuthenticated(false);
          router.push('/onboardingaudit/login');
        }
      } else {
        setIsAuthenticated(false);
        router.push('/onboardingaudit/login');
      }
    } catch (error) {
      setError('Authentication failed. Please login again.');
      setIsAuthenticated(false);
      router.push('/onboardingaudit/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('https://api-fu54nvsqfa-uc.a.run.app/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'onboardingaudit',
          clientId: userClientId || 'e34cada489125b06714195f25d820e3da84333c4166548bba77e1952e05a6912'
        })
      });
    } catch (error) {
      // Silent fail for logout
    } finally {
      setIsAuthenticated(false);
      router.push('/onboardingaudit/login');
    }
  }, [router, userClientId]);

  // Función separada para recargar solo los datos sin verificar autenticación
  const reloadSubmissionsData = useCallback(async () => {
    try {
      const clientId = userClientId || 'e34cada489125b06714195f25d820e3da84333c4166548bba77e1952e05a6912';
      
      const submissionsResponse = await fetch('https://api-fu54nvsqfa-uc.a.run.app/api/admin/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'onboardingaudit',
          clientId: clientId
        })
      });

      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData.submissions || []);
        
        // Calcular stats
        const total = submissionsData.submissions?.length || 0;
        const pending = submissionsData.submissions?.filter((s: any) => s.status === 'pending').length || 0;
        const synced = submissionsData.submissions?.filter((s: any) => s.status === 'synced').length || 0;
        const inProgress = submissionsData.submissions?.filter((s: any) => s.status === 'in_progress').length || 0;
        const completed = submissionsData.submissions?.filter((s: any) => s.status === 'completed').length || 0;
        const error = submissionsData.submissions?.filter((s: any) => s.status === 'error').length || 0;
        
        setStats({ total, pending, completed: completed + inProgress, error });
      }
    } catch (error) {
      console.error('Failed to reload submissions data:', error);
    }
  }, [userClientId]);

  const handleStatusUpdate = useCallback(async (submissionId: string, newStatus: string) => {
    try {
      const response = await fetch('https://api-fu54nvsqfa-uc.a.run.app/api/admin/updateSubmissionStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'onboardingaudit',
          clientId: userClientId || 'e34cada489125b06714195f25d820e3da84333c4166548bba77e1952e05a6912',
          submissionId,
          newStatus
        })
      });

      if (response.ok) {
        // Recargar solo los datos, no verificar autenticación
        await reloadSubmissionsData();
      }
    } catch (error) {
      setError('Failed to update status');
    }
  }, [reloadSubmissionsData, userClientId]);

  const handleProcessSubmissions = useCallback(async () => {
    try {
      const response = await fetch('https://api-fu54nvsqfa-uc.a.run.app/api/admin/processSubmissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'onboardingaudit',
          clientId: userClientId || 'e34cada489125b06714195f25d820e3da84333c4166548bba77e1952e05a6912'
        })
      });

      if (response.ok) {
        // Recargar solo los datos, no verificar autenticación
        await reloadSubmissionsData();
      }
    } catch (error) {
      setError('Failed to process submissions');
    }
  }, [reloadSubmissionsData, userClientId]);

  const handleCleanupSessions = useCallback(async () => {
    try {
      const response = await fetch('https://api-fu54nvsqfa-uc.a.run.app/api/admin/cleanupSessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'onboardingaudit',
          clientId: userClientId || 'e34cada489125b06714195f25d820e3da84333c4166548bba77e1952e05a6912'
        })
      });

      if (response.ok) {
        // Recargar solo los datos, no verificar autenticación
        await reloadSubmissionsData();
      }
    } catch (error) {
      setError('Failed to cleanup sessions');
    }
  }, [reloadSubmissionsData, userClientId]);

  useEffect(() => {
    // Agregar un pequeño delay para asegurar que la URL esté completamente cargada
    const timer = setTimeout(() => {
      checkAuthAndLoadData();
    }, 100); // Solo 100ms de delay

    return () => clearTimeout(timer);
  }, [checkAuthAndLoadData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Admin Panel - Onboarding Audit</title>
        <meta name="description" content="Administrator panel for Onboarding Audit module" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Onboarding Audit Administration</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Submissions</h3>
            <p className="text-3xl font-bold text-blue-600">{memoizedStats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{memoizedStats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{memoizedStats.completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Errors</h3>
            <p className="text-3xl font-bold text-red-600">{memoizedStats.error}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleProcessSubmissions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Process Submissions
          </button>
          <button
            onClick={handleCleanupSessions}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Cleanup Sessions
          </button>
        </div>

        {/* Analytics Dashboard */}
        <Suspense fallback={<AnalyticsLoading />}>
          <AnalyticsDashboard />
        </Suspense>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Submissions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions && submissions.length > 0 ? (
                  submissions.map((submission: any) => (
                    <tr key={submission.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={submission.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={submission.status}
                          onChange={(e) => handleStatusUpdate(submission.id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="synced">Synced to Drive</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="error">Error</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No submissions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 