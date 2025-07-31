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
 * - /api/public/*   – APIs públicas para onboarding audit
 */

import express from "express";
import oauthRouter from "./oauth";

// Importar APIs públicas
import { receiveForm } from "./api/public/receiveForm";
import { uploadAsset } from "./api/public/uploadAsset";
import { getUsageStatus } from "./api/public/getUsageStatus";
import { generateDocument } from "./api/public/generateDocument";

const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' })); // Aumentar límite para archivos
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rutas
app.use("/oauth", oauthRouter);

// API pública para onboarding audit
app.post("/api/public/receiveForm", receiveForm);
app.post("/api/public/uploadAsset", uploadAsset);
app.post("/api/public/getUsageStatus", getUsageStatus);
app.post("/api/public/generateDocument", generateDocument);

// Health check
app.get("/ping", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    version: "2.0.0"
  });
});

export default app;