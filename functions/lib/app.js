"use strict";
// src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 🚀 FalconCore – Express app
 *
 * Este archivo define la app Express utilizada por Firebase Functions.
 * Aquí se centraliza el montaje de rutas, middlewares, CORS, logging, etc.
 *
 * 🔁 Incluye:
 * - /ping           – para pruebas básicas
 * - /oauth/*        – rutas de login y callback OAuth
 */
const express_1 = __importDefault(require("express"));
const oauth_1 = __importDefault(require("./oauth"));
//import { saveAsset } from "./api/public/saveAsset";
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/oauth", oauth_1.default);
//app.post("/api/public/saveAsset", saveAsset);
exports.default = app;
