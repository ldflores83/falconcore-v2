"use strict";
// functions/src/app.ts
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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const admin = __importStar(require("firebase-admin"));
// Inicializar Firebase Admin PRIMERO
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'falconcore-v2'
    });
}
// Importar rutas DESPUÉS de inicializar Firebase Admin
const public_1 = __importDefault(require("./api/public"));
const ahau_1 = require("./routes/ahau");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Middleware de logging para debug
app.use((req, res, next) => {
    console.log('🚀 App.ts - Request received:', {
        method: req.method,
        path: req.path,
        url: req.url,
        query: req.query
    });
    next();
});
// Rutas principales
app.use('/api/public', public_1.default);
app.use('/api/ahau', ahau_1.ahauRouter);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Falcon Core V2 API is running',
        timestamp: new Date().toISOString()
    });
});
// Manejo de errores global
app.use((error, req, res, next) => {
    return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found"
    });
});
exports.default = app;
