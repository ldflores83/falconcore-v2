"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropboxProvider = void 0;
class DropboxProvider {
    constructor() {
        // Service Account se configura automáticamente
    }
    async createFolder(email, projectId) {
        // Implementación para Dropbox
        throw new Error('Dropbox provider not implemented yet');
    }
    async createFolderWithTokens(email, projectId, accessToken, refreshToken) {
        // Implementación para Dropbox con tokens OAuth
        throw new Error('Dropbox provider not implemented yet');
    }
    async uploadFile(params) {
        // TODO: Implementar cuando se necesite Dropbox
        throw new Error("Dropbox provider not implemented yet");
    }
    async createDocumentFromTemplate(params) {
        // TODO: Implementar cuando se necesite Dropbox
        throw new Error("Dropbox provider not implemented yet");
    }
    async getUsageStats(email, projectId) {
        // TODO: Implementar cuando se necesite Dropbox
        throw new Error("Dropbox provider not implemented yet");
    }
    async findOrCreateFolder(folderName, projectId, accessToken, refreshToken) {
        // Para Dropbox, simplemente crear la carpeta (no hay búsqueda eficiente)
        return this.createFolderWithTokens('dropbox_user', projectId, accessToken, refreshToken);
    }
}
exports.DropboxProvider = DropboxProvider;
