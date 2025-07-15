// functions/modules/ideasync/test_ideasync.ts

import { createIdeaEntry } from "./ideasync_client";

async function runTest() {
  const prompt = "¿Y si Falcon tuviera un modo de ideas en voz baja?";
  const tags = ["productividad", "IA", "reflexión"];
  const user_id = "test_user_001";

  try {
    await createIdeaEntry(prompt, tags, user_id);
    console.log("[Test] Idea registrada con éxito 🎉");
  } catch (error) {
    console.error("[Test] Falló la prueba de IdeaSync ❌", error);
  }
}

runTest();
