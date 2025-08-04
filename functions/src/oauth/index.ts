// functions/src/oauth/index.ts

import { Router } from 'express';
import { login } from './login';
import { check } from './check';
import { logout } from './logout';

const router = Router();

// Middleware para debug
router.use((req, res, next) => {
  console.log('🔧 OAuth router middleware - Request:', {
    path: req.path,
    method: req.method,
    url: req.url,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl
  });
  next();
});

console.log('🔧 OAuth router: registering /login endpoint');
router.get('/login', (req, res) => {
  console.log('🔧 OAuth /login endpoint called');
  console.log('🔧 Request path:', req.path);
  console.log('🔧 Request method:', req.method);
  console.log('🔧 Request url:', req.url);
  console.log('🔧 Request baseUrl:', req.baseUrl);
  console.log('🔧 Request originalUrl:', req.originalUrl);
  console.log('🔧 OAuth router - About to call login function');
  return login(req, res);
});

// Callback se maneja directamente en app.ts para evitar conflictos
// router.get('/callback', callback); // REMOVIDO - se maneja en app.ts

router.post('/check', check);
router.post('/logout', logout);

export default router;
