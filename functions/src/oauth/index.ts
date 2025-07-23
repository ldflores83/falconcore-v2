// src/oauth/index.ts

import { Router } from 'express';
import loginHandler from './login';
import { oauthCallbackHandler } from './callback';

const router = Router();

// Endpoint para iniciar el flujo OAuth
router.get('/login', loginHandler);

// Endpoint para recibir el callback de Google OAuth
router.get('/callback', oauthCallbackHandler);


export default router;
