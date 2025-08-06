"use strict";
// functions/src/api/public/debugServiceAccount.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugServiceAccountHandler = void 0;
const serviceAccountDebug_1 = require("../../debug/serviceAccountDebug");
const debugServiceAccountHandler = async (req, res) => {
    console.log('🔧 DEBUG: Service Account Debug Endpoint Called');
    try {
        // Ejecutar debug completo
        await (0, serviceAccountDebug_1.debugServiceAccount)();
        // Ejecutar test específico de Secret Manager
        await (0, serviceAccountDebug_1.testSecretManagerAccess)();
        res.status(200).json({
            success: true,
            message: 'Service account debug completed. Check logs for details.',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error in service account debug:', error);
        res.status(500).json({
            success: false,
            message: 'Error during service account debug',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
};
exports.debugServiceAccountHandler = debugServiceAccountHandler;
