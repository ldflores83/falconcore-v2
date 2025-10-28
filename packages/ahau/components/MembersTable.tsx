import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../lib/api-fetch';

interface TenantMember {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'member';
  status: 'active' | 'invited';
  createdAt: string;
  createdBy: string;
}

interface MembersTableProps {
  tenantId: string;
  isAdmin: boolean;
}

export default function MembersTable({ tenantId, isAdmin }: MembersTableProps) {
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, [tenantId]);

  const loadMembers = async () => {
    try {
      const response = await apiGet(`/tenants/${tenantId}/members`);
      if (response.success && response.data) {
        setMembers(response.data);
      }
    } catch (err) {
      console.error('Error loading members:', err);
      setError('Error al cargar los miembros');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    setUpdatingRole(memberId);
    setError('');

    try {
      // Use fetch directly for PATCH method since apiPost doesn't support it yet
      const token = await (window as any).firebase?.auth()?.currentUser?.getIdToken();
      const response = await fetch(`/api/ahau/tenants/${tenantId}/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setMembers(prev => prev.map(member => 
          member.id === memberId ? { ...member, role: newRole } : member
        ));
      } else {
        setError('Error al actualizar el rol');
      }
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Error al actualizar el rol');
    } finally {
      setUpdatingRole(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha desconocida';
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    if (role === 'admin') {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
    return `${baseClasses} bg-blue-100 text-blue-800`;
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    if (status === 'active') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Acceso Restringido
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Solo los administradores pueden ver la lista de miembros.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Miembros del Workspace</h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Gestiona los usuarios y roles de tu workspace
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 text-red-700 text-sm sm:text-base">
          {error}
        </div>
      )}

      {members.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <p className="text-sm sm:text-base">No hay miembros en este workspace</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                        {member.displayName || 'Sin nombre'}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-none">
                        {member.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={getRoleBadge(member.role)}>
                      {member.role === 'admin' ? 'Administrador' : 'Miembro'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={getStatusBadge(member.status)}>
                      {member.status === 'active' ? 'Activo' : 'Invitado'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {formatDate(member.createdAt)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    {isAdmin && (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as 'admin' | 'member')}
                        disabled={updatingRole === member.id}
                        className="border border-gray-300 rounded-md px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[80px]"
                      >
                        <option value="member">Miembro</option>
                        <option value="admin">Administrador</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
