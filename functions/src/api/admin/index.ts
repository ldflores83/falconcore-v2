// functions/src/api/admin/index.ts

import { Router } from 'express';
import { getSubmissions } from './submissions';
import { getAnalytics } from './analytics';
import { cleanupSessions } from './cleanupSessions';
import { processSubmissions } from './processSubmissions';
import { updateSubmissionStatus } from './updateSubmissionStatus';

const router = Router();

router.post('/submissions', getSubmissions);
router.post('/analytics', getAnalytics);
router.post('/cleanupSessions', cleanupSessions);
router.post('/processSubmissions', processSubmissions);
router.post('/updateSubmissionStatus', updateSubmissionStatus);

export default router; 