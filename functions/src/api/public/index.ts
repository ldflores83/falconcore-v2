// functions/src/api/public/index.ts

import { Router } from 'express';
import { receiveForm } from './receiveForm';
import { uploadAsset } from './uploadAsset';
import { generateDocument } from './generateDocument';
import { getUsageStatus } from './getUsageStatus';
import { trackVisit } from './trackVisit';
import { checkLimit, addToWaitlist } from './waitlist';

const router = Router();

router.post('/receiveForm', receiveForm);
router.post('/uploadAsset', uploadAsset);
router.post('/generateDocument', generateDocument);
router.post('/getUsageStatus', getUsageStatus);
router.post('/trackVisit', trackVisit);
router.post('/checkLimit', checkLimit);
router.post('/addToWaitlist', addToWaitlist);

export default router; 