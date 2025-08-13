"use strict";
// functions/src/oauth/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const login_1 = require("./login");
const callback_1 = require("./callback");
const check_1 = require("./check");
const logout_1 = require("./logout");
const router = (0, express_1.Router)();
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
    return (0, login_1.login)(req, res);
});
router.get('/callback', (req, res) => {
    console.log('🔐 OAuth Router: /callback route called');
    return (0, callback_1.callback)(req, res);
});
router.get('/check', (req, res) => {
    console.log('🔐 OAuth Router: /check route called');
    return (0, check_1.check)(req, res);
});
router.post('/logout', (req, res) => {
    console.log('🔐 OAuth Router: /logout route called');
    return (0, logout_1.logout)(req, res);
});
exports.default = router;
