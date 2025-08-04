"use strict";
/**
 * 🛠 FalconCore – Entry point principal de funciones HTTP en Firebase (v2)
 *
 * Este archivo importa la instancia de Express desde `app.ts`, que es donde
 * se montan las rutas y middlewares. Esto permite mantener limpio este entrypoint
 * y escalar la lógica del backend sin contaminar el archivo raíz.
 *
 * ✅ Firebase Functions v2
 * ✅ Región: us-central1
 * ✅ Rutas montadas: ver /src/app.ts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingauditApi = exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = __importDefault(require("./app")); // <-- nueva estructura modular
exports.api = (0, https_1.onRequest)({
    region: "us-central1",
}, app_1.default);
// Función específica para onboardingaudit
exports.onboardingauditApi = (0, https_1.onRequest)({
    region: "us-central1",
}, async (req, res) => {
    console.log('🚀 Function called:', req.method, req.path, req.query);
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    // El path viene con el prefijo /api/ debido al rewrite en firebase.json
    // Necesitamos extraer la parte después de /api/ para obtener la ruta real
    const fullPath = req.path;
    const path = fullPath.startsWith('/api/') ? fullPath.substring(5) : fullPath;
    console.log('🔍 Debug - Original path:', req.path);
    console.log('🔍 Debug - Processed path:', path);
    console.log('🔍 Debug - Full URL:', req.url);
    console.log('🔍 Debug - Request method:', req.method);
    console.log('🔍 Debug - Request headers:', req.headers);
    console.log('🔍 Debug - Request query:', req.query);
    try {
        console.log('🔍 Debug - Switch path:', path);
        console.log('🔍 Debug - Available cases: oauth/login, auth/check, auth/logout, admin/submissions, admin/analytics, public/trackVisit');
        console.log('🔍 Debug - Request method:', req.method);
        console.log('🔍 Debug - Request headers:', req.headers);
        // Redirigir las rutas de API a las funciones correspondientes
        switch (path) {
            case 'oauth/login':
                console.log('✅ Matched /oauth/login case');
                const { login } = await Promise.resolve().then(() => __importStar(require('./oauth/login')));
                await login(req, res);
                return;
            case 'auth/check':
                console.log('✅ Matched /auth/check case');
                const { check } = await Promise.resolve().then(() => __importStar(require('./api/auth/check')));
                await check(req, res);
                return;
            case 'auth/logout':
                console.log('✅ Matched /auth/logout case');
                const { logout } = await Promise.resolve().then(() => __importStar(require('./api/auth/logout')));
                await logout(req, res);
                return;
            case 'admin/submissions':
                console.log('✅ Matched /admin/submissions case');
                const { getSubmissions } = await Promise.resolve().then(() => __importStar(require('./api/admin/submissions')));
                await getSubmissions(req, res);
                return;
            case 'admin/analytics':
                console.log('✅ Matched /admin/analytics case');
                const { getAnalytics } = await Promise.resolve().then(() => __importStar(require('./api/admin/analytics')));
                await getAnalytics(req, res);
                return;
            case 'public/trackVisit':
                console.log('✅ Matched /public/trackVisit case');
                const { trackVisit } = await Promise.resolve().then(() => __importStar(require('./api/public/trackVisit')));
                await trackVisit(req, res);
                return;
            default:
                res.status(404).json({
                    success: false,
                    message: 'API endpoint not found'
                });
        }
    }
    catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
