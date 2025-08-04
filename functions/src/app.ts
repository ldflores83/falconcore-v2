// functions/src/app.ts

import express from 'express';
import cors from 'cors';
import { receiveForm } from './api/public/receiveForm';
import { uploadAsset } from './api/public/uploadAsset';
import { getUsageStatus } from './api/public/getUsageStatus';
import { generateDocument } from './api/public/generateDocument';
// import { manualAuth } from './api/public/manualAuth'; // Temporalmente comentado
import oauthRouter from './oauth';
import adminRouter from './api/admin';
import authRouter from './api/auth';

const app = express();

console.log('🚀 Express app initialized');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Debug middleware for all requests (AL PRINCIPIO)
app.use((req, res, next) => {
  // Reconstruir la ruta correcta cuando viene a través del rewrite de Firebase
  let correctedPath = req.path;
  if (req.originalUrl && req.originalUrl.includes('/onboardingaudit/api/')) {
    // Extraer la parte después de /onboardingaudit/api/
    const match = req.originalUrl.match(/\/onboardingaudit\/api\/(.+)/);
    if (match) {
      correctedPath = '/' + match[1];
    }
  }
  
  console.log('🔧 Debug - All requests:', {
    method: req.method,
    path: req.path,
    url: req.url,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    correctedPath: correctedPath,
    headers: {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-forwarded-proto': req.headers['x-forwarded-proto'],
      'x-forwarded-host': req.headers['x-forwarded-host'],
      'host': req.headers['host']
    }
  });
  next();
});

// Health check
app.get('/ping', (req, res) => {
  console.log('🏓 Ping endpoint called - UPDATED VERSION');
  res.json({ message: 'pong UPDATED', timestamp: new Date().toISOString() });
});

// Test endpoint for receiveForm
app.get('/public/receiveForm', (req, res) => {
  console.log('🧪 Test receiveForm endpoint called');
  res.json({ message: 'receiveForm endpoint working', timestamp: new Date().toISOString() });
});

// Public API routes
console.log('🔧 Registering public API routes...');

// Middleware para manejar rutas que vienen a través del rewrite de Firebase
app.use(async (req, res, next) => {
  // Middleware genérico para cualquier producto
  if (req.originalUrl && req.originalUrl.includes('/api/')) {
    // Extraer el producto y la ruta de la URL
    const urlMatch = req.originalUrl.match(/\/([^\/]+)\/api\/(.+)/);
    if (urlMatch) {
      const productName = urlMatch[1]; // onboardingaudit, ignium, jobpulse, etc.
      const apiPath = urlMatch[2]; // public/receiveForm, public/uploadAsset, etc.
      
      console.log('🔄 Generic middleware - Product:', productName, 'API Path:', apiPath);
      
      // Interceptar rutas específicas de la API pública para cualquier producto
      if (req.method === 'POST' && apiPath.startsWith('public/')) {
        if (apiPath === 'public/receiveForm') {
          console.log('🔄 Intercepting and redirecting to receiveForm handler');
          return receiveForm(req, res);
        }
        if (apiPath === 'public/trackVisit') {
          console.log('🔄 Intercepting and redirecting to trackVisit handler');
          return res.status(200).json({ success: true, message: 'Visit tracked' });
        }
        if (apiPath === 'public/uploadAsset') {
          console.log('🔄 Intercepting and redirecting to uploadAsset handler');
          return uploadAsset(req, res);
        }
        if (apiPath === 'public/getUsageStatus') {
          console.log('🔄 Intercepting and redirecting to getUsageStatus handler');
          return getUsageStatus(req, res);
        }
        if (apiPath === 'public/generateDocument') {
          console.log('🔄 Intercepting and redirecting to generateDocument handler');
          return generateDocument(req, res);
        }
      }
      
      // Interceptar rutas OAuth para cualquier producto (GET)
      if (req.method === 'GET' && apiPath.startsWith('oauth/')) {
        if (apiPath === 'oauth/login') {
          console.log('🔄 Intercepting and redirecting to OAuth login handler');
          // Importar y llamar al handler de login OAuth
          const { login } = await import('./oauth/login');
          return login(req, res);
        }
      }
      
                    // Interceptar rutas Auth para cualquier producto (POST)
        if (req.method === 'POST' && apiPath.startsWith('auth/')) {
          if (apiPath === 'auth/check') {
            console.log('🔄 Intercepting and redirecting to auth check handler');
            // Importar y llamar al handler de auth check
            const { check } = await import('./api/auth/check');
            return check(req, res);
          }
          if (apiPath === 'auth/logout') {
            console.log('🔄 Intercepting and redirecting to auth logout handler');
            // Importar y llamar al handler de auth logout
            const { logout } = await import('./api/auth/logout');
            return logout(req, res);
          }
        }
       
       // Interceptar rutas Admin para cualquier producto (POST)
       if (req.method === 'POST' && apiPath.startsWith('admin/')) {
         if (apiPath === 'admin/submissions') {
           console.log('🔄 Intercepting and redirecting to admin submissions handler');
           // Importar y llamar al handler de admin submissions
           const { getSubmissions } = await import('./api/admin/submissions');
           return getSubmissions(req, res);
         }
       }
    }
  }
  next();
});

// Rutas normales (para llamadas directas)
app.post('/public/receiveForm', receiveForm);
app.post('/public/uploadAsset', uploadAsset);
app.post('/public/getUsageStatus', getUsageStatus);
app.post('/public/generateDocument', generateDocument);

// Ruta para manejar peticiones que llegan con path: '/' (a través del rewrite)
app.all('/', async (req, res) => {
  console.log('🔄 Root path handler called with originalUrl:', req.originalUrl);
  
  // Extraer el producto y la ruta de la URL
  const urlMatch = req.originalUrl.match(/\/([^\/]+)\/api\/(.+)/);
  if (urlMatch) {
    const productName = urlMatch[1]; // onboardingaudit, ignium, jobpulse, etc.
    const apiPath = urlMatch[2]; // public/receiveForm, public/uploadAsset, etc.
    
    console.log('🔄 Root path - Product:', productName, 'API Path:', apiPath);
    
    // Interceptar rutas específicas de la API pública para cualquier producto
    if (apiPath === 'public/receiveForm') {
      console.log('🔄 Root path: redirecting to receiveForm handler');
      return receiveForm(req, res);
    }
    if (apiPath === 'public/trackVisit') {
      console.log('🔄 Root path: redirecting to trackVisit handler');
      return res.status(200).json({ success: true, message: 'Visit tracked' });
    }
    if (apiPath === 'public/uploadAsset') {
      console.log('🔄 Root path: redirecting to uploadAsset handler');
      return uploadAsset(req, res);
    }
    if (apiPath === 'public/getUsageStatus') {
      console.log('🔄 Root path: redirecting to getUsageStatus handler');
      return getUsageStatus(req, res);
    }
    if (apiPath === 'public/generateDocument') {
      console.log('🔄 Root path: redirecting to generateDocument handler');
      return generateDocument(req, res);
    }
    
    // Interceptar rutas OAuth para cualquier producto
    if (apiPath === 'oauth/login') {
      console.log('🔄 Root path: redirecting to OAuth login handler');
      const { login } = await import('./oauth/login');
      return login(req, res);
    }
  }
  
  // Si no coincide con ninguna ruta conocida, pasar al siguiente middleware
  console.log('🔄 Root path: no matching handler found, passing to next middleware');
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    originalUrl: req.originalUrl
  });
});
console.log('✅ Public API routes registered');
// app.post('/api/public/manualAuth', manualAuth); // Temporalmente comentado

// OAuth routes - SOLO UNA DEFINICIÓN
console.log('🔧 Setting up OAuth routes at /oauth');
app.use('/oauth', oauthRouter);

// Direct OAuth callback endpoint for Google (ruta correcta)
app.get('/oauth/callback', async (req, res) => {
  console.log('🔧 Direct OAuth /callback endpoint called');
  console.log('🔧 Request path:', req.path);
  console.log('🔧 Request method:', req.method);
  console.log('🔧 Request url:', req.url);
  
  try {
    // Import and call the callback function
    const { callback } = await import('./oauth/callback');
    return await callback(req, res);
  } catch (error) {
    console.error('❌ Error importing callback function:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to import callback function",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint for OAuth
app.get('/test-oauth', (req, res) => {
  console.log('🔧 Test OAuth endpoint called');
  res.json({ message: 'OAuth test endpoint working', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/auth', authRouter);

// Admin routes
app.use('/admin', adminRouter);

// Catch-all middleware for unmatched routes
app.use('*', (req, res) => {
  console.log('❌ No route matched:', {
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl
  });
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

export default app;