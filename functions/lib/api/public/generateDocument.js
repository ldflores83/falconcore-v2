"use strict";
// /functions/src/api/public/generateDocument.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDocument = void 0;
const providerFactory_1 = require("../../storage/utils/providerFactory");
const generateDocument = async (req, res) => {
    try {
        const { templateId, filename, data, projectId } = req.body;
        if (!filename || !data || !projectId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: filename, data, projectId"
            });
        }
        const provider = providerFactory_1.StorageProviderFactory.createProvider('google');
        try {
            // Crear documento desde template si se proporciona templateId
            if (templateId) {
                const document = await provider.createDocumentFromTemplate({
                    templateId,
                    folderId: 'root', // Usar carpeta raíz por defecto
                    filename,
                    data
                });
                return res.status(200).json({
                    success: true,
                    message: "Document generated successfully from template",
                    data: {
                        documentId: document.id,
                        documentName: document.name,
                        webViewLink: document.webViewLink
                    }
                });
            }
            else {
                // Crear documento vacío usando createDocumentFromTemplate sin template
                const document = await provider.createDocumentFromTemplate({
                    templateId: '', // Sin template
                    folderId: 'root',
                    filename,
                    data: { content: 'Empty document created' }
                });
                return res.status(200).json({
                    success: true,
                    message: "Empty document created successfully",
                    data: {
                        documentId: document.id,
                        documentLink: document.webViewLink,
                        filename
                    }
                });
            }
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate document",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Document generation failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.generateDocument = generateDocument;
