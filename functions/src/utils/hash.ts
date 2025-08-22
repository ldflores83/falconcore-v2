// /functions/src/utils/hash.ts
import crypto from "crypto";

/**
 * Genera un ID único basado en email y projectId
 * @param email Email del usuario
 * @param projectId ID del proyecto
 * @returns ClientId único de 16 caracteres
 */
export const generateClientId = (email: string, projectId: string): string => {
  const salt = process.env.SYSTEM_SALT || "falconcore_default_salt";
  const combined = `${email}_${projectId}`;
  return crypto.createHmac("sha256", salt).update(combined).digest("hex").substring(0, 16);
};

/**
 * Genera un ID único para sesiones
 * @param clientId ID del cliente
 * @param projectId ID del proyecto
 * @returns SessionId único
 */
export const generateSessionId = (clientId: string, projectId: string): string => {
  const salt = process.env.SYSTEM_SALT || "falconcore_default_salt";
  const combined = `${clientId}_${projectId}_${Date.now()}`;
  return crypto.createHmac("sha256", salt).update(combined).digest("hex").substring(0, 32);
};

/**
 * Valida que un clientId tenga el formato correcto
 * @param clientId ID del cliente a validar
 * @returns true si el formato es válido
 */
export const isValidClientId = (clientId: string): boolean => {
  return /^[a-f0-9]{16}$/.test(clientId);
};

/**
 * Genera una clave única para almacenamiento en Firestore
 * @param projectId ID del proyecto
 * @param clientId ID del cliente
 * @returns Clave única para Firestore
 */
export const generateFirestoreKey = (projectId: string, clientId: string): string => {
  return `${projectId}_${clientId}`;
};

/**
 * Función temporal para debug
 * @param input String a hashear
 * @returns Hash MD5
 */
export const debugHash = (input: string): string => {
  console.log('🔧 Debug hash function called with:', input);
  return input;
};
