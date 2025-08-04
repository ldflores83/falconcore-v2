// functions/src/api/auth/index.ts

import { Router } from 'express';
import { check } from './check';
import { logout } from './logout';

const router = Router();

// Auth routes
router.post('/check', check);
router.post('/logout', logout);

export default router; 