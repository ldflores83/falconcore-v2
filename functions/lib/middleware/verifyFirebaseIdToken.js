"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseIdToken = verifyFirebaseIdToken;
const firebase_admin_1 = require("firebase-admin");
async function verifyFirebaseIdToken(req, res, next) {
    const hdr = req.headers.authorization || '';
    const m = hdr.match(/^Bearer (.+)$/);
    if (!m)
        return res.status(401).json({ code: 'auth/missing-bearer' });
    try {
        const decoded = await (0, firebase_admin_1.auth)().verifyIdToken(m[1], true); // checkRevoked=true (opcional)
        req.auth = { uid: decoded.uid, email: decoded.email ?? null, claims: decoded };
        return next();
    }
    catch (err) {
        return res.status(401).json({ code: 'auth/invalid-token' });
    }
}
