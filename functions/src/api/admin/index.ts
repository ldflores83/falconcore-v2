// functions/src/api/admin/index.ts

import { Router } from 'express';
import { getSubmissions } from './submissions';
import { getAnalytics } from './analytics';
import { cleanupSessions } from './cleanupSessions';
import { processSubmissions } from './processSubmissions';
import { updateSubmissionStatus } from './updateSubmissionStatus';
import { getWaitlist, updateWaitlistStatus } from './waitlist';
import { getGlobalStats } from './globalStats';
import { getProducts } from './products';
import { getProductConfig, getAllProductConfigs } from './productConfig';

const router = Router();

router.post('/submissions', getSubmissions);
router.post('/analytics', getAnalytics);
router.post('/cleanupSessions', cleanupSessions);
router.post('/processSubmissions', processSubmissions);
router.post('/updateSubmissionStatus', updateSubmissionStatus);
router.post('/waitlist', getWaitlist);
router.post('/updateWaitlistStatus', updateWaitlistStatus);

// Global endpoints for LD dashboard
router.get('/global-stats', getGlobalStats);
router.get('/products', getProducts);
router.get('/product-config', getProductConfig);
router.get('/all-product-configs', getAllProductConfigs);



export default router; 