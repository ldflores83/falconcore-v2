// functions/index.ts

import { onRequest } from "firebase-functions/v2/https";
import app from "./src/app"; // <-- uso directo desde src, no lib

export const api = onRequest(
  { region: "us-central1" },
  app
);
