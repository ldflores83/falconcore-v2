import { Router } from 'express';
import { trackVisit } from './trackVisit';
import { addToWaitlist } from './addToWaitlist';

const router = Router();

router.post('/track-visit', trackVisit);
router.post('/add-to-waitlist', addToWaitlist);

export default router;


