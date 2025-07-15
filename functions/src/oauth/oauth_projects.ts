interface OAuthConfig {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scopes: string[];
  provider?: 'google' | 'microsoft';
}

/**
 * Configuración OAuth por proyecto (MVP / Módulo).
 * 
 * Cada `project_id` se utiliza para:
 * - Aislar carpetas creadas en Drive (`Root - {email}/{project_id}`)
 * - Guardar tokens por módulo en Firestore
 * - Escalar a múltiples productos desde la misma base (Falcon Core)
 * 
 * En MVPs iniciales se reutiliza la misma app OAuth (misma client_id),
 * pero puede migrarse luego a apps separadas si se desea aislamiento total.
 */
export const OAUTH_CONFIG_BY_PROJECT: Record<string, OAuthConfig> = {
  devproject: {
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    redirect_uri: process.env.REDIRECT_URI!,
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    provider: 'google'
  },

    // 🚀 MVP colaborativo con AI copilots
  ideasync: {
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    redirect_uri: process.env.REDIRECT_URI!,
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    provider: 'google'
  },
  
  // 🧠 MVP para CS copilot mamon!
  clientpulse: {
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    redirect_uri: process.env.REDIRECT_URI!,
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    provider: 'google'
  },

  // 📂 MVP para gestión de búsqueda de empleo
  jobpulse: {
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    redirect_uri: process.env.REDIRECT_URI!,
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    provider: 'google'
  },

  // 🧪 Oferta freelance inicial (audit onboarding con AI)
  onboardingaudit: {
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    redirect_uri: process.env.REDIRECT_URI!,
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    provider: 'google'
  }
};
