"use strict";
// src/firebase.ts
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
exports.db = void 0;
const admin = __importStar(require("firebase-admin"));
const fs_1 = require("fs");
let serviceAccount = null;
const secretPath = '/secrets/firebase-admin-key/latest';
if ((0, fs_1.existsSync)(secretPath)) {
    try {
        serviceAccount = JSON.parse((0, fs_1.readFileSync)(secretPath, 'utf8'));
    }
    catch (err) {
        console.error('[firebase.ts] Error reading or parsing service account secret:', err);
    }
}
console.log('[firebase.ts] INICIO de inicialización');
if (!admin.apps.length) {
    admin.initializeApp(serviceAccount
        ? { credential: admin.credential.cert(serviceAccount), projectId: 'falconcore-v2' }
        : { projectId: 'falconcore-v2' });
}
exports.db = admin.firestore();
