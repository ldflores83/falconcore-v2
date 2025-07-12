export function getGoogleAuthUrl(config: {
  client_id: string;
  redirect_uri: string;
  scopes: string[];
}): string {
  const { client_id, redirect_uri, scopes } = config;

  return `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(client_id)}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes.join(' '))}` +
    `&access_type=offline` +
    `&prompt=consent`;
}
