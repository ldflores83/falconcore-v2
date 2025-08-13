"use strict";
// functions/src/api/public/manualAuth.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualAuth = void 0;
const setupManualAuth_1 = require("../../oauth/setupManualAuth");
const manualAuth = async (req, res) => {
    try {
        const { action, code, project_id, email } = req.body;
        switch (action) {
            case 'setup':
                if (!project_id) {
                    return res.status(400).json({
                        success: false,
                        message: "Missing project_id parameter"
                    });
                }
                return await (0, setupManualAuth_1.setupManualAuth)(req, res);
            case 'setupWithCode':
                if (!code || !project_id || !email) {
                    return res.status(400).json({
                        success: false,
                        message: "Missing required parameters for setup with code"
                    });
                }
                return await (0, setupManualAuth_1.setupManualAuthWithCode)(req, res);
            case 'test':
                if (!project_id || !email) {
                    return res.status(400).json({
                        success: false,
                        message: "Missing required parameters for test"
                    });
                }
                return await (0, setupManualAuth_1.testManualAuth)(req, res);
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid action. Use 'setup', 'setupWithCode', or 'test'"
                });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Manual auth operation failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.manualAuth = manualAuth;
