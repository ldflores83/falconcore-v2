// functions/src/api/admin/index.ts

import { Router } from 'express';
import { getSubmissions } from './submissions';
import { getAnalytics } from './analytics';
import { cleanupSessions } from './cleanupSessions';
import { processSubmissions } from './processSubmissions';
import { updateSubmissionStatus } from './updateSubmissionStatus';
import { getWaitlist, updateWaitlistStatus } from './waitlist';

const router = Router();

router.post('/submissions', getSubmissions);
router.post('/analytics', getAnalytics);
router.post('/cleanupSessions', cleanupSessions);
router.post('/processSubmissions', processSubmissions);
router.post('/updateSubmissionStatus', updateSubmissionStatus);
router.post('/waitlist', getWaitlist);
router.post('/updateWaitlistStatus', updateWaitlistStatus);

export default router; 