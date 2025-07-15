import express from 'express';
import cors from 'cors';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';

import { oauthLoginHandler } from './oauth/login';
import { oauthCallbackHandler } from './oauth/callback';

// 🌍 Config global para Gen 2 (puedes ajustar región si lo deseas)
setGlobalOptions({ region: 'us-central1' });

const app = express();

// 🛡 Middlewares
app.use(cors({ origin: true }));

// 📌 Rutas limpias (sin /api porque ya están dentro de `api`)
app.get('/oauthlogin', oauthLoginHandler);
app.get('/oauthcallback', oauthCallbackHandler);

// 🚀 Exporta como función Gen 2
export const api = onRequest(app);
