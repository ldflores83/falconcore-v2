// /src/storage/utils/getOrCreateFolder.ts
import { drive_v3 } from 'googleapis';

export async function getOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId?: string
): Promise<string> {
  const query = parentId
    ? `'${parentId}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder'`
    : `name = '${name}' and mimeType = 'application/vnd.google-apps.folder'`;

  const res = await drive.files.list({ q: query, fields: 'files(id, name)' });
  const existing = res.data.files?.[0];
  if (existing) return existing.id!;

  const fileMetadata: drive_v3.Schema$File = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId ? { parents: [parentId] } : {}),
  };

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });

  return folder.data.id!;
}