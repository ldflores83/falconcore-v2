export function getGoogleAuthUrl(config: {
  client_id: string;
  redirect_uri: string;
  scopes: string[];
}, projectId: string): string {
  const { client_id, redirect_uri: rawRedirectUri, scopes } = config;
  const redirect_uri = rawRedirectUri.replace(/^REDIRECT_URI=/, '');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(client_id)}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes.join(' '))}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${encodeURIComponent(projectId)}`;

  console.log('[OAuth Debug] redirect_uri utilizado:', redirect_uri);
  console.log('[OAuth Debug] authUrl generado:', authUrl);

  return authUrl;
}
