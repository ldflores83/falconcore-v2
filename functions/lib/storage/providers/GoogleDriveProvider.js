"use strict";
// functions/src/storage/providers/GoogleDriveProvider.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveProvider = void 0;
const googleapis_1 = require("googleapis");
const getOAuthCredentials_1 = require("../../oauth/getOAuthCredentials");
const config_1 = require("../../config");
class GoogleDriveProvider {
    constructor() {
        // Inicializar sin auth, se configurará dinámicamente
        this.drive = googleapis_1.google.drive({ version: 'v3' });
        this.docs = googleapis_1.google.docs({ version: 'v1' });
        this.slides = googleapis_1.google.slides({ version: 'v1' });
    }
    async getAuthenticatedClient() {
        const accessToken = await (0, getOAuthCredentials_1.getValidAccessToken)();
        if (!accessToken) {
            throw new Error('No se pudo obtener access token válido. Ejecuta setupManualAuth primero.');
        }
        const oauthConfig = await (0, config_1.getOAuthConfig)();
        const oauth2Client = new googleapis_1.google.auth.OAuth2(oauthConfig.clientId, oauthConfig.clientSecret, oauthConfig.redirectUri);
        oauth2Client.setCredentials({
            access_token: accessToken
        });
        return oauth2Client;
    }
    async createFolder(email, projectId) {
        try {
            const auth = await this.getAuthenticatedClient();
            this.drive = googleapis_1.google.drive({ version: 'v3', auth });
            this.docs = googleapis_1.google.docs({ version: 'v1', auth });
            this.slides = googleapis_1.google.slides({ version: 'v1', auth });
            // Crear carpeta simple: ProjectName_Email
            const folderName = `${projectId}_${email}`;
            let folderId = await this.findOrCreateFolder(folderName, null);
            console.log('✅ Simple folder created:', {
                folderName,
                folderId
            });
            return folderId;
        }
        catch (error) {
            console.error('❌ Error creating simple folder:', error);
            throw error;
        }
    }
    async createFolderWithTokens(email, projectId, accessToken, refreshToken) {
        try {
            console.log('🔧 Creating folder with direct OAuth tokens');
            const oauthConfig = await (0, config_1.getOAuthConfig)();
            const oauth2Client = new googleapis_1.google.auth.OAuth2(oauthConfig.clientId, oauthConfig.clientSecret, oauthConfig.redirectUri);
            oauth2Client.setCredentials({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            this.drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
            this.docs = googleapis_1.google.docs({ version: 'v1', auth: oauth2Client });
            this.slides = googleapis_1.google.slides({ version: 'v1', auth: oauth2Client });
            // Crear carpeta simple: ProjectName_Email
            const folderName = `${projectId}_${email}`;
            let folderId = await this.findOrCreateFolder(folderName, null);
            console.log('✅ Simple folder created with direct tokens:', {
                folderName,
                folderId
            });
            return folderId;
        }
        catch (error) {
            console.error('❌ Error creating simple folder with direct tokens:', error);
            throw error;
        }
    }
    async findOrCreateFolder(folderName, parentId) {
        try {
            // Buscar carpeta existente
            const query = parentId
                ? `name='${folderName}' and '${parentId}' in parents and trashed=false`
                : `name='${folderName}' and 'root' in parents and trashed=false`;
            const response = await this.drive.files.list({
                q: query,
                fields: 'files(id, name)',
                spaces: 'drive'
            });
            if (response.data.files && response.data.files.length > 0) {
                return response.data.files[0].id;
            }
            // Crear nueva carpeta
            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                ...(parentId && { parents: [parentId] })
            };
            const folder = await this.drive.files.create({
                requestBody: folderMetadata,
                fields: 'id, name'
            });
            console.log(`✅ Created folder: ${folderName} (${folder.data.id})`);
            return folder.data.id;
        }
        catch (error) {
            console.error(`❌ Error finding/creating folder ${folderName}:`, error);
            throw error;
        }
    }
    async uploadFile(params) {
        try {
            const { folderId, filename, contentBuffer, mimeType } = params;
            const fileMetadata = {
                name: filename,
                parents: [folderId]
            };
            // Crear un stream readable desde el buffer
            const { Readable } = require('stream');
            const stream = new Readable();
            stream.push(contentBuffer);
            stream.push(null); // Indica el final del stream
            const media = {
                mimeType: mimeType,
                body: stream
            };
            const file = await this.drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id, name, size, webViewLink'
            });
            console.log('✅ File uploaded:', {
                id: file.data.id,
                name: file.data.name,
                size: file.data.size,
                webViewLink: file.data.webViewLink
            });
            return {
                id: file.data.id,
                name: file.data.name,
                webViewLink: file.data.webViewLink,
                size: parseInt(file.data.size || '0')
            };
        }
        catch (error) {
            console.error('❌ Error uploading file:', error);
            throw error;
        }
    }
    async uploadFileWithTokens(params) {
        try {
            const { folderId, filename, contentBuffer, mimeType, accessToken, refreshToken } = params;
            // Configurar OAuth client con tokens específicos
            const oauthConfig = await (0, config_1.getOAuthConfig)();
            const oauth2Client = new googleapis_1.google.auth.OAuth2(oauthConfig.clientId, oauthConfig.clientSecret, oauthConfig.redirectUri);
            oauth2Client.setCredentials({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            // Configurar Drive con las credenciales específicas
            this.drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
            const fileMetadata = {
                name: filename,
                parents: [folderId]
            };
            // Crear un stream readable desde el buffer
            const { Readable } = require('stream');
            const stream = new Readable();
            stream.push(contentBuffer);
            stream.push(null); // Indica el final del stream
            const media = {
                mimeType: mimeType,
                body: stream
            };
            const file = await this.drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id, name, size, webViewLink'
            });
            console.log('✅ File uploaded with tokens:', {
                id: file.data.id,
                name: file.data.name,
                size: file.data.size,
                webViewLink: file.data.webViewLink
            });
            return {
                id: file.data.id,
                name: file.data.name,
                webViewLink: file.data.webViewLink,
                size: parseInt(file.data.size || '0')
            };
        }
        catch (error) {
            console.error('❌ Error uploading file with tokens:', error);
            throw error;
        }
    }
    async createDocumentFromTemplate(params) {
        try {
            const { templateId, folderId, filename, data } = params;
            // Si no hay templateId, crear documento vacío
            if (!templateId) {
                return await this.createEmptyDocument(folderId, filename, data);
            }
            // Copiar template
            const copyMetadata = {
                name: filename,
                parents: [folderId]
            };
            const copiedFile = await this.drive.files.copy({
                fileId: templateId,
                requestBody: copyMetadata,
                fields: 'id, name, webViewLink'
            });
            const documentId = copiedFile.data.id;
            // Reemplazar placeholders en el documento
            await this.replaceDocumentContent(documentId, data);
            console.log('✅ Document created from template:', {
                id: documentId,
                name: filename,
                webViewLink: copiedFile.data.webViewLink
            });
            return {
                id: documentId,
                name: filename,
                webViewLink: copiedFile.data.webViewLink
            };
        }
        catch (error) {
            console.error('❌ Error creating document from template:', error);
            throw error;
        }
    }
    async createEmptyDocument(folderId, filename, data) {
        try {
            // Crear documento vacío
            const document = await this.docs.documents.create({
                requestBody: {
                    title: filename
                }
            });
            const documentId = document.data.documentId;
            // Mover documento a la carpeta
            await this.drive.files.update({
                fileId: documentId,
                requestBody: {
                    parents: [folderId]
                },
                fields: 'id, name, webViewLink'
            });
            // Agregar contenido al documento
            await this.addContentToDocument(documentId, data);
            console.log('✅ Empty document created:', {
                id: documentId,
                name: filename,
                webViewLink: document.data.documentId
            });
            return {
                id: documentId,
                name: filename,
                webViewLink: `https://docs.google.com/document/d/${documentId}/edit`
            };
        }
        catch (error) {
            console.error('❌ Error creating empty document:', error);
            throw error;
        }
    }
    async addContentToDocument(documentId, data) {
        try {
            const requests = [];
            // Crear título
            requests.push({
                insertText: {
                    location: {
                        index: 1
                    },
                    text: 'Onboarding Audit Report\n\n'
                }
            });
            // Agregar contenido estructurado
            let index = 2;
            Object.entries(data).forEach(([key, value]) => {
                if (value && key !== 'submissionId' && key !== 'projectId' && key !== 'clientId' && key !== 'createdAt') {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const text = `${label}: ${value}\n\n`;
                    requests.push({
                        insertText: {
                            location: {
                                index: index
                            },
                            text: text
                        }
                    });
                    index += text.length;
                }
            });
            if (requests.length > 0) {
                await this.docs.documents.batchUpdate({
                    documentId: documentId,
                    requestBody: {
                        requests: requests
                    }
                });
            }
        }
        catch (error) {
            console.error('❌ Error adding content to document:', error);
            throw error;
        }
    }
    async replaceDocumentContent(documentId, data) {
        try {
            // Obtener contenido del documento
            const document = await this.docs.documents.get({
                documentId: documentId
            });
            const requests = [];
            // Crear requests para reemplazar placeholders
            Object.entries(data).forEach(([key, value]) => {
                const placeholder = `{{${key}}}`;
                const text = String(value);
                // Buscar y reemplazar placeholder
                if (document.data.body?.content) {
                    document.data.body.content.forEach((element) => {
                        if (element.paragraph?.elements) {
                            element.paragraph.elements.forEach((textElement) => {
                                if (textElement.textRun?.content?.includes(placeholder)) {
                                    requests.push({
                                        replaceAllText: {
                                            containsText: {
                                                text: placeholder,
                                                matchCase: true
                                            },
                                            replaceText: text
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
            if (requests.length > 0) {
                await this.docs.documents.batchUpdate({
                    documentId: documentId,
                    requestBody: {
                        requests: requests
                    }
                });
            }
        }
        catch (error) {
            console.error('❌ Error replacing document content:', error);
            throw error;
        }
    }
    async listFiles(folderId) {
        try {
            const auth = await this.getAuthenticatedClient();
            this.drive = googleapis_1.google.drive({ version: 'v3', auth });
            const response = await this.drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: 'files(id, name, webViewLink, createdTime)',
                spaces: 'drive',
                orderBy: 'createdTime desc'
            });
            const files = response.data.files || [];
            console.log('📁 Files listed:', {
                folderId,
                filesCount: files.length
            });
            return files.map(file => ({
                id: file.id || '',
                name: file.name || '',
                webViewLink: file.webViewLink || '',
                createdTime: file.createdTime || ''
            }));
        }
        catch (error) {
            console.error('❌ Error listing files:', error);
            throw error;
        }
    }
    async listFilesWithTokens(folderId, accessToken, refreshToken) {
        try {
            const oauthConfig = await (0, config_1.getOAuthConfig)();
            const oauth2Client = new googleapis_1.google.auth.OAuth2(oauthConfig.clientId, oauthConfig.clientSecret, oauthConfig.redirectUri);
            oauth2Client.setCredentials({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            this.drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
            const response = await this.drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: 'files(id, name, webViewLink, createdTime, mimeType, parents)',
                spaces: 'drive',
                orderBy: 'createdTime desc'
            });
            const files = response.data.files || [];
            console.log('📁 Files listed with tokens:', {
                folderId,
                filesCount: files.length
            });
            return files.map(file => ({
                id: file.id || '',
                name: file.name || '',
                webViewLink: file.webViewLink || '',
                createdTime: file.createdTime || '',
                mimeType: file.mimeType || '',
                parents: file.parents || []
            }));
        }
        catch (error) {
            console.error('❌ Error listing files with tokens:', error);
            throw error;
        }
    }
    async getUsageStats(email, projectId) {
        try {
            // Obtener carpeta del usuario
            const folderId = await this.createFolder(email, projectId);
            // Listar archivos en la carpeta
            const response = await this.drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: 'files(id, name, size, createdTime)',
                spaces: 'drive'
            });
            const files = response.data.files || [];
            const totalSize = files.reduce((sum, file) => sum + parseInt(file.size || '0'), 0);
            const oldestFile = files.reduce((oldest, file) => {
                const fileDate = new Date(file.createdTime || '');
                return oldest < fileDate ? oldest : fileDate;
            }, new Date());
            console.log('📊 Usage stats retrieved:', {
                email,
                projectId,
                filesCount: files.length,
                totalSize,
                oldestFile
            });
            return {
                filesCount: files.length,
                totalSize,
                lastReset: oldestFile
            };
        }
        catch (error) {
            console.error('❌ Error getting usage stats:', error);
            throw error;
        }
    }
}
exports.GoogleDriveProvider = GoogleDriveProvider;
