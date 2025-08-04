// functions/src/api/admin/submissions.ts

import { Request, Response } from "express";
import { getOAuthCredentials } from '../../oauth/getOAuthCredentials';
import { GoogleDriveProvider } from '../../storage/providers/GoogleDriveProvider';

export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { projectId, userId } = req.body;

    if (!projectId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: projectId and userId"
      });
    }

    // Verificar que el userId corresponde al email autorizado
    if (!userId.includes('luisdaniel883@gmail.com')) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only authorized administrators can access submissions."
      });
    }

    // Verificar credenciales OAuth
    const credentials = await getOAuthCredentials(userId);
    
    if (!credentials) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login first."
      });
    }

    // Obtener submissions desde Google Drive
    const provider = new GoogleDriveProvider();
    
    // Crear carpeta principal del admin (si no existe)
    const adminFolderId = await provider.createFolderWithTokens(
      'luisdaniel883@gmail.com', 
      projectId, 
      credentials.accessToken,
      credentials.refreshToken
    );
    
    // Listar TODAS las subcarpetas en la carpeta del admin
    const allFiles = [];
    
    // Primero, listar las subcarpetas (folders)
    const folders = await provider.listFilesWithTokens(
      adminFolderId, 
      credentials.accessToken,
      credentials.refreshToken
    );
    
    console.log('🔍 Folders found in admin folder:', {
      adminFolderId,
      totalFolders: folders.length,
      folderNames: folders.map(f => f.name)
    });
    
    // Buscar archivos .md en cada subcarpeta
    for (const folder of folders) {
      if (folder.mimeType === 'application/vnd.google-apps.folder') {
        console.log('🔍 Searching in subfolder:', folder.name);
        
        const subfolderFiles = await provider.listFilesWithTokens(
          folder.id, 
          credentials.accessToken,
          credentials.refreshToken
        );
        
        console.log('🔍 Files found in subfolder:', {
          folderName: folder.name,
          totalFiles: subfolderFiles.length,
          fileNames: subfolderFiles.map(f => f.name)
        });
        
        // Agregar archivos .md encontrados
        const mdFiles = subfolderFiles.filter(file => 
          file.name.includes('Onboarding_Audit_') && 
          file.mimeType === 'text/markdown'
        );
        
        allFiles.push(...mdFiles);
      }
    }
    
    console.log('🔍 Total .md files found across all subfolders:', {
      totalFiles: allFiles.length,
      fileNames: allFiles.map(f => f.name)
    });
    
    const submissions = allFiles
      .map(file => {
        console.log('🔍 Processing file:', file.name);
        
        // Extraer información del nombre del archivo
        const fileNameParts = file.name.replace('Onboarding_Audit_', '').split('_');
        console.log('🔍 File name parts:', fileNameParts);
        
        const productName = fileNameParts[0] || 'Unknown';
        const email = fileNameParts[1] || 'Unknown';
        
        const submission = {
          id: file.id,
          email: email,
          productName: productName,
          productUrl: '', // No disponible en el nombre del archivo
          targetUser: 'Unknown', // No disponible en el nombre del archivo
          mainGoal: 'Unknown', // No disponible en el nombre del archivo
          createdAt: new Date(file.createdTime),
          status: 'pending',
          folderId: file.parents?.[0] || adminFolderId, // Usar la subcarpeta donde está el archivo
          webViewLink: file.webViewLink
        };
        
        console.log('🔍 Created submission object:', submission);
        return submission;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log('✅ Admin submissions loaded:', {
      projectId,
      userId,
      submissionsCount: submissions.length
    });

    return res.status(200).json({
      success: true,
      submissions
    });

  } catch (error) {
    console.error('❌ Error loading admin submissions:', error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to load submissions",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 