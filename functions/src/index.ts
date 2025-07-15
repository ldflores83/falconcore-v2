import express from 'express';
import cors from 'cors';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';

import { oauthLoginHandler } from './oauth/login';
import { oauthCallbackHandler } from './oauth/callback';

setGlobalOptions({ region: 'us-central1' });

const app = express();
app.use(cors({ origin: true }));

app.get('/oauthlogin', oauthLoginHandler);
app.get('/oauthcallback', oauthCallbackHandler);

export const api = onRequest(app);
