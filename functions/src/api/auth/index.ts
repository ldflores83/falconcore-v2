// functions/src/api/auth/index.ts

import { Router } from 'express';
import { check } from './check';
import { logout } from './logout';
import { getClientId } from './getClientId';
import { getProjectAdminEndpoint, getAllProjectAdminsEndpoint } from './getProjectAdmin';

const router = Router();

// Rutas de autenticación
router.post('/check', check);
router.post('/logout', logout);
router.post('/getClientId', getClientId);

// Rutas de información de proyectos
router.get('/getProjectAdmin', getProjectAdminEndpoint);
router.get('/getAllProjectAdmins', getAllProjectAdminsEndpoint);

export default router; 