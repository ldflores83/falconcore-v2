import { StorageProvider } from "../interfaces/StorageProvider";

export class DropboxProvider implements StorageProvider {
  constructor() {
    // Service Account se configura automáticamente
  }

  async createFolder(email: string, projectId: string): Promise<string> {
    // Implementación para Dropbox
    throw new Error('Dropbox provider not implemented yet');
  }

  async createFolderWithTokens(email: string, projectId: string, accessToken: string, refreshToken?: string): Promise<string> {
    // Implementación para Dropbox con tokens OAuth
    throw new Error('Dropbox provider not implemented yet');
  }

  async uploadFile(params: {
    folderId: string;
    filename: string;
    contentBuffer: Buffer;
    mimeType: string;
  }): Promise<{ id: string; name: string; webViewLink: string; size: number; }> {
    // TODO: Implementar cuando se necesite Dropbox
    throw new Error("Dropbox provider not implemented yet");
  }

  async createDocumentFromTemplate(params: {
    templateId: string;
    folderId: string;
    filename: string;
    data: Record<string, any>;
  }): Promise<{ id: string; name: string; webViewLink: string; }> {
    // TODO: Implementar cuando se necesite Dropbox
    throw new Error("Dropbox provider not implemented yet");
  }

  async getUsageStats(email: string, projectId: string): Promise<{ filesCount: number; totalSize: number; lastReset: Date; }> {
    // TODO: Implementar cuando se necesite Dropbox
    throw new Error("Dropbox provider not implemented yet");
  }

  async findOrCreateFolder(folderName: string, projectId: string, accessToken: string, refreshToken?: string): Promise<string> {
    // Para Dropbox, simplemente crear la carpeta (no hay búsqueda eficiente)
    return this.createFolderWithTokens('dropbox_user', projectId, accessToken, refreshToken);
  }
}
