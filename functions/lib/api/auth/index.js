"use strict";
// functions/src/api/auth/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const check_1 = require("./check");
const logout_1 = require("./logout");
const router = (0, express_1.Router)();
// Auth routes
router.post('/check', check_1.check);
router.post('/logout', logout_1.logout);
exports.default = router;
