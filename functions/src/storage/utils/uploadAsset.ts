// /functions/src/storage/utils/uploadAsset.ts

import { getStorageProvider } from "../utils/providerFactory";

interface UploadAssetParams {
  projectId: string;
  email: string;
  accessToken: string;
  folderId: string;
  filename: string;
  content: string;
}

export const uploadAsset = async ({
  projectId,
  email,
  accessToken,
  folderId,
  filename,
  content,
}: UploadAssetParams) => {
  const provider = getStorageProvider({
    accessToken,
    projectId,
    email,
    folderId,
  });

  const buffer = Buffer.from(content, "utf-8");

  const file = await provider.uploadFile({
    name: filename,
    mimeType: "text/markdown",
    contentBuffer: buffer,
  });

  return {
    fileId: file.id,
    name: file.name,
    webViewLink: file.webViewLink,
    status: "success",
  };
};
