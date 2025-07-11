import * as dotenv from 'dotenv';
dotenv.config(); //lineas adicionales
import * as functions from 'firebase-functions';
import { oauthLoginHandler } from './oauth/login';
import { oauthCallback } from './oauth/callback';

export const oauthLogin = functions.https.onRequest(oauthLoginHandler);

import { debugRedirect } from './debug/redirect';

export const debugRedirectFn = functions.https.onRequest((req, res) => {
  debugRedirect(req, res);
});


export const oauthCallbackFn = functions.https.onRequest(async (req, res) => {
  await oauthCallback(req, res);
});
