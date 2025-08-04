"use strict";
// functions/src/oauth/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const login_1 = require("./login");
const check_1 = require("./check");
const logout_1 = require("./logout");
const router = (0, express_1.Router)();
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
    return (0, login_1.login)(req, res);
});
// Callback se maneja directamente en app.ts para evitar conflictos
// router.get('/callback', callback); // REMOVIDO - se maneja en app.ts
router.post('/check', check_1.check);
router.post('/logout', logout_1.logout);
exports.default = router;
