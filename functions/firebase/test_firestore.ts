// functions/firebase/test_firestore.ts

import { writeToFirestore } from "./firestore_client";

async function runTest() {
  const testData = {
    message: "Primera prueba real 🔥",
    created_at: new Date().toISOString(),
    author: "falcon-core",
    purpose: "test"
  };

  try {
    await writeToFirestore("testproject", "entries", testData);
    console.log("[Test] Escritura completada ✅");
  } catch (error) {
    console.error("[Test] Fallo la prueba ❌", error);
  }
}

runTest();
