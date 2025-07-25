// 🚨 SOLO PARA SCRIPTS: No importar ni usar desde funciones. No inicializa Firebase aquí.
// Si necesitas Firestore en funciones, usa 'import { db } from "../src/firebase";'
// Puedes inicializar aquí SOLO para scripts CLI independientes.

// import * as admin from "firebase-admin";
// import * as fs from "fs";

// // Ruta al archivo de credenciales
// const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "./firebase/firebase-credentials.json";

// // Inicializar Firebase si aún no está inicializado
// if (!admin.apps.length) {
//   const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// const db = admin.firestore();

/**
 * Función genérica para escribir en Firestore
 * @param projectId - ID del proyecto (usado como prefijo)
 * @param collection - Nombre de la colección (ej. 'entries')
 * @param data - Objeto JSON a guardar
 */
export async function writeToFirestore(
  projectId: string,
  collection: string,
  data: Record<string, any>
  
): Promise<void> {
  try {
    const collectionPath = `${projectId}_${collection}`;
    const docRef = await db.collection(collectionPath).add(data);
    console.info(`[Firestore] Documento creado en ${collectionPath}, ID: ${docRef.id}`);
  } catch (error) {
    console.error("[Firestore] Error al escribir en Firestore:", error);
    throw error;
  }
  
}
