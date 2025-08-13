"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugHash = exports.generateClientId = exports.getUserIdFromEmail = void 0;
// /functions/src/utils/hash.ts
const crypto_1 = __importDefault(require("crypto"));
const getUserIdFromEmail = (email) => {
    const salt = process.env.SYSTEM_SALT || "falconcore_default_salt";
    return crypto_1.default.createHmac("sha256", salt).update(email).digest("hex");
};
exports.getUserIdFromEmail = getUserIdFromEmail;
// Función para generar clientId único basado en email y projectId
const generateClientId = (email, projectId) => {
    const salt = process.env.SYSTEM_SALT || "falconcore_default_salt";
    const combined = `${email}_${projectId}`;
    return crypto_1.default.createHmac("sha256", salt).update(combined).digest("hex");
};
exports.generateClientId = generateClientId;
// Función temporal para debug
const debugHash = (input) => {
    console.log('🔧 Debug hash function called with:', input);
    return input;
};
exports.debugHash = debugHash;
