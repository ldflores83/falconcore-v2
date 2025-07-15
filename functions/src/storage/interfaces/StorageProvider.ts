export interface StorageProvider {
  createFolder(folderName: string): Promise<string>;

  createFile(name: string, mimeType: string, content?: string): Promise<string>;

  deleteFile(fileId: string): Promise<void>;
}
