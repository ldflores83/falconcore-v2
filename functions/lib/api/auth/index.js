"use strict";
// functions/src/api/auth/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const check_1 = require("./check");
const logout_1 = require("./logout");
const getClientId_1 = require("./getClientId");
const getProjectAdmin_1 = require("./getProjectAdmin");
const router = (0, express_1.Router)();
// Rutas de autenticación
router.post('/check', check_1.check);
router.post('/logout', logout_1.logout);
router.post('/getClientId', getClientId_1.getClientId);
// Rutas de información de proyectos
router.get('/getProjectAdmin', getProjectAdmin_1.getProjectAdminEndpoint);
router.get('/getAllProjectAdmins', getProjectAdmin_1.getAllProjectAdminsEndpoint);
exports.default = router;
