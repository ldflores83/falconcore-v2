/**
 * 🛠 FalconCore – Entry point principal de funciones HTTP en Firebase (v2)
 *
 * Este archivo importa la instancia de Express desde `app.ts`, que es donde
 * se montan las rutas y middlewares. Esto permite mantener limpio este entrypoint
 * y escalar la lógica del backend sin contaminar el archivo raíz.
 *
 * ✅ Firebase Functions v2
 * ✅ Región: us-central1
 * ✅ Rutas montadas: ver /src/app.ts
 */

import { onRequest } from "firebase-functions/v2/https";
import app from "./app"; // <-- nueva estructura modular

export const api = onRequest(
  {
    region: "us-central1",
  },
  app
);

// Función específica para onboardingaudit
export const onboardingauditApi = onRequest(
  {
    region: "us-central1",
  },
  async (req, res) => {
    console.log('🚀 Function called:', req.method, req.path, req.query);
    
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    // El path viene con el prefijo /api/ debido al rewrite en firebase.json
    // Necesitamos extraer la parte después de /api/ para obtener la ruta real
    const fullPath = req.path;
    const path = fullPath.startsWith('/api/') ? fullPath.substring(5) : fullPath;
    console.log('🔍 Debug - Original path:', req.path);
    console.log('🔍 Debug - Processed path:', path);
    console.log('🔍 Debug - Full URL:', req.url);
    console.log('🔍 Debug - Request method:', req.method);
    console.log('🔍 Debug - Request headers:', req.headers);
    console.log('🔍 Debug - Request query:', req.query);
    
    try {
      console.log('🔍 Debug - Switch path:', path);
      console.log('🔍 Debug - Available cases: oauth/login, auth/check, auth/logout, admin/submissions, admin/analytics, public/trackVisit');
      console.log('🔍 Debug - Request method:', req.method);
      console.log('🔍 Debug - Request headers:', req.headers);
      
      // Redirigir las rutas de API a las funciones correspondientes
      switch (path) {
        case 'oauth/login':
          console.log('✅ Matched /oauth/login case');
          const { login } = await import('./oauth/login');
          await login(req, res);
          return;
        
        case 'auth/check':
          console.log('✅ Matched /auth/check case');
          const { check } = await import('./api/auth/check');
          await check(req, res);
          return;
        
        case 'auth/logout':
          console.log('✅ Matched /auth/logout case');
          const { logout } = await import('./api/auth/logout');
          await logout(req, res);
          return;
        
        case 'admin/submissions':
          console.log('✅ Matched /admin/submissions case');
          const { getSubmissions } = await import('./api/admin/submissions');
          await getSubmissions(req, res);
          return;
        
        case 'admin/analytics':
          console.log('✅ Matched /admin/analytics case');
          const { getAnalytics } = await import('./api/admin/analytics');
          await getAnalytics(req, res);
          return;
        
        case 'public/trackVisit':
          console.log('✅ Matched /public/trackVisit case');
          const { trackVisit } = await import('./api/public/trackVisit');
          await trackVisit(req, res);
          return;
        
        default:
          res.status(404).json({
            success: false,
            message: 'API endpoint not found'
          });
      }
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);
