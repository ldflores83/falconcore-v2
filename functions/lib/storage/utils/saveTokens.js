"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveTokensAndFolder = saveTokensAndFolder;
// /src/storage/utils/saveTokens.ts
const firebase_1 = require("../../firebase");
async function saveTokensAndFolder(email, projectId, tokens, folderId) {
    const ref = firebase_1.db.collection('users').doc(email).collection('projects').doc(projectId);
    await ref.set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        folderId,
        lastLogin: new Date(),
    }, { merge: true });
    console.log(`[Firestore Debug] Guardado tokens y folder para ${email}/${projectId}`);
}
