// /functions/src/api/public/generateDocument.ts

import { Request, Response } from 'express';
import { StorageProviderFactory } from '../../storage/utils/providerFactory';
import { ConfigService } from '../../services/configService';

export const generateDocument = async (req: Request, res: Response) => {
  try {
    const { templateId, filename, data, projectId } = req.body;

    if (!filename || !data || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: filename, data, projectId"
      });
    }

    // Validar que el proyecto esté configurado
    if (!ConfigService.isProductConfigured(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project configuration"
      });
    }

    // Validar que las características necesarias estén habilitadas
    if (!ConfigService.isFeatureEnabled(projectId, 'documentGeneration')) {
      return res.status(400).json({
        success: false,
        message: "Document generation is not enabled for this project"
      });
    }

    const provider = StorageProviderFactory.createProvider('google');

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
      } else {
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

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate document",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Document generation failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}; 