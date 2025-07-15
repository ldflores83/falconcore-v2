"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateFolder = getOrCreateFolder;
async function getOrCreateFolder(drive, name, parentId) {
    const query = parentId
        ? `'${parentId}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder'`
        : `name = '${name}' and mimeType = 'application/vnd.google-apps.folder'`;
    const res = await drive.files.list({ q: query, fields: 'files(id, name)' });
    const existing = res.data.files?.[0];
    if (existing)
        return existing.id;
    const fileMetadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId ? { parents: [parentId] } : {}),
    };
    const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
    });
    return folder.data.id;
}
