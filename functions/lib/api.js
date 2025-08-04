"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
// Proxy para las rutas de API de onboardingaudit
exports.api = functions.https.onRequest(async (req, res) => {
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const path = req.path.replace('/onboardingaudit/api', '');
    try {
        // Redirigir las rutas de API a las funciones correspondientes
        switch (path) {
            case '/auth/check':
                const { check } = await Promise.resolve().then(() => __importStar(require('./oauth/check')));
                return check(req, res);
            case '/auth/logout':
                const { logout } = await Promise.resolve().then(() => __importStar(require('./oauth/logout')));
                return logout(req, res);
            case '/admin/submissions':
                const { getSubmissions } = await Promise.resolve().then(() => __importStar(require('./admin/submissions')));
                return getSubmissions(req, res);
            case '/admin/analytics':
                const { getAnalytics } = await Promise.resolve().then(() => __importStar(require('./admin/analytics')));
                return getAnalytics(req, res);
            case '/public/trackVisit':
                const { trackVisit } = await Promise.resolve().then(() => __importStar(require('./public/trackVisit')));
                return trackVisit(req, res);
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
