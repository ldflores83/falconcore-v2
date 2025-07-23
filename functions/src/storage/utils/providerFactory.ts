import { GoogleDriveProvider } from '../providers/GoogleDriveProvider';
import type { StorageProvider } from '../interfaces/StorageProvider';
import { drive_v3 } from 'googleapis';

export function providerFactory(
  provider: string,
  accessToken: string,
  drive: drive_v3.Drive
): StorageProvider {
  switch (provider) {
    case 'google':
      return new GoogleDriveProvider(accessToken, drive);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}