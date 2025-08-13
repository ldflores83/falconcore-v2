"use strict";
// functions/src/oauth/check.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = void 0;
const getOAuthCredentials_1 = require("./getOAuthCredentials");
const check = async (req, res) => {
    try {
        const { clientId } = req.query;
        if (!clientId) {
            return res.status(400).json({
                success: false,
                message: "Missing clientId parameter"
            });
        }
        const credentials = await (0, getOAuthCredentials_1.getOAuthCredentials)(clientId);
        if (!credentials) {
            return res.status(401).json({
                success: false,
                message: "OAuth credentials not found or expired"
            });
        }
        return res.status(200).json({
            success: true,
            message: "OAuth credentials valid",
            data: {
                clientId: credentials.clientId,
                projectId: credentials.projectId,
                email: credentials.email,
                folderId: credentials.folderId,
                hasValidToken: !!credentials.accessToken
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "OAuth check failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.check = check;
