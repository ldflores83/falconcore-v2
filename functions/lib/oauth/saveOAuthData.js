"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveOAuthData = void 0;
const firebase_1 = require("../firebase"); // ✅ Firestore ya inicializado desde firebase.ts
const saveOAuthData = async (params) => {
    try {
        await firebase_1.db
            .collection("oauthData")
            .doc(`${params.userId}_${params.projectId}`)
            .set({
            accessToken: params.accessToken,
            refreshToken: params.refreshToken,
            expiresAt: params.expiresAt,
            folderId: params.folderId,
            updatedAt: new Date(),
        });
    }
    catch (err) {
        console.error('[saveOAuthData] Firestore write error:', err);
        throw err;
    }
};
exports.saveOAuthData = saveOAuthData;
