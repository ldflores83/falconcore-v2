// src/app.ts

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

import express from "express";
import oauthRouter from "./oauth";
//import { saveAsset } from "./api/public/saveAsset";

const app = express();

app.use(express.json());
app.use("/oauth", oauthRouter);
//app.post("/api/public/saveAsset", saveAsset);

export default app;