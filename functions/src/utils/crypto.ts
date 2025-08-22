import * as crypto from 'crypto';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const secretManagerClient = new SecretManagerServiceClient();

/**
 * Obtiene la clave de encriptación desde Google Secret Manager
 * @returns Buffer de 32 bytes para AES-256
 */
async function getEncryptionKey(): Promise<Buffer> {
  try {
    const projectId = 'falconcore-v2';
    const secretName = `projects/${projectId}/secrets/ENCRYPTION_KEY/versions/latest`;
    
    const [version] = await secretManagerClient.accessSecretVersion({ name: secretName });
    const keyHex = version.payload?.data?.toString().trim() || '';
    
    if (!keyHex || keyHex.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
    }
    
    return Buffer.from(keyHex, 'hex');
  } catch (error) {
    console.error('❌ Error getting encryption key:', error);
    throw new Error(`Failed to get encryption key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encripta texto usando AES-256-GCM
 * @param plaintext Texto a encriptar
 * @returns String en formato base64: {iv|ciphertext|authTag}
 */
export async function encrypt(plaintext: string): Promise<string> {
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
  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Desencripta texto usando AES-256-GCM
 * @param encryptedData String en formato base64: {iv|ciphertext|authTag}
 * @returns Texto desencriptado
 */
export async function decrypt(encryptedData: string): Promise<string> {
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
  } catch (error) {
    console.error('❌ Decryption error:', error);
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Valida que la clave de encriptación esté configurada correctamente
 * @returns true si la clave es válida
 */
export async function validateEncryptionKey(): Promise<boolean> {
  try {
    const key = await getEncryptionKey();
    return key.length === 32;
  } catch (error) {
    console.error('❌ Encryption key validation failed:', error);
    return false;
  }
}

/**
 * Genera una clave de encriptación aleatoria (para desarrollo/testing)
 * @returns Clave hex de 64 caracteres
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verifica la integridad de datos encriptados sin desencriptarlos
 * @param encryptedData String en formato base64
 * @returns true si el formato es válido
 */
export function validateEncryptedData(encryptedData: string): boolean {
  try {
    const data = Buffer.from(encryptedData, 'base64');
    return data.length >= 28; // mínimo: iv (12) + authTag (16)
  } catch {
    return false;
  }
}
