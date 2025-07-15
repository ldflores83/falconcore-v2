import { StorageProvider } from '../interfaces/StorageProvider';

export class DropboxProvider implements StorageProvider {
  constructor(accessToken: string) {}

  async createFile(): Promise<string> {
    throw new Error('Dropbox createFile not implemented yet');
  }

  async createFolder(): Promise<string> {
    throw new Error('Dropbox createFolder not implemented yet');
  }

  async deleteFile(): Promise<void> {
    throw new Error('Dropbox deleteFile not implemented yet');
  }
}
