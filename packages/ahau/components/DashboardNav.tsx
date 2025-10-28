import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthCtx } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { getAuthClient } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { label: 'Profiles', path: '/profiles', icon: '👤' },
  { label: 'Templates', path: '/templates', icon: '📋' },
  { label: 'Calendar', path: '/calendar', icon: '📅' },
  { label: 'Users', path: '/dashboard/users', icon: '👥' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
  { label: 'Content', path: '/dashboard/content', icon: '📝' },
];

interface DashboardNavProps {
  onNotificationsClick?: () => void;
}

export default function DashboardNav({ onNotificationsClick }: DashboardNavProps) {
  const router = useRouter();
  const { session } = useAuthCtx();
  const { unreadCount } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const auth = await getAuthClient();
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error al cerrar sesión. Intenta nuevamente.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActiveRoute = (path: string) => router.pathname === path;

  return (
    <div className="bg-white/5 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y nombre del tenant */}
          <div className="flex items-center">
            <div className="text-white font-semibold text-lg truncate max-w-[200px] sm:max-w-none">
              Ahau {session?.tenantId ? `· ${session.tenantId}` : ''}
            </div>
          </div>
          
          {/* Navegación desktop */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const isActive = isActiveRoute(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-ahau-gold text-ahau-dark'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          {/* Información del usuario y acciones */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block text-sm text-gray-300 truncate max-w-[150px]">
              {session?.email}
            </div>
            <div className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300 capitalize">
              {session?.role || 'user'}
            </div>
            
            {/* Botón de notificaciones */}
            {onNotificationsClick && (
              <button
                onClick={onNotificationsClick}
                className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Notificaciones"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-ahau-gold text-ahau-dark text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            
            {/* Botón de logout desktop */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="hidden sm:flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="mr-2">🚪</span>
              {isLoggingOut ? 'Saliendo...' : 'Cerrar sesión'}
            </button>
            
            {/* Botón de menú móvil */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-white/5">
            <nav className="py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-ahau-gold text-ahau-dark'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
              
              {/* Información del usuario en móvil */}
              <div className="px-4 py-3 border-t border-white/10 mt-4">
                <div className="text-sm text-gray-300 mb-2">
                  {session?.email}
                </div>
                <div className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300 capitalize inline-block mb-3">
                  {session?.role || 'user'}
                </div>
                
                {/* Botón de notificaciones móvil */}
                {onNotificationsClick && (
                  <button
                    onClick={onNotificationsClick}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors mb-3"
                  >
                    <span className="mr-3">🔔</span>
                    Notificaciones
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-ahau-gold text-ahau-dark text-xs font-bold px-2 py-1 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                )}
                
                {/* Botón de logout móvil */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <span className="mr-3">🚪</span>
                  {isLoggingOut ? 'Saliendo...' : 'Cerrar sesión'}
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
