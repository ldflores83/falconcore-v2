// functions/src/api/admin/index.ts

import { Router } from 'express';
import { getSubmissions } from './submissions';
import { getAnalytics } from './analytics';
import { cleanupSessions } from './cleanupSessions';

const router = Router();

router.post('/submissions', getSubmissions);
router.post('/analytics', getAnalytics);
router.post('/cleanupSessions', cleanupSessions);

export default router; 