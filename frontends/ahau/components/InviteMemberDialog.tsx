import React, { useState } from 'react';
import { apiPost } from '../lib/api-fetch';

interface InviteMemberDialogProps {
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteMemberDialog({ tenantId, isOpen, onClose, onSuccess }: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('El email es requerido');
      return;
    }

    setIsInviting(true);
    setError('');

    try {
      const response = await apiPost(`/tenants/${tenantId}/members/invite`, {
        email: email.trim(),
        role
      });

      if (response.success) {
        setEmail('');
        setRole('member');
        onSuccess();
        onClose();
      } else {
        setError('Error al invitar al miembro');
      }
    } catch (err) {
      console.error('Error inviting member:', err);
      setError('Error al invitar al miembro. Intenta nuevamente.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleClose = () => {
    if (!isInviting) {
      setEmail('');
      setRole('member');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Invitar Miembro
          </h3>
          <button
            onClick={handleClose}
            disabled={isInviting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 text-red-700 text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isInviting}
              className="w-full p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm sm:text-base"
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
              disabled={isInviting}
              className="w-full p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm sm:text-base"
            >
              <option value="member">Miembro</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Los administradores pueden gestionar el workspace y sus miembros
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isInviting}
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isInviting || !email.trim()}
              className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
              {isInviting ? 'Enviando...' : 'Enviar Invitación'}
            </button>
          </div>
        </form>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs sm:text-sm text-blue-700">
                <strong>Nota:</strong> La invitación se enviará por email. El usuario podrá aceptarla cuando inicie sesión.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
