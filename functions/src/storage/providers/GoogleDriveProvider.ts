import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import type { StorageProvider } from '../interfaces/StorageProvider';

export class GoogleDriveProvider implements StorageProvider {
  private oauthClient: OAuth2Client;

  constructor(accessToken: string) {
    // Usa constructor directo de la clase, sin pasar por google.auth
    this.oauthClient = new OAuth2Client();
    this.oauthClient.setCredentials({ access_token: accessToken });
  }

  async createFolder(folderName: string): Promise<string> {
    try {
      const drive: drive_v3.Drive = google.drive({
        version: 'v3',
        auth: this.oauthClient,
      });

      const response = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });

      const folderId = response.data.id;
      console.log(`[Drive Debug] Carpeta creada: ${folderName}, ID: ${folderId}`);
      return folderId!;
    } catch (error: any) {
      console.error('[Drive Error]', error); // log completo
      throw new Error('Error al crear carpeta en Drive');
    }
  }

  async createFile(name: string, mimeType: string, content?: string): Promise<string> {
    throw new Error('createFile() no está implementado aún.');
  }

  async deleteFile(fileId: string): Promise<void> {
    throw new Error('deleteFile() no está implementado aún.');
  }
}
