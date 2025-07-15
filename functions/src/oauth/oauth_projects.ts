interface OAuthConfig {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scopes: string[];
  provider?: 'google' | 'microsoft';
}

export const OAUTH_CONFIG_BY_PROJECT: Record<string, OAuthConfig> = {
  devproject: {
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    redirect_uri: process.env.REDIRECT_URI!,
    scopes: [
      'https://www.googleapis.com/auth/drive.file',         // Permite crear/modificar archivos y carpetas
      'https://www.googleapis.com/auth/userinfo.email',     // Permite acceder al email
      'https://www.googleapis.com/auth/userinfo.profile'    // Permite acceder al nombre y foto del usuario
    ],
    provider: 'google'
  },
};
