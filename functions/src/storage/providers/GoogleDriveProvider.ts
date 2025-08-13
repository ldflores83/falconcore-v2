// functions/src/storage/providers/GoogleDriveProvider.ts

import { google } from 'googleapis';
import { StorageProvider } from '../interfaces/StorageProvider';
import { getOAuthCredentials } from '../../oauth/getOAuthCredentials';
import { getOAuthConfig } from '../../oauth/oauth_projects';
import { generateClientId } from '../../utils/hash';

export class GoogleDriveProvider implements StorageProvider {
  private async getAuthenticatedClient(clientId: string) {
    const credentials = await getOAuthCredentials(clientId);
    
    if (!credentials) {
      throw new Error('OAuth credentials not found');
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
      expiry_date: credentials.expiresAt
    });

    return oauth2Client;
  }

  async createFolder(email: string, projectId: string): Promise<string> {
    const clientId = generateClientId(email, projectId);
    const auth = await this.getAuthenticatedClient(clientId);
    const drive = google.drive({ version: 'v3', auth });

    const folderMetadata = {
      name: `${projectId}_${email}`,
      mimeType: 'application/vnd.google-apps.folder',
      parents: ['root']
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id'
    });

    return folder.data.id!;
  }

  async findOrCreateFolder(folderName: string, projectId: string, accessToken: string, refreshToken?: string, parentFolderId?: string): Promise<string> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Construir query de búsqueda
    let searchQuery = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    
    // Si se especifica carpeta padre, buscar solo dentro de esa carpeta
    if (parentFolderId) {
      searchQuery += ` and '${parentFolderId}' in parents`;
    }

    const searchResponse = await drive.files.list({
      q: searchQuery,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    // Si la carpeta ya existe, retornar su ID
    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      console.log(`✅ Found existing folder: ${folderName} with ID: ${searchResponse.data.files[0].id}`);
      return searchResponse.data.files[0].id!;
    }

    // Si no existe, crear nueva carpeta
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : ['root']
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id'
    });

    console.log(`✅ Created new folder: ${folderName} with ID: ${folder.data.id} ${parentFolderId ? 'inside parent folder' : 'in root'}`);
    return folder.data.id!;
  }

  async createFolderWithTokens(email: string, projectId: string, accessToken: string, refreshToken?: string): Promise<string> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const folderMetadata = {
      name: `${projectId}_${email}`,
      mimeType: 'application/vnd.google-apps.folder',
      parents: ['root']
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id'
    });

    return folder.data.id!;
  }

  async uploadFile(params: {
    folderId: string;
    filename: string;
    contentBuffer: Buffer;
    mimeType: string;
    accessToken?: string;
    refreshToken?: string;
  }): Promise<{
    id: string;
    name: string;
    webViewLink: string;
    size: number;
  }> {
    let auth;
    
    if (params.accessToken) {
      // Usar tokens proporcionados
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: params.accessToken,
        refresh_token: params.refreshToken
      });
      auth = oauth2Client;
    } else {
      // Usar clientId (método anterior)
      auth = await this.getAuthenticatedClient('default');
    }
    
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: params.filename,
      parents: [params.folderId]
    };

    // Convertir Buffer a stream para la API de Google Drive
    const { Readable } = require('stream');
    const stream = Readable.from(params.contentBuffer);
    
    const media = {
      mimeType: params.mimeType,
      body: stream
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, size, webViewLink'
    });

    return {
      id: file.data.id!,
      name: file.data.name!,
      webViewLink: file.data.webViewLink!,
      size: parseInt(file.data.size || '0')
    };
  }

  async uploadFileWithTokens(folderId: string, filename: string, content: string, mimeType: string, accessToken: string, refreshToken?: string): Promise<string> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata = {
      name: filename,
      parents: [folderId]
    };

    const media = {
      mimeType: mimeType,
      body: Buffer.from(content, 'base64')
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id'
    });

    return file.data.id!;
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
    const auth = await this.getAuthenticatedClient('default');
    const docs = google.docs({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Copiar el template
    const copyMetadata = {
      name: params.filename,
      parents: [params.folderId]
    };

    const copy = await drive.files.copy({
      fileId: params.templateId,
      requestBody: copyMetadata,
      fields: 'id, name, webViewLink'
    });

    const documentId = copy.data.id!;

    // Reemplazar placeholders en el documento
    const requests = Object.entries(params.data).map(([key, value]) => ({
      replaceAllText: {
        containsText: {
          text: `{{${key}}}`
        },
        replaceText: String(value)
      }
    }));

    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests
      }
    });

    return {
      id: documentId,
      name: copy.data.name!,
      webViewLink: copy.data.webViewLink!
    };
  }

  async createEmptyDocument(filename: string): Promise<string> {
    const auth = await this.getAuthenticatedClient('default');
    const docs = google.docs({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Crear documento vacío
    const document = await docs.documents.create({
      requestBody: {
        title: filename
      }
    });

    const documentId = document.data.documentId!;

    // Mover a la carpeta raíz
    await drive.files.update({
      fileId: documentId,
      requestBody: {
        name: filename
      }
    });

    return documentId;
  }

  async addContentToDocument(documentId: string, content: string): Promise<void> {
    const auth = await this.getAuthenticatedClient('default');
    const docs = google.docs({ version: 'v1', auth });

    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1
              },
              text: content
            }
          }
        ]
      }
    });
  }

  async replaceDocumentContent(documentId: string, content: string): Promise<void> {
    const auth = await this.getAuthenticatedClient('default');
    const docs = google.docs({ version: 'v1', auth });

    // Obtener el documento actual
    const document = await docs.documents.get({ documentId });
    const endIndex = document.data.body?.content?.[document.data.body.content.length - 1]?.endIndex || 1;

    // Reemplazar todo el contenido
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            deleteContentRange: {
              range: {
                startIndex: 1,
                endIndex: endIndex - 1
              }
            }
          },
          {
            insertText: {
              location: {
                index: 1
              },
              text: content
            }
          }
        ]
      }
    });
  }

  async listFiles(folderId: string): Promise<Array<{ id: string; name: string; mimeType: string }>> {
    const auth = await this.getAuthenticatedClient('default');
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)'
    });

    return response.data.files?.map(file => ({
      id: file.id!,
      name: file.name!,
      mimeType: file.mimeType!
    })) || [];
  }

  async listFilesWithTokens(folderId: string, accessToken: string, refreshToken?: string): Promise<Array<{ id: string; name: string; mimeType: string }>> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)'
    });

    return response.data.files?.map(file => ({
      id: file.id!,
      name: file.name!,
      mimeType: file.mimeType!
    })) || [];
  }

  async getUsageStats(email: string, projectId: string): Promise<{
    filesCount: number;
    totalSize: number;
    lastReset: Date;
  }> {
    const auth = await this.getAuthenticatedClient('default');
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      fields: 'files(size, createdTime)',
      pageSize: 1000
    });

    const files = response.data.files || [];
    const filesCount = files.length;
    const totalSize = files.reduce((sum, file) => sum + (parseInt(file.size || '0')), 0);
    
    // Encontrar la fecha más antigua como lastReset
    const oldestFile = files.reduce((oldest, file) => {
      const fileDate = new Date(file.createdTime || '');
      return oldest < fileDate ? oldest : fileDate;
    }, new Date());

    return { 
      filesCount, 
      totalSize, 
      lastReset: oldestFile 
    };
  }
}
