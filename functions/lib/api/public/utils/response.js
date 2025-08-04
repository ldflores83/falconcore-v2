"use strict";
// /functions/src/api/public/utils/response.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequiredFields = exports.sendServerError = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = "Success") => {
    const response = {
        success: true,
        message,
        data,
    };
    return res.status(200).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400, error) => {
    const response = {
        success: false,
        message,
        error: error?.message || error,
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
const sendServerError = (res, error) => {
    console.error("API Error:", error);
    return (0, exports.sendError)(res, "Internal server error. Please try again later.", 500, error);
};
exports.sendServerError = sendServerError;
const validateRequiredFields = (data, requiredFields) => {
    const missingFields = [];
    for (const field of requiredFields) {
        if (!data[field]) {
            missingFields.push(field);
        }
    }
    return missingFields;
};
exports.validateRequiredFields = validateRequiredFields;
