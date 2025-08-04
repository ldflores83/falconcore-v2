import { StorageProvider } from "../interfaces/StorageProvider";

export class OneDriveProvider implements StorageProvider {
  constructor() {
    // Service Account se configura automáticamente
  }

  async createFolder(email: string, projectId: string): Promise<string> {
    // Implementación para OneDrive
    throw new Error('OneDrive provider not implemented yet');
  }

  async createFolderWithTokens(email: string, projectId: string, accessToken: string, refreshToken?: string): Promise<string> {
    // Implementación para OneDrive con tokens OAuth
    throw new Error('OneDrive provider not implemented yet');
  }

  async uploadFile(params: {
    folderId: string;
    filename: string;
    contentBuffer: Buffer;
    mimeType: string;
  }): Promise<{ id: string; name: string; webViewLink: string; size: number; }> {
    // TODO: Implementar cuando se necesite OneDrive
    throw new Error("OneDrive provider not implemented yet");
  }

  async createDocumentFromTemplate(params: {
    templateId: string;
    folderId: string;
    filename: string;
    data: Record<string, any>;
  }): Promise<{ id: string; name: string; webViewLink: string; }> {
    // TODO: Implementar cuando se necesite OneDrive
    throw new Error("OneDrive provider not implemented yet");
  }

  async getUsageStats(email: string, projectId: string): Promise<{ filesCount: number; totalSize: number; lastReset: Date; }> {
    // TODO: Implementar cuando se necesite OneDrive
    throw new Error("OneDrive provider not implemented yet");
  }
}
