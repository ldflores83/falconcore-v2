import { GoogleDriveProvider } from '../providers/GoogleDriveProvider';
import type { StorageProvider } from '../interfaces/StorageProvider';

export function providerFactory(provider: string, accessToken: string): StorageProvider {
  switch (provider) {
    case 'google':
      return new GoogleDriveProvider(accessToken);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
