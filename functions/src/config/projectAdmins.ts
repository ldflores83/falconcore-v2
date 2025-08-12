// functions/src/config/projectAdmins.ts

// Configuración de admins por proyecto
// Cada producto tiene UN SOLO admin específico
export const PROJECT_ADMINS: Record<string, string> = {
  'onboardingaudit': 'luisdaniel883@gmail.com',
  'jobpulse': 'luisdaniel883@gmail.com', // Puede ser el mismo o diferente
  'pulziohq': 'luisdaniel883@gmail.com', // Puede ser el mismo o diferente
  'ignium': 'luisdaniel883@gmail.com',   // Puede ser el mismo o diferente
  // Agregar más productos aquí según sea necesario
};

// Función para obtener el admin de un proyecto
export const getProjectAdmin = (projectId: string): string | null => {
  return PROJECT_ADMINS[projectId] || null;
};

// Función para verificar si un usuario es admin de un proyecto
export const isProjectAdmin = (email: string, projectId: string): boolean => {
  const adminEmail = getProjectAdmin(projectId);
  return adminEmail === email;
};

// Función para listar todos los proyectos y sus admins
export const getAllProjectAdmins = (): Record<string, string> => {
  return { ...PROJECT_ADMINS };
};
