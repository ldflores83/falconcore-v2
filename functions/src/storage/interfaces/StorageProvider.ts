export interface StorageProvider {
  /**
   * Crea (o retorna) una carpeta para el usuario en el proveedor de almacenamiento
   * @param email Correo del usuario, usado para crear carpeta raíz
   * @param projectId ID del proyecto (ej. clientpulse, jobpulse)
   * @returns folderId generado o encontrado
   */
  createFolder(email: string, projectId: string): Promise<string>;

  /**
   * Crea (o retorna) una carpeta usando tokens OAuth directamente
   * @param email Correo del usuario, usado para crear carpeta raíz
   * @param projectId ID del proyecto (ej. clientpulse, jobpulse)
   * @param accessToken Token de acceso OAuth
   * @param refreshToken Token de refresh OAuth (opcional)
   * @returns folderId generado o encontrado
   */
  createFolderWithTokens(email: string, projectId: string, accessToken: string, refreshToken?: string): Promise<string>;

  /**
   * Busca una carpeta existente o crea una nueva si no existe
   * @param folderName Nombre de la carpeta a buscar/crear
   * @param projectId ID del proyecto
   * @param accessToken Token de acceso OAuth
   * @param refreshToken Token de refresh OAuth (opcional)
   * @returns folderId de la carpeta existente o nueva
   */
  findOrCreateFolder(folderName: string, projectId: string, accessToken: string, refreshToken?: string, parentFolderId?: string): Promise<string>;

  /**
   * Sube un archivo al proveedor de almacenamiento
   * @param folderId ID de la carpeta donde subir el archivo
   * @param filename Nombre del archivo
   * @param contentBuffer Buffer del contenido del archivo
   * @param mimeType Tipo MIME del archivo
   * @returns Información del archivo subido
   */
  uploadFile(params: {
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
  }>;

  /**
   * Crea un documento de Google Docs/Slides desde un template
   * @param templateId ID del template de Google Docs/Slides
   * @param folderId ID de la carpeta donde crear el documento
   * @param filename Nombre del documento
   * @param data Datos para reemplazar en el template
   * @returns Información del documento creado
   */
  createDocumentFromTemplate(params: {
    templateId: string;
    folderId: string;
    filename: string;
    data: Record<string, any>;
  }): Promise<{
    id: string;
    name: string;
    webViewLink: string;
  }>;

  /**
   * Obtiene información de uso del storage
   * @param email Email del usuario
   * @param projectId ID del proyecto
   * @returns Estadísticas de uso
   */
  getUsageStats(email: string, projectId: string): Promise<{
    filesCount: number;
    totalSize: number;
    lastReset: Date;
  }>;
}