"use strict";
// functions/src/api/public/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const receiveForm_1 = require("./receiveForm");
const uploadAsset_1 = require("./uploadAsset");
const generateDocument_1 = require("./generateDocument");
const getUsageStatus_1 = require("./getUsageStatus");
const trackVisit_1 = require("./trackVisit");
const waitlist_1 = require("./waitlist");
const router = (0, express_1.Router)();
router.post('/receiveForm', receiveForm_1.receiveForm);
router.post('/uploadAsset', uploadAsset_1.uploadAsset);
router.post('/generateDocument', generateDocument_1.generateDocument);
router.post('/getUsageStatus', getUsageStatus_1.getUsageStatus);
router.post('/trackVisit', trackVisit_1.trackVisit);
router.post('/checkLimit', waitlist_1.checkLimit);
router.post('/addToWaitlist', waitlist_1.addToWaitlist);
exports.default = router;
