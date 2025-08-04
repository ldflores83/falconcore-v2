"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageProviderFactory = void 0;
const GoogleDriveProvider_1 = require("../providers/GoogleDriveProvider");
const DropboxProvider_1 = require("../providers/DropboxProvider");
const OneDriveProvider_1 = require("../providers/OneDriveProvider");
class StorageProviderFactory {
    static createProvider(providerType) {
        switch (providerType.toLowerCase()) {
            case 'googledrive':
            case 'google':
                return new GoogleDriveProvider_1.GoogleDriveProvider();
            case 'dropbox':
                return new DropboxProvider_1.DropboxProvider();
            case 'onedrive':
                return new OneDriveProvider_1.OneDriveProvider();
            default:
                throw new Error(`Unsupported storage provider: ${providerType}`);
        }
    }
}
exports.StorageProviderFactory = StorageProviderFactory;
