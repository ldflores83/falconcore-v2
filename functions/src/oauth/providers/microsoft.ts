export function getMicrosoftAuthUrl(config: {
  client_id: string;
  redirect_uri: string;
  scopes: string[];
}): string {
  const { client_id, redirect_uri, scopes } = config;

  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
    `client_id=${encodeURIComponent(client_id)}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes.join(' '))}` +
    `&response_mode=query`;
}
