/**
 * Utilidades para manejar rutas con el prefijo /ahau
 */

// Rutas base del producto Ahau
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  MEMBERS: '/members',
  DRAFTS: '/drafts',
  USERS: '/dashboard/users',
  CONTENT: '/dashboard/content',
} as const;

/**
 * Obtiene la ruta completa con el prefijo /ahau
 * @param path - Ruta relativa (ej: '/dashboard')
 * @returns Ruta completa (ej: '/ahau/dashboard')
 */
export function getRoute(path: string): string {
  // Si la ruta ya tiene el prefijo /ahau, la devolvemos tal como está
  if (path.startsWith('/ahau')) {
    return path;
  }
  
  // Si la ruta empieza con /, la concatenamos con /ahau
  if (path.startsWith('/')) {
    return `/ahau${path}`;
  }
  
  // Si no empieza con /, la concatenamos con /ahau/
  return `/ahau/${path}`;
}

/**
 * Obtiene la ruta base del producto (sin /ahau)
 * @param fullPath - Ruta completa (ej: '/ahau/dashboard')
 * @returns Ruta base (ej: '/dashboard')
 */
export function getBaseRoute(fullPath: string): string {
  if (fullPath.startsWith('/ahau')) {
    return fullPath.substring(5); // Removemos '/ahau'
  }
  return fullPath;
}

/**
 * Verifica si la ruta actual es la ruta del dashboard
 * @param currentPath - Ruta actual
 * @returns true si es la ruta del dashboard
 */
export function isDashboardRoute(currentPath: string): boolean {
  const baseRoute = getBaseRoute(currentPath);
  return baseRoute === '/dashboard' || baseRoute === '/dashboard/';
}

/**
 * Verifica si la ruta actual es una ruta protegida
 * @param currentPath - Ruta actual
 * @returns true si es una ruta protegida
 */
export function isProtectedRoute(currentPath: string): boolean {
  const baseRoute = getBaseRoute(currentPath);
  return baseRoute.startsWith('/dashboard') || 
         baseRoute === '/settings' || 
         baseRoute === '/members' || 
         baseRoute === '/drafts';
}
