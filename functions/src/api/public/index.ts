// functions/src/api/public/index.ts

import { Router } from 'express';
import { receiveForm } from './receiveForm';
import { uploadAsset } from './uploadAsset';
import { generateDocument } from './generateDocument';
import { getUsageStatus } from './getUsageStatus';
import { trackVisit } from './trackVisit';

const router = Router();

router.post('/receiveForm', receiveForm);
router.post('/uploadAsset', uploadAsset);
router.post('/generateDocument', generateDocument);
router.post('/getUsageStatus', getUsageStatus);
router.post('/trackVisit', trackVisit);

export default router; 