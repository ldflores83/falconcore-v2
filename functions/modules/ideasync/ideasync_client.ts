// functions/modules/ideasync/ideasync_client.ts

import { writeToFirestore } from "../../firebase/firestore_client";

/**
 * Crea una nueva entrada de idea en Firestore
 * @param prompt Texto de la idea o pensamiento
 * @param tags Lista de etiquetas (temas relacionados)
 * @param user_id ID del usuario que envía la idea
 */
export async function createIdeaEntry(
  prompt: string,
  tags: string[],
  user_id: string
): Promise<void> {
  const data = {
    prompt,
    tags,
    user_id,
    created_at: new Date().toISOString(),
    origin: "ideasync"
  };

  try {
    console.log("[IdeaSync] Payload enviado:", data);
    await writeToFirestore("ideasync", "entries", data);
    console.log("[IdeaSync] Entrada registrada correctamente ✅");
  } catch (error) {
    console.error("[IdeaSync] Error al registrar entrada ❌", error);
    throw error;
  }
}
