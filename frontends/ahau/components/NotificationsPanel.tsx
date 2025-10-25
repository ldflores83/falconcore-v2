import React, { useState } from 'react';
import { useNotifications, Notification } from '../context/NotificationsContext';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '📢';
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'border-green-500 bg-green-500/10';
    case 'error':
      return 'border-red-500 bg-red-500/10';
    case 'warning':
      return 'border-yellow-500 bg-yellow-500/10';
    case 'info':
      return 'border-blue-500 bg-blue-500/10';
    default:
      return 'border-gray-500 bg-gray-500/10';
  }
};

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative ml-auto w-full max-w-md h-full bg-white/10 backdrop-blur-lg border-l border-white/20 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-white">Notificaciones</h2>
              {unreadCount > 0 && (
                <span className="bg-ahau-gold text-ahau-dark text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-ahau-gold text-ahau-dark'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-ahau-gold text-ahau-dark'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                No leídas
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-ahau-gold hover:text-ahau-gold/80 transition-colors"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">
                  {filter === 'unread' ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
                </h3>
                <p className="text-gray-300 text-sm">
                  {filter === 'unread' 
                    ? 'Todas las notificaciones han sido leídas'
                    : 'Las notificaciones aparecerán aquí'
                  }
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl border ${getNotificationColor(notification.type)} ${
                      !notification.read ? 'ring-2 ring-ahau-gold/20' : ''
                    } transition-all duration-200 hover:bg-white/5`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-white">
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-ahau-gold rounded-full"></span>
                          )}
                        </div>
                        {notification.action && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.action!.onClick();
                            }}
                            className="mt-2 text-xs text-ahau-gold hover:text-ahau-gold/80 transition-colors"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
