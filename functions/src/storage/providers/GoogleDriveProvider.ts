// /functions/src/storage/providers/GoogleDriveProvider.ts

import { drive_v3 } from "googleapis";
import type { StorageProvider } from "../interfaces/StorageProvider";

export class GoogleDriveProvider implements StorageProvider {
  constructor(
    private accessToken: string,
    private drive: drive_v3.Drive
  ) {}

  async createFolder(email: string, projectId: string): Promise<string> {
    const folderName = `${projectId} - ${email}`;

    // Buscar si la carpeta ya existe
    const existing = await this.drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
      spaces: "drive",
    });

    if (existing.data.files && existing.data.files.length > 0) {
      return existing.data.files[0].id!;
    }

    // Crear nueva carpeta si no existe
    const res = await this.drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });

    const folderId = res.data.id;
    if (!folderId) {
      throw new Error("Failed to create folder in Google Drive.");
    }

    return folderId;
  }
}
