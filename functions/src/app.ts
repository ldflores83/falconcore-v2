// functions/src/app.ts

import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';

// Importar rutas
import adminRoutes from './api/admin';
import publicRoutes from './api/public';
import authRoutes from './api/auth';
import oauthRoutes from './oauth';

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'falconcore-v2'
  });
}

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log('🚀 App.ts - Request received:', {
    method: req.method,
    path: req.path,
    url: req.url,
    query: req.query
  });
  next();
});

// Rutas principales
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/oauth', oauthRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Falcon Core V2 API is running',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores global
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error instanceof Error ? error.message : "Unknown error"
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

export default app;