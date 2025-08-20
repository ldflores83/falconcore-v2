import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Productos', href: '/products', icon: '🚀' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Waitlists', href: '/waitlists', icon: '📝' },
  { name: 'Usuarios', href: '/users', icon: '👥' },
  { name: 'Configuración', href: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-grow flex-col overflow-y-auto bg-ld-dark pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <div className="text-2xl font-bold text-white">LD Admin</div>
        </div>
        <nav className="mt-5 flex flex-1 flex-col divide-y divide-gray-700">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-ld-primary text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
