// functions/src/api/auth/getProjectAdmin.ts

import { Request, Response } from 'express';
import { getProjectAdmin, getAllProjectAdmins } from '../../config/projectAdmins';

export const getProjectAdminEndpoint = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: projectId"
      });
    }

    const adminEmail = getProjectAdmin(projectId as string);

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

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get project admin",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const getAllProjectAdminsEndpoint = async (req: Request, res: Response) => {
  try {
    const allAdmins = getAllProjectAdmins();

    return res.status(200).json({
      success: true,
      message: "All project admins retrieved successfully",
      data: allAdmins
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get all project admins",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
