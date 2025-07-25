"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSecret = void 0;
const https_1 = require("firebase-functions/v2/https");
const fs_1 = require("fs");
exports.testSecret = (0, https_1.onRequest)((req, res) => {
    const path = "/secrets/firebase-admin-key/latest";
    let content = null;
    let error = null;
    if ((0, fs_1.existsSync)(path)) {
        try {
            content = (0, fs_1.readFileSync)(path, "utf8").slice(0, 200); // solo los primeros 200 chars
        }
        catch (err) {
            error = err?.toString();
        }
    }
    res.json({
        exists: (0, fs_1.existsSync)(path),
        content,
        error,
    });
});
