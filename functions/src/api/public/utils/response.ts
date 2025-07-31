// /functions/src/api/public/utils/response.ts

import { Response } from "express";

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const sendSuccess = (res: Response, data?: any, message: string = "Success") => {
  const response: ApiResponse = {
    success: true,
    message,
    data,
  };
  return res.status(200).json(response);
};

export const sendError = (res: Response, message: string, statusCode: number = 400, error?: any) => {
  const response: ApiResponse = {
    success: false,
    message,
    error: error?.message || error,
  };
  return res.status(statusCode).json(response);
};

export const sendServerError = (res: Response, error?: any) => {
  console.error("API Error:", error);
  return sendError(
    res,
    "Internal server error. Please try again later.",
    500,
    error
  );
};

export const validateRequiredFields = (data: any, requiredFields: string[]): string[] => {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      missingFields.push(field);
    }
  }
  
  return missingFields;
}; 