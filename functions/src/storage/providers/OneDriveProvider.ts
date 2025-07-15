import { StorageProvider } from '../interfaces/StorageProvider';

export class OneDriveProvider implements StorageProvider {
  constructor(accessToken: string) {
    // Inicialización futura del SDK o cliente de OneDrive
  }

  async createFile(): Promise<string> {
    throw new Error('OneDrive createFile not implemented yet');
  }

  async createFolder(): Promise<string> {
    throw new Error('OneDrive createFolder not implemented yet');
  }

  async deleteFile(): Promise<void> {
    throw new Error('OneDrive deleteFile not implemented yet');
  }
}
