"use strict";
// functions/src/config/projectAdmins.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProjectAdmins = exports.isProjectAdmin = exports.getProjectAdmin = exports.PROJECT_ADMINS = void 0;
// Configuración de admins por proyecto
// Cada producto tiene UN SOLO admin específico
exports.PROJECT_ADMINS = {
    'onboardingaudit': 'luisdaniel883@gmail.com',
    'jobpulse': 'luisdaniel883@gmail.com', // Puede ser el mismo o diferente
    'pulziohq': 'luisdaniel883@gmail.com', // Puede ser el mismo o diferente
    'ignium': 'luisdaniel883@gmail.com', // Puede ser el mismo o diferente
    // Agregar más productos aquí según sea necesario
};
// Función para obtener el admin de un proyecto
const getProjectAdmin = (projectId) => {
    return exports.PROJECT_ADMINS[projectId] || null;
};
exports.getProjectAdmin = getProjectAdmin;
// Función para verificar si un usuario es admin de un proyecto
const isProjectAdmin = (email, projectId) => {
    const adminEmail = (0, exports.getProjectAdmin)(projectId);
    return adminEmail === email;
};
exports.isProjectAdmin = isProjectAdmin;
// Función para listar todos los proyectos y sus admins
const getAllProjectAdmins = () => {
    return { ...exports.PROJECT_ADMINS };
};
exports.getAllProjectAdmins = getAllProjectAdmins;
