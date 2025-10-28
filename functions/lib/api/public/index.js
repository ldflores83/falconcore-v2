"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trackVisit_1 = require("./trackVisit");
const addToWaitlist_1 = require("./addToWaitlist");
const router = (0, express_1.Router)();
router.post('/track-visit', trackVisit_1.trackVisit);
router.post('/add-to-waitlist', addToWaitlist_1.addToWaitlist);
exports.default = router;
