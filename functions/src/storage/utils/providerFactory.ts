import { StorageProvider } from "../interfaces/StorageProvider";
import { GoogleDriveProvider } from "../providers/GoogleDriveProvider";
import { DropboxProvider } from "../providers/DropboxProvider";
import { OneDriveProvider } from "../providers/OneDriveProvider";

export class StorageProviderFactory {
  static createProvider(providerType: string): StorageProvider {
    switch (providerType.toLowerCase()) {
      case 'googledrive':
      case 'google':
        return new GoogleDriveProvider();
      
      case 'dropbox':
        return new DropboxProvider();
      
      case 'onedrive':
        return new OneDriveProvider();
      
      default:
        throw new Error(`Unsupported storage provider: ${providerType}`);
    }
  }
}