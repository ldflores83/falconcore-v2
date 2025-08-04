"use strict";
// functions/src/api/admin/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submissions_1 = require("./submissions");
const analytics_1 = require("./analytics");
const router = (0, express_1.Router)();
router.post('/submissions', submissions_1.getSubmissions);
router.post('/analytics', analytics_1.getAnalytics);
exports.default = router;
