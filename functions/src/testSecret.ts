import { onRequest } from "firebase-functions/v2/https";
import { readFileSync, existsSync } from "fs";

export const testSecret = onRequest((req, res) => {
  const path = "/secrets/firebase-admin-key/latest";
  let content = null;
  let error = null;
  if (existsSync(path)) {
    try {
      content = readFileSync(path, "utf8").slice(0, 200); // solo los primeros 200 chars
    } catch (err) {
      error = err?.toString();
    }
  }
  res.json({
    exists: existsSync(path),
    content,
    error,
  });
}); 