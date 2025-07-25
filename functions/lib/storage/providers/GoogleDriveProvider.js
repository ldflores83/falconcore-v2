"use strict";
// /functions/src/storage/providers/GoogleDriveProvider.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveProvider = void 0;
class GoogleDriveProvider {
    constructor(accessToken, drive) {
        this.accessToken = accessToken;
        this.drive = drive;
    }
    async createFolder(email, projectId) {
        const folderName = `${projectId} - ${email}`;
        // Buscar si la carpeta ya existe
        const existing = await this.drive.files.list({
            q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: "files(id, name)",
            spaces: "drive",
        });
        if (existing.data.files && existing.data.files.length > 0) {
            return existing.data.files[0].id;
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
exports.GoogleDriveProvider = GoogleDriveProvider;
