// /src/storage/providers/GoogleDriveProvider.ts
import { google, drive_v3 } from 'googleapis';
import type { StorageProvider } from '../interfaces/StorageProvider';
import { getOrCreateFolder } from '../utils/getOrCreateFolder';

export class GoogleDriveProvider implements StorageProvider {
  private drive: drive_v3.Drive;

  constructor(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
  }

  async createFolder(email: string, projectId: string): Promise<string> {
    try {
      const rootFolderName = `Root - ${email}`;
      const rootFolderId = await getOrCreateFolder(this.drive, rootFolderName);
      const projectFolderId = await getOrCreateFolder(this.drive, projectId, rootFolderId);
      return projectFolderId;
    } catch (error: any) {
      console.error('[Drive Error]', error);
      throw new Error('Error al crear carpeta en Drive');
    }
  }
}