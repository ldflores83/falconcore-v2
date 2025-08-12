// functions/src/oauth/index.ts

import { Router } from 'express';
import { login } from './login';
import { callback } from './callback';
import { check } from './check';
import { logout } from './logout';

const router = Router();

// Middleware para logging de requests OAuth
router.use((req, res, next) => {
  console.log('🔐 OAuth Router: Request received:', {
    method: req.method,
    path: req.path,
    url: req.url,
    query: req.query
  });
  next();
});

// Rutas OAuth
router.get('/login', (req, res) => {
  console.log('🔐 OAuth Router: /login route called');
  return login(req, res);
});

router.get('/callback', (req, res) => {
  console.log('🔐 OAuth Router: /callback route called');
  return callback(req, res);
});

router.get('/check', (req, res) => {
  console.log('🔐 OAuth Router: /check route called');
  return check(req, res);
});

router.post('/logout', (req, res) => {
  console.log('🔐 OAuth Router: /logout route called');
  return logout(req, res);
});

export default router;
