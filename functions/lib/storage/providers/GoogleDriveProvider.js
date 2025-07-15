"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveProvider = void 0;
// /src/storage/providers/GoogleDriveProvider.ts
const googleapis_1 = require("googleapis");
const getOrCreateFolder_1 = require("../utils/getOrCreateFolder");
class GoogleDriveProvider {
    constructor(accessToken) {
        const oauth2Client = new googleapis_1.google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        this.drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
    }
    async createFolder(email, projectId) {
        try {
            const rootFolderName = `Root - ${email}`;
            const rootFolderId = await (0, getOrCreateFolder_1.getOrCreateFolder)(this.drive, rootFolderName);
            const projectFolderId = await (0, getOrCreateFolder_1.getOrCreateFolder)(this.drive, projectId, rootFolderId);
            return projectFolderId;
        }
        catch (error) {
            console.error('[Drive Error]', error);
            throw new Error('Error al crear carpeta en Drive');
        }
    }
}
exports.GoogleDriveProvider = GoogleDriveProvider;
