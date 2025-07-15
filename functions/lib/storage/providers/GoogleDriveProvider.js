"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveProvider = void 0;
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
class GoogleDriveProvider {
    constructor(accessToken) {
        // Usa constructor directo de la clase, sin pasar por google.auth
        this.oauthClient = new google_auth_library_1.OAuth2Client();
        this.oauthClient.setCredentials({ access_token: accessToken });
    }
    async createFolder(folderName) {
        try {
            const drive = googleapis_1.google.drive({
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
            return folderId;
        }
        catch (error) {
            console.error('[Drive Error]', error); // log completo
            throw new Error('Error al crear carpeta en Drive');
        }
    }
    async createFile(name, mimeType, content) {
        throw new Error('createFile() no está implementado aún.');
    }
    async deleteFile(fileId) {
        throw new Error('deleteFile() no está implementado aún.');
    }
}
exports.GoogleDriveProvider = GoogleDriveProvider;
