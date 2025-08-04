"use strict";
// functions/src/oauth/check.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = void 0;
const getOAuthCredentials_1 = require("./getOAuthCredentials");
const check = async (req, res) => {
    try {
        const { projectId, userId } = req.body;
        if (!projectId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: projectId and userId"
            });
        }
        // Verificar que el userId corresponde al email autorizado
        if (!userId.includes('luisdaniel883@gmail.com')) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only authorized administrators can access this panel."
            });
        }
        // Obtener credenciales OAuth
        const credentials = await (0, getOAuthCredentials_1.getOAuthCredentials)(userId);
        if (!credentials) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated. Please login first."
            });
        }
        // Verificar que el token es válido
        const validToken = await (0, getOAuthCredentials_1.getValidAccessToken)(userId);
        if (!validToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token. Please login again."
            });
        }
        console.log('✅ OAuth check successful:', {
            userId,
            projectId,
            hasValidToken: !!validToken
        });
        return res.status(200).json({
            success: true,
            message: "Authentication verified",
            email: 'luisdaniel883@gmail.com',
            projectId
        });
    }
    catch (error) {
        console.error('❌ Error in OAuth check:', error);
        return res.status(500).json({
            success: false,
            message: "Authentication check failed",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.check = check;
