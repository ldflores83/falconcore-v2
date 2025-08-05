import { Storage } from '@google-cloud/storage';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

export async function getStorage() {
  try {
    const [version] = await client.accessSecretVersion({
      name: 'projects/falconcore-v2/secrets/cloud-storage-key/versions/latest',
    });

    const payload = version.payload?.data?.toString();
    if (!payload) {
      throw new Error('No se pudo obtener cloud-storage-key desde Secret Manager');
    }

    const keyFile = JSON.parse(payload);

    return new Storage({
      projectId: keyFile.project_id,
      credentials: {
        client_email: keyFile.client_email,
        private_key: keyFile.private_key,
      },
    });
  } catch (error) {
    console.error('❌ Error obteniendo credenciales de Storage:', error);
    throw new Error('No se pudieron obtener las credenciales de Cloud Storage');
  }
}

export async function uploadToStorage(
  bucketName: string,
  filePath: string,
  content: Buffer,
  contentType?: string
) {
  try {
    const storage = await getStorage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    await file.save(content, {
      contentType: contentType || 'application/octet-stream',
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    console.log(`✅ Archivo subido a Storage: gs://${bucketName}/${filePath}`);
    return `gs://${bucketName}/${filePath}`;
  } catch (error) {
    console.error('❌ Error subiendo archivo a Storage:', error);
    throw error;
  }
}

export async function deleteFromStorage(bucketName: string, filePath: string) {
  try {
    const storage = await getStorage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    await file.delete();
    console.log(`✅ Archivo eliminado de Storage: gs://${bucketName}/${filePath}`);
  } catch (error) {
    console.error('❌ Error eliminando archivo de Storage:', error);
    throw error;
  }
}

export async function downloadFromStorage(bucketName: string, filePath: string): Promise<Buffer | null> {
  try {
    const storage = await getStorage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    const [buffer] = await file.download();
    console.log(`✅ Archivo descargado de Storage: gs://${bucketName}/${filePath}`);
    return buffer;
  } catch (error) {
    console.error('❌ Error descargando archivo de Storage:', error);
    return null;
  }
}

export async function listFilesInFolder(bucketName: string, folderPath: string): Promise<string[]> {
  try {
    const storage = await getStorage();
    const bucket = storage.bucket(bucketName);
    
    // Listar archivos en la carpeta
    const [files] = await bucket.getFiles({
      prefix: folderPath,
      delimiter: '/'
    });
    
    const filePaths = files.map(file => file.name);
    console.log(`📋 Found ${filePaths.length} files in folder: gs://${bucketName}/${folderPath}`);
    return filePaths;
  } catch (error) {
    console.error('❌ Error listing files in Storage:', error);
    return [];
  }
}

export async function downloadFolderFromStorage(bucketName: string, folderPath: string): Promise<Array<{path: string, content: Buffer, mimeType: string}>> {
  try {
    const storage = await getStorage();
    const bucket = storage.bucket(bucketName);
    
    // Listar todos los archivos en la carpeta
    const [files] = await bucket.getFiles({
      prefix: folderPath
    });
    
    const folderContents = [];
    
    for (const file of files) {
      try {
        const [buffer] = await file.download();
        const relativePath = file.name.replace(folderPath, '').replace(/^\//, '');
        
        folderContents.push({
          path: relativePath,
          content: buffer,
          mimeType: file.metadata?.contentType || 'application/octet-stream'
        });
        
        console.log(`📥 Downloaded file: ${relativePath}`);
      } catch (error) {
        console.error(`❌ Error downloading file ${file.name}:`, error);
      }
    }
    
    console.log(`✅ Downloaded ${folderContents.length} files from folder: gs://${bucketName}/${folderPath}`);
    return folderContents;
  } catch (error) {
    console.error('❌ Error downloading folder from Storage:', error);
    return [];
  }
} 