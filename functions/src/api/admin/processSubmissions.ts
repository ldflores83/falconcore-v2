import { Request, Response } from 'express';
import { GoogleDriveProvider } from '../../storage/providers/GoogleDriveProvider';
import { getOAuthCredentials } from '../../oauth/getOAuthCredentials';
import { uploadToStorage, deleteFromStorage, downloadFromStorage, listFilesInFolder, downloadFolderFromStorage, getStorage } from '../../services/storage';
import * as admin from 'firebase-admin';

// Función para obtener Firestore de forma lazy
const getFirestore = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: 'falconcore-v2',
    });
  }
  return admin.firestore();
};

export const processSubmissions = async (req: Request, res: Response) => {
  console.log('🚀 processSubmissions handler called');
  
  try {
    const { projectId, userId } = req.body;

    if (!projectId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: projectId and userId"
      });
    }

    // Verificar autenticación del admin
    if (!userId.includes('luisdaniel883@gmail.com')) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only authorized administrators can process submissions."
      });
    }

    // Obtener credenciales OAuth del admin
    const credentials = await getOAuthCredentials(userId);
    
    if (!credentials) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login first.",
        requiresLogin: true
      });
    }

    console.log('✅ Admin authenticated, processing submissions...');

    // Obtener submissions pendientes de Firestore
    const db = getFirestore();
    const snapshot = await db.collection('onboardingaudit_submissions')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'asc')
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        message: "No pending submissions found",
        processed: []
      });
    }

    console.log(`📋 Found ${snapshot.docs.length} pending submissions`);

    const results = [];
    const provider = new GoogleDriveProvider();

    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();
        console.log(`🔄 Processing submission: ${doc.id}`);

        // Crear carpeta en Google Drive para esta submission
        const adminFolderId = await provider.createFolderWithTokens(
          'luisdaniel883@gmail.com',
          projectId,
          credentials.accessToken,
          credentials.refreshToken
        );

        // Crear carpeta específica para esta submission
        const formFolderName = `${data.productName}_${data.email}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
        const formFolderId = await provider.findOrCreateFolder(formFolderName, adminFolderId);

                 // Migrar documento principal de Cloud Storage a Google Drive
         if (data.documentPath) {
           const fileName = data.documentPath.split('/').pop();
           
           // Descargar contenido desde Cloud Storage
           console.log(`📥 Downloading document from Cloud Storage: ${data.documentPath}`);
           const contentBuffer = await downloadFromStorage('falconcore-onboardingaudit-uploads', data.documentPath);
           
           if (contentBuffer) {
             const uploadResult = await provider.uploadFile({
               folderId: formFolderId,
               filename: fileName || 'Onboarding_Audit.md',
               contentBuffer: contentBuffer,
               mimeType: 'text/markdown'
             });

             console.log(`✅ Document migrated to Drive: ${uploadResult.id}`);

             // Eliminar archivo de Cloud Storage
             try {
               await deleteFromStorage('falconcore-onboardingaudit-uploads', data.documentPath);
               console.log(`🗑️ Deleted from Cloud Storage: ${data.documentPath}`);
             } catch (deleteError) {
               console.warn('⚠️ Could not delete from Cloud Storage:', deleteError);
             }
           } else {
             console.warn('⚠️ Could not download document from Cloud Storage');
             
             // Si no se puede migrar el documento principal, no procesar
             console.log(`❌ Submission ${doc.id} has failed document migration. Skipping processing.`);
             
             await doc.ref.update({
               status: 'pending',
               processingError: 'Failed to migrate main document',
               lastProcessingAttempt: new Date(),
               updatedAt: new Date()
             });
             
             results.push({
               id: doc.id,
               status: 'pending',
               error: 'Failed to migrate main document'
             });
             
             continue; // Saltar al siguiente documento
           }
         } else {
           console.warn(`⚠️ Submission ${doc.id} has no document path`);
         }

                  // Migrar carpeta de attachments completa desde Cloud Storage a Google Drive
         const submissionFolderPath = `submissions/${doc.id}`;
         const attachmentsFolderPath = `${submissionFolderPath}/attachments`;
         
         console.log(`🖼️ Migrating attachments folder: ${attachmentsFolderPath}`);
         
         // Descargar toda la carpeta de attachments
         const folderContents = await downloadFolderFromStorage('falconcore-onboardingaudit-uploads', attachmentsFolderPath);
         
         if (folderContents.length > 0) {
           console.log(`📦 Found ${folderContents.length} files in attachments folder`);
           
           let successfulUploads = 0;
           let failedUploads = 0;
           
           // Subir todos los archivos de la carpeta a Google Drive
           for (const file of folderContents) {
             try {
               const uploadResult = await provider.uploadFile({
                 folderId: formFolderId,
                 filename: file.path,
                 contentBuffer: file.content,
                 mimeType: file.mimeType
               });
               
               console.log(`✅ File uploaded to Drive: ${uploadResult.id} (${file.path})`);
               successfulUploads++;
             } catch (error) {
               console.error(`❌ Error uploading file ${file.path}:`, error);
               failedUploads++;
             }
           }
           
           console.log(`📊 Folder upload summary: ${successfulUploads} successful, ${failedUploads} failed`);
           
           if (failedUploads > 0) {
             console.log(`❌ Submission ${doc.id} has ${failedUploads} failed uploads. Skipping processing.`);
             
             await doc.ref.update({
               status: 'pending',
               processingError: `Failed to upload ${failedUploads} files from attachments folder`,
               lastProcessingAttempt: new Date(),
               updatedAt: new Date()
             });
             
             results.push({
               id: doc.id,
               status: 'pending',
               error: `Failed to upload ${failedUploads} files from attachments folder`
             });
             
             continue; // Saltar al siguiente documento
           }
           
                       // Si todos los archivos se subieron exitosamente, eliminar la carpeta de attachments
            console.log(`🧹 Cleaning up attachments folder: ${attachmentsFolderPath}`);
            try {
              // Eliminar todos los archivos en la carpeta de attachments
              const allFilesInAttachments = await listFilesInFolder('falconcore-onboardingaudit-uploads', attachmentsFolderPath);
              console.log(`🗑️ Found ${allFilesInAttachments.length} files to delete in attachments folder`);
              
              for (const filePath of allFilesInAttachments) {
                try {
                  await deleteFromStorage('falconcore-onboardingaudit-uploads', filePath);
                  console.log(`🗑️ Deleted file: ${filePath}`);
                } catch (deleteError) {
                  console.warn('⚠️ Could not delete file:', deleteError);
                }
              }
              console.log(`✅ Attachments folder cleaned up`);
            } catch (cleanupError) {
              console.warn('⚠️ Could not clean up attachments folder:', cleanupError);
            }
         } else {
           console.log(`📭 No attachments folder found or folder is empty`);
         }

                 // LIMPIEZA AGRESIVA: Borrar TODOS los archivos que empiecen con submissions/
         console.log(`🧹 AGGRESSIVE CLEANUP: Deleting ALL files that start with submissions/`);
         try {
           // Listar TODOS los archivos que empiecen con submissions/
           const storage = await getStorage();
           const bucket = storage.bucket('falconcore-onboardingaudit-uploads');
           
           // Obtener todos los archivos que empiecen con submissions/
           const [files] = await bucket.getFiles({
             prefix: 'submissions/'
           });
           
           console.log(`🗑️ Found ${files.length} files to delete in submissions folder:`, files.map(f => f.name));
           
           if (files.length > 0) {
             // Borrar todos los archivos encontrados
             for (const file of files) {
               try {
                 await file.delete();
                 console.log(`🗑️ Deleted file: ${file.name}`);
               } catch (deleteError) {
                 console.warn('⚠️ Could not delete file:', deleteError);
               }
             }
             console.log(`✅ All submissions files completely cleaned up`);
           } else {
             console.log(`📭 Submissions folder is already empty`);
           }
         } catch (cleanupError) {
           console.warn('⚠️ Could not clean up submissions folder:', cleanupError);
         }

                   // Actualizar estado en Firestore a 'synced' (migrado a Drive, listo para trabajar)
          await doc.ref.update({
            status: 'synced',
            driveFolderId: formFolderId,
            processedAt: new Date(),
            processedBy: userId
          });

        results.push({
          id: doc.id,
          email: data.email,
          productName: data.productName,
          driveFolderId: formFolderId,
          status: 'in_progress'
        });

        console.log(`✅ Submission processed: ${doc.id}`);

      } catch (error) {
        console.error(`❌ Error processing submission ${doc.id}:`, error);
        
        // Marcar como error en Firestore
        await doc.ref.update({
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date()
        });

        results.push({
          id: doc.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`✅ Processing complete. ${results.length} submissions processed`);

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${results.length} submissions`,
      processed: results
    });

  } catch (error) {
    console.error('❌ Error in processSubmissions:', error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to process submissions",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 