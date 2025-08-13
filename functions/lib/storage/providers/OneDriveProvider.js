"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneDriveProvider = void 0;
class OneDriveProvider {
    constructor() {
        // Service Account se configura automáticamente
    }
    async createFolder(email, projectId) {
        // Implementación para OneDrive
        throw new Error('OneDrive provider not implemented yet');
    }
    async createFolderWithTokens(email, projectId, accessToken, refreshToken) {
        // Implementación para OneDrive con tokens OAuth
        throw new Error('OneDrive provider not implemented yet');
    }
    async uploadFile(params) {
        // TODO: Implementar cuando se necesite OneDrive
        throw new Error("OneDrive provider not implemented yet");
    }
    async createDocumentFromTemplate(params) {
        // TODO: Implementar cuando se necesite OneDrive
        throw new Error("OneDrive provider not implemented yet");
    }
    async getUsageStats(email, projectId) {
        // TODO: Implementar cuando se necesite OneDrive
        throw new Error("OneDrive provider not implemented yet");
    }
    async findOrCreateFolder(folderName, projectId, accessToken, refreshToken) {
        // Para OneDrive, simplemente crear la carpeta (no hay búsqueda eficiente)
        return this.createFolderWithTokens('onedrive_user', projectId, accessToken, refreshToken);
    }
}
exports.OneDriveProvider = OneDriveProvider;
