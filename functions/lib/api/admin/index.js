"use strict";
// functions/src/api/admin/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submissions_1 = require("./submissions");
const analytics_1 = require("./analytics");
const cleanupSessions_1 = require("./cleanupSessions");
const processSubmissions_1 = require("./processSubmissions");
const updateSubmissionStatus_1 = require("./updateSubmissionStatus");
const router = (0, express_1.Router)();
router.post('/submissions', submissions_1.getSubmissions);
router.post('/analytics', analytics_1.getAnalytics);
router.post('/cleanupSessions', cleanupSessions_1.cleanupSessions);
router.post('/processSubmissions', processSubmissions_1.processSubmissions);
router.post('/updateSubmissionStatus', updateSubmissionStatus_1.updateSubmissionStatus);
exports.default = router;
