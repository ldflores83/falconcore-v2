import * as crypto from 'crypto';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const algorithm = 'aes-256-cbc';
const secretManagerClient = new SecretManagerServiceClient();

async function getKey() {
  try {
    const projectId = 'falconcore-v2';
    const secretName = `projects/${projectId}/secrets/ENCRYPTION_KEY/versions/latest`;
    
    const [version] = await secretManagerClient.accessSecretVersion({ name: secretName });
    
    const key = version.payload?.data?.toString().trim() || '';
    
    if (!key || Buffer.from(key, 'hex').length !== 32) {
      throw new Error("ENCRYPTION_KEY must be defined and 32 bytes long (hex string).");
    }
    
    return Buffer.from(key, 'hex');
  } catch (error) {
    throw new Error(`Failed to access ENCRYPTION_KEY from Secret Manager: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function encrypt(text: string): Promise<string> {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, await getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export async function decrypt(data: string): Promise<string> {
  const [ivHex, encryptedHex] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, await getKey(), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString('utf8');
}
