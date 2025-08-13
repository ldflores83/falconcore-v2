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

import { onRequest } from "firebase-functions/v2/https";
import app from "./app"; // <-- nueva estructura modular

export const api = onRequest(
  {
    region: "us-central1",
  },
  app
);
