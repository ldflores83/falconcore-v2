import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthCtx } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import MembersTable from '../components/MembersTable';
import InviteMemberDialog from '../components/InviteMemberDialog';
import DashboardNav from '../components/DashboardNav';

export default function MembersPage() {
  const { session } = useAuthCtx();
  const router = useRouter();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  if (!session) {
    return (
      <ProtectedRoute>
        <div>Loading...</div>
      </ProtectedRoute>
    );
  }

  const isAdmin = session.role === 'admin';

  const handleInviteSuccess = () => {
    // Refresh the members list
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ahau-blue via-ahau-dark to-black">
      <DashboardNav />
      
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Miembros</h1>
            <p className="text-gray-300 mt-2 text-sm sm:text-base">
              Gestiona los usuarios y roles de tu workspace
            </p>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => setIsInviteDialogOpen(true)}
              className="bg-ahau-gold text-ahau-dark font-semibold py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:bg-ahau-gold/90 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Invitar Miembro</span>
            </button>
          )}
        </div>

        <MembersTable 
          tenantId={session.tenantId!} 
          isAdmin={isAdmin} 
        />

        <InviteMemberDialog
          tenantId={session.tenantId!}
          isOpen={isInviteDialogOpen}
          onClose={() => setIsInviteDialogOpen(false)}
          onSuccess={handleInviteSuccess}
        />
      </div>
    </div>
  );
}
