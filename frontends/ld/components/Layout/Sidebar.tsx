import React from 'react';

const navigation = [
  { name: 'Dashboard', href: '/ld/', icon: '📊' },
  { name: 'Productos', href: '/ld/products/', icon: '🚀' },
  { name: 'Analytics', href: '/ld/analytics/', icon: '📈' },
  { name: 'Waitlists', href: '/ld/waitlists/', icon: '📝' },
  { name: 'Usuarios', href: '/ld/users/', icon: '👥' },
  { name: 'Configuración', href: '/ld/settings/', icon: '⚙️' },
];

export default function Sidebar() {
  const getCurrentPath = () => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  };

  const currentPath = getCurrentPath();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-grow flex-col overflow-y-auto bg-ld-dark pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <div className="text-2xl font-bold text-white">LD Admin</div>
        </div>
        <nav className="mt-5 flex flex-1 flex-col divide-y divide-gray-700">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = currentPath === item.href || 
                             (currentPath === '/ld/' && item.href === '/ld/') ||
                             (currentPath === '/ld/index.html' && item.href === '/ld/');
              return (
                <button
                  key={item.name}
                  onClick={() => window.location.href = item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                    isActive
                      ? 'bg-ld-primary text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
