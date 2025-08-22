"use strict";
// /functions/src/api/public/getUsageStatus.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsageStatus = void 0;
const configService_1 = require("../../services/configService");
const getUsageStatus = async (req, res) => {
    try {
        const { projectId } = req.body;
        const projectIdFinal = projectId || 'onboardingaudit';
        // Validar que el proyecto esté configurado
        if (!configService_1.ConfigService.isProductConfigured(projectIdFinal)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project configuration"
            });
        }
        // TEMPORALMENTE: Retornar datos simulados hasta resolver Google Drive
        console.log('📊 Usage status requested (Google Drive temporalmente deshabilitado):', {
            projectId: projectIdFinal,
            timestamp: new Date().toISOString()
        });
        // Respuesta exitosa con datos simulados
        const response = {
            success: true,
            filesUploaded: 0,
            mbUsed: 0,
            resetIn: '24h',
            message: "Usage status retrieved successfully",
        };
        return res.status(200).json(response);
    }
    catch (error) {
        console.error("❌ Error in getUsageStatus:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
};
exports.getUsageStatus = getUsageStatus;
