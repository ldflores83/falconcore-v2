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
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.validateEncryptionKey = validateEncryptionKey;
exports.generateEncryptionKey = generateEncryptionKey;
exports.validateEncryptedData = validateEncryptedData;
const crypto = __importStar(require("crypto"));
const secret_manager_1 = require("@google-cloud/secret-manager");
const secretManagerClient = new secret_manager_1.SecretManagerServiceClient();
/**
 * Obtiene la clave de encriptación desde Google Secret Manager
 * @returns Buffer de 32 bytes para AES-256
 */
async function getEncryptionKey() {
    try {
        const projectId = 'falconcore-v2';
        const secretName = `projects/${projectId}/secrets/ENCRYPTION_KEY/versions/latest`;
        const [version] = await secretManagerClient.accessSecretVersion({ name: secretName });
        const keyHex = version.payload?.data?.toString().trim() || '';
        if (!keyHex || keyHex.length !== 64) {
            throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
        }
        return Buffer.from(keyHex, 'hex');
    }
    catch (error) {
        console.error('❌ Error getting encryption key:', error);
        throw new Error(`Failed to get encryption key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Encripta texto usando AES-256-GCM
 * @param plaintext Texto a encriptar
 * @returns String en formato base64: {iv|ciphertext|authTag}
 */
async function encrypt(plaintext) {
    try {
        const key = await getEncryptionKey();
        const iv = crypto.randomBytes(12); // 12 bytes para GCM
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
        ciphertext += cipher.final('base64');
        const authTag = cipher.getAuthTag();
        // Formato: {iv|ciphertext|authTag} en base64
        const result = Buffer.concat([iv, Buffer.from(ciphertext, 'base64'), authTag]);
        return result.toString('base64');
    }
    catch (error) {
        console.error('❌ Encryption error:', error);
        throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Desencripta texto usando AES-256-GCM
 * @param encryptedData String en formato base64: {iv|ciphertext|authTag}
 * @returns Texto desencriptado
 */
async function decrypt(encryptedData) {
    try {
        const key = await getEncryptionKey();
        const data = Buffer.from(encryptedData, 'base64');
        // Extraer componentes: iv (12 bytes) + ciphertext + authTag (16 bytes)
        if (data.length < 28) { // mínimo: 12 + 0 + 16
            throw new Error('Invalid encrypted data format');
        }
        const iv = data.subarray(0, 12);
        const authTag = data.subarray(data.length - 16);
        const ciphertext = data.subarray(12, data.length - 16);
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        let plaintext = decipher.update(ciphertext, undefined, 'utf8');
        plaintext += decipher.final('utf8');
        return plaintext;
    }
    catch (error) {
        console.error('❌ Decryption error:', error);
        throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Valida que la clave de encriptación esté configurada correctamente
 * @returns true si la clave es válida
 */
async function validateEncryptionKey() {
    try {
        const key = await getEncryptionKey();
        return key.length === 32;
    }
    catch (error) {
        console.error('❌ Encryption key validation failed:', error);
        return false;
    }
}
/**
 * Genera una clave de encriptación aleatoria (para desarrollo/testing)
 * @returns Clave hex de 64 caracteres
 */
function generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
}
/**
 * Verifica la integridad de datos encriptados sin desencriptarlos
 * @param encryptedData String en formato base64
 * @returns true si el formato es válido
 */
function validateEncryptedData(encryptedData) {
    try {
        const data = Buffer.from(encryptedData, 'base64');
        return data.length >= 28; // mínimo: iv (12) + authTag (16)
    }
    catch {
        return false;
    }
}
