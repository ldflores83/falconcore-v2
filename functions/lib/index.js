"use strict";
/**
 * 🛠 FalconCore – Entry point principal de funciones HTTP en Firebase (v2)
 *
 * Este archivo importa la instancia de Express desde `app.ts`, que es donde
 * se montan las rutas y middlewares. Esto permite mantener limpio este entrypoint
 * y escalar la lógica del backend sin contaminar el archivo raíz.
 *
 * ✅ Firebase Functions v2
 * ✅ Región: us-central1
 * ✅ Rutas montadas: ver /src/app.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = __importDefault(require("./app")); // <-- nueva estructura modular
exports.api = (0, https_1.onRequest)({
    region: "us-central1",
}, app_1.default);
