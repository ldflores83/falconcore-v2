"use strict";
// functions/src/api/public/manualAuth.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualAuth = void 0;
const setupManualAuth_1 = require("../../oauth/setupManualAuth");
const manualAuth = async (req, res) => {
    try {
        const { action, code } = req.body;
        if (!action) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameter: action"
            });
        }
        let result;
        switch (action) {
            case 'setup':
                result = await (0, setupManualAuth_1.setupManualAuth)();
                break;
            case 'complete':
                if (!code) {
                    return res.status(400).json({
                        success: false,
                        message: "Missing required parameter: code"
                    });
                }
                result = await (0, setupManualAuth_1.setupManualAuthWithCode)(code);
                break;
            case 'test':
                result = await (0, setupManualAuth_1.testManualAuth)();
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid action. Must be 'setup', 'complete', or 'test'"
                });
        }
        return res.status(200).json({
            success: result.success,
            message: result.message,
            data: result
        });
    }
    catch (error) {
        console.error('❌ Error in manualAuth:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.manualAuth = manualAuth;
