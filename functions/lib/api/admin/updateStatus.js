"use strict";
// functions/src/api/admin/updateStatus.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubmissionStatus = void 0;
const getOAuthCredentials_1 = require("../../oauth/getOAuthCredentials");
const GoogleDriveProvider_1 = require("../../storage/providers/GoogleDriveProvider");
const updateSubmissionStatus = async (req, res) => {
    try {
        const { projectId, userId, submissionId, newStatus } = req.body;
        if (!projectId || !userId || !submissionId || !newStatus) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: projectId, userId, submissionId, newStatus"
            });
        }
        // Verificar que el userId corresponde al email autorizado
        if (!userId.includes('luisdaniel883@gmail.com')) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only authorized administrators can update submission status."
            });
        }
        // Verificar credenciales OAuth
        const credentials = await (0, getOAuthCredentials_1.getOAuthCredentials)(userId);
        if (!credentials) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated. Please login first."
            });
        }
        // Validar estado válido
        const validStatuses = ['pending', 'in_progress', 'completed'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: pending, in_progress, completed"
            });
        }
        // Obtener submissions desde Google Drive
        const provider = new GoogleDriveProvider_1.GoogleDriveProvider();
        // Crear carpeta principal del admin (si no existe)
        const adminFolderId = await provider.createFolderWithTokens('luisdaniel883@gmail.com', projectId, credentials.accessToken, credentials.refreshToken);
        // Listar TODAS las subcarpetas en la carpeta del admin
        const allFiles = [];
        // Primero, listar las subcarpetas (folders)
        const folders = await provider.listFilesWithTokens(adminFolderId, credentials.accessToken, credentials.refreshToken);
        // Buscar archivos .md en cada subcarpeta
        for (const folder of folders) {
            if (folder.mimeType === 'application/vnd.google-apps.folder') {
                const subfolderFiles = await provider.listFilesWithTokens(folder.id, credentials.accessToken, credentials.refreshToken);
                // Agregar archivos .md encontrados
                const mdFiles = subfolderFiles.filter(file => file.name.includes('Onboarding_Audit_') &&
                    file.mimeType === 'text/markdown');
                allFiles.push(...mdFiles);
            }
        }
        // Encontrar el archivo específico
        const targetFile = allFiles.find(file => file.id === submissionId);
        if (!targetFile) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }
        // Crear un archivo de estado en la misma carpeta
        const statusFileName = `status_${newStatus}_${new Date().toISOString().slice(0, 10)}.txt`;
        const statusContent = `Status: ${newStatus}\nUpdated: ${new Date().toISOString()}\nUpdatedBy: ${userId}`;
        const statusBuffer = Buffer.from(statusContent, 'utf-8');
        try {
            await provider.uploadFileWithTokens({
                folderId: targetFile.parents?.[0] || adminFolderId,
                filename: statusFileName,
                contentBuffer: statusBuffer,
                mimeType: 'text/plain',
                accessToken: credentials.accessToken,
                refreshToken: credentials.refreshToken
            });
            console.log('✅ Submission status updated:', {
                submissionId,
                newStatus,
                projectId,
                userId
            });
            return res.status(200).json({
                success: true,
                message: `Submission status updated to ${newStatus}`,
                submissionId,
                newStatus
            });
        }
        catch (error) {
            console.error('❌ Error updating submission status:', error);
            return res.status(500).json({
                success: false,
                message: "Failed to update submission status",
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    catch (error) {
        console.error('❌ Error in updateSubmissionStatus:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to update submission status",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateSubmissionStatus = updateSubmissionStatus;
