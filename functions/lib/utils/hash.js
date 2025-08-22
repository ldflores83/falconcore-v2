"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugHash = exports.generateFirestoreKey = exports.isValidClientId = exports.generateSessionId = exports.generateClientId = void 0;
// /functions/src/utils/hash.ts
const crypto_1 = __importDefault(require("crypto"));
/**
 * Genera un ID único basado en email y projectId
 * @param email Email del usuario
 * @param projectId ID del proyecto
 * @returns ClientId único de 16 caracteres
 */
const generateClientId = (email, projectId) => {
    const salt = process.env.SYSTEM_SALT || "falconcore_default_salt";
    const combined = `${email}_${projectId}`;
    return crypto_1.default.createHmac("sha256", salt).update(combined).digest("hex").substring(0, 16);
};
exports.generateClientId = generateClientId;
/**
 * Genera un ID único para sesiones
 * @param clientId ID del cliente
 * @param projectId ID del proyecto
 * @returns SessionId único
 */
const generateSessionId = (clientId, projectId) => {
    const salt = process.env.SYSTEM_SALT || "falconcore_default_salt";
    const combined = `${clientId}_${projectId}_${Date.now()}`;
    return crypto_1.default.createHmac("sha256", salt).update(combined).digest("hex").substring(0, 32);
};
exports.generateSessionId = generateSessionId;
/**
 * Valida que un clientId tenga el formato correcto
 * @param clientId ID del cliente a validar
 * @returns true si el formato es válido
 */
const isValidClientId = (clientId) => {
    return /^[a-f0-9]{16}$/.test(clientId);
};
exports.isValidClientId = isValidClientId;
/**
 * Genera una clave única para almacenamiento en Firestore
 * @param projectId ID del proyecto
 * @param clientId ID del cliente
 * @returns Clave única para Firestore
 */
const generateFirestoreKey = (projectId, clientId) => {
    return `${projectId}_${clientId}`;
};
exports.generateFirestoreKey = generateFirestoreKey;
/**
 * Función temporal para debug
 * @param input String a hashear
 * @returns Hash MD5
 */
const debugHash = (input) => {
    console.log('🔧 Debug hash function called with:', input);
    return input;
};
exports.debugHash = debugHash;
