// /functions/src/storage/providers/GoogleDriveProvider.ts

import { drive_v3, docs_v1, slides_v1 } from "googleapis";
import type { StorageProvider } from "../interfaces/StorageProvider";

export class GoogleDriveProvider implements StorageProvider {
  constructor(
    private accessToken: string,
    private drive: drive_v3.Drive,
    private docs?: docs_v1.Docs,
    private slides?: slides_v1.Slides
  ) {}

  async createFolder(email: string, projectId: string): Promise<string> {
    const folderName = `${projectId} - ${email}`;

    // Buscar si la carpeta ya existe
    const existing = await this.drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
      spaces: "drive",
    });

    if (existing.data.files && existing.data.files.length > 0) {
      return existing.data.files[0].id!;
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

  async uploadFile(params: {
    folderId: string;
    filename: string;
    contentBuffer: Buffer;
    mimeType: string;
  }): Promise<{
    id: string;
    name: string;
    webViewLink: string;
    size: number;
  }> {
    const { folderId, filename, contentBuffer, mimeType } = params;

    const fileMetadata = {
      name: filename,
      parents: [folderId],
    };

    const media = {
      mimeType,
      body: contentBuffer,
    };

    const file = await this.drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id,name,webViewLink,size",
    });

    if (!file.data.id) {
      throw new Error("Failed to upload file to Google Drive.");
    }

    return {
      id: file.data.id,
      name: file.data.name || filename,
      webViewLink: file.data.webViewLink || "",
      size: parseInt(file.data.size || "0"),
    };
  }

  async createDocumentFromTemplate(params: {
    templateId: string;
    folderId: string;
    filename: string;
    data: Record<string, any>;
  }): Promise<{
    id: string;
    name: string;
    webViewLink: string;
  }> {
    const { templateId, folderId, filename, data } = params;

    // Copiar el template
    const copiedFile = await this.drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: filename,
        parents: [folderId],
      },
      fields: "id,name,webViewLink",
    });

    if (!copiedFile.data.id) {
      throw new Error("Failed to copy template document.");
    }

    const documentId = copiedFile.data.id;

    // Si es un Google Doc, reemplazar contenido
    if (this.docs) {
      await this.replaceDocumentContent(documentId, data);
    }

    // Si es un Google Slides, reemplazar contenido
    if (this.slides) {
      await this.replaceSlidesContent(documentId, data);
    }

    return {
      id: documentId,
      name: copiedFile.data.name || filename,
      webViewLink: copiedFile.data.webViewLink || "",
    };
  }

  private async replaceDocumentContent(documentId: string, data: Record<string, any>) {
    if (!this.docs) return;

    // Obtener el documento
    const document = await this.docs.documents.get({
      documentId,
    });

    if (!document.data.body?.content) return;

    // Crear requests para reemplazar contenido
    const requests: docs_v1.Schema$Request[] = [];

    // Reemplazar placeholders con datos reales
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const text = String(value);

      // Buscar y reemplazar el placeholder
      requests.push({
        replaceAllText: {
          containsText: {
            text: placeholder,
          },
          replaceText: text,
        },
      });
    });

    if (requests.length > 0) {
      await this.docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests,
        },
      });
    }
  }

  private async replaceSlidesContent(presentationId: string, data: Record<string, any>) {
    if (!this.slides) return;

    // Obtener la presentación
    const presentation = await this.slides.presentations.get({
      presentationId,
    });

    if (!presentation.data.slides) return;

    // Crear requests para reemplazar contenido
    const requests: slides_v1.Schema$Request[] = [];

    // Reemplazar placeholders en cada slide
    presentation.data.slides.forEach((slide, slideIndex) => {
      if (slide.pageElements) {
        slide.pageElements.forEach((element) => {
          if (element.shape?.text) {
            Object.entries(data).forEach(([key, value]) => {
              const placeholder = `{{${key}}}`;
              const text = String(value);

              if (element.shape.text.textElements) {
                element.shape.text.textElements.forEach((textElement) => {
                  if (textElement.text?.includes(placeholder)) {
                    requests.push({
                      replaceAllText: {
                        containsText: {
                          text: placeholder,
                        },
                        replaceText: text,
                      },
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    if (requests.length > 0) {
      await this.slides.presentations.batchUpdate({
        presentationId,
        requestBody: {
          requests,
        },
      });
    }
  }

  async getUsageStats(email: string, projectId: string): Promise<{
    filesCount: number;
    totalSize: number;
    lastReset: Date;
  }> {
    const folderId = await this.createFolder(email, projectId);

    // Obtener todos los archivos en la carpeta
    const files = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "files(id,name,size,createdTime)",
    });

    const filesList = files.data.files || [];
    const totalSize = filesList.reduce((sum, file) => {
      return sum + parseInt(file.size || "0");
    }, 0);

    // Obtener la fecha de creación más antigua para calcular el reset
    const oldestFile = filesList.reduce((oldest, file) => {
      const fileDate = new Date(file.createdTime || "");
      const oldestDate = new Date(oldest.createdTime || "");
      return fileDate < oldestDate ? file : oldest;
    }, filesList[0]);

    const lastReset = oldestFile ? new Date(oldestFile.createdTime || "") : new Date();

    return {
      filesCount: filesList.length,
      totalSize,
      lastReset,
    };
  }
}
