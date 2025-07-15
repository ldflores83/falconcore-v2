export interface StorageProvider {
  /**
   * Crea (o retorna) una carpeta para el usuario en el proveedor de almacenamiento
   * @param email Correo del usuario, usado para crear carpeta raíz
   * @param projectId ID del proyecto (ej. clientpulse, jobpulse)
   * @returns folderId generado o encontrado
   */
  createFolder(email: string, projectId: string): Promise<string>;

  // Métodos futuros (a implementar si se requiere):
  // createFile?(...)
  // deleteFile?(...)
}