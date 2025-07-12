// Interfaz que define cómo debe lucir la config de cada proyecto
interface OAuthConfig {
  provider: 'google' | 'microsoft';
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scopes: string[];
}

// Aquí defines qué configuración usar por proyecto (por ahora solo 'devproject')
export const OAUTH_CONFIG_BY_PROJECT: Record<string, OAuthConfig> = {
  devproject: {
    provider: 'google',  // ✅ Agregado
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    redirect_uri: process.env.REDIRECT_URI!,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  },
};