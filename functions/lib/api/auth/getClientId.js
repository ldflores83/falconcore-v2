"use strict";
// functions/src/api/auth/getClientId.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientId = void 0;
const hash_1 = require("../../utils/hash");
const getClientId = async (req, res) => {
    try {
        const { email, projectId } = req.body;
        if (!email || !projectId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: email and projectId"
            });
        }
        // Generate clientId for the user
        const clientId = (0, hash_1.generateClientId)(email, projectId);
        return res.status(200).json({
            success: true,
            message: "ClientId generated successfully",
            data: {
                clientId,
                email,
                projectId
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate clientId",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.getClientId = getClientId;
