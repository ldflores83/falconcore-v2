import React from 'react';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {title || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Admin Centralizado
            </div>
            <div className="h-8 w-8 rounded-full bg-ld-primary flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
