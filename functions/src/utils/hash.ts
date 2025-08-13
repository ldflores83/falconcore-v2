// /functions/src/utils/hash.ts
import crypto from "crypto";

export const getUserIdFromEmail = (email: string): string => {
  const salt = process.env.SYSTEM_SALT || "falconcore_default_salt";
  return crypto.createHmac("sha256", salt).update(email).digest("hex");
};

// Función para generar clientId único basado en email y projectId
export const generateClientId = (email: string, projectId: string): string => {
  const salt = process.env.SYSTEM_SALT || "falconcore_default_salt";
  const combined = `${email}_${projectId}`;
  return crypto.createHmac("sha256", salt).update(combined).digest("hex");
};

// Función temporal para debug
export const debugHash = (input: string): string => {
  console.log('🔧 Debug hash function called with:', input);
  return input;
};
