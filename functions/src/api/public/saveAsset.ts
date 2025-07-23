// Paso 1: saveAsset.ts
// Ruta: /functions/src/api/public/saveAsset.ts
import { Request, Response } from "express";
import { uploadAsset } from "../../storage/utils/uploadAsset";

export const saveAsset = async (req: Request, res: Response) => {
  try {
    const { project_id, email, access_token, folder_id, filename, content } = req.body;

    if (!project_id || !email || !access_token || !folder_id || !filename || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await uploadAsset({
      projectId: project_id,
      email,
      accessToken: access_token,
      folderId: folder_id,
      filename,
      content,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in saveAsset:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
