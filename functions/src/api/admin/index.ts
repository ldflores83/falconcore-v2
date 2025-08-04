// functions/src/api/admin/index.ts

import { Router } from 'express';
import { getSubmissions } from './submissions';
import { getAnalytics } from './analytics';

const router = Router();

router.post('/submissions', getSubmissions);
router.post('/analytics', getAnalytics);

export default router; 