"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const v2_1 = require("firebase-functions/v2");
const https_1 = require("firebase-functions/v2/https");
const login_1 = require("./oauth/login");
const callback_1 = require("./oauth/callback");
(0, v2_1.setGlobalOptions)({ region: 'us-central1' });
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.get('/oauthlogin', login_1.oauthLoginHandler);
app.get('/oauthcallback', callback_1.oauthCallbackHandler);
exports.api = (0, https_1.onRequest)(app);
