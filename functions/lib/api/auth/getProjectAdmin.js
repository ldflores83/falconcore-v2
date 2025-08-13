"use strict";
// functions/src/api/auth/getProjectAdmin.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProjectAdminsEndpoint = exports.getProjectAdminEndpoint = void 0;
const projectAdmins_1 = require("../../config/projectAdmins");
const getProjectAdminEndpoint = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameter: projectId"
            });
        }
        const adminEmail = (0, projectAdmins_1.getProjectAdmin)(projectId);
        if (!adminEmail) {
            return res.status(404).json({
                success: false,
                message: "Project not found or no admin configured"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Project admin retrieved successfully",
            data: {
                projectId,
                adminEmail
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get project admin",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.getProjectAdminEndpoint = getProjectAdminEndpoint;
const getAllProjectAdminsEndpoint = async (req, res) => {
    try {
        const allAdmins = (0, projectAdmins_1.getAllProjectAdmins)();
        return res.status(200).json({
            success: true,
            message: "All project admins retrieved successfully",
            data: allAdmins
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get all project admins",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.getAllProjectAdminsEndpoint = getAllProjectAdminsEndpoint;
