"use strict";
// src/oauth/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const login_1 = __importDefault(require("./login"));
const callback_1 = require("./callback");
const router = (0, express_1.Router)();
// Endpoint para iniciar el flujo OAuth
router.get('/login', login_1.default);
// Endpoint para recibir el callback de Google OAuth
router.get('/callback', callback_1.oauthCallbackHandler);
exports.default = router;
