"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSubmissionStatus = void 0;
const GoogleDriveProvider_1 = require("../../storage/providers/GoogleDriveProvider");
const getOAuthCredentials_1 = require("../../oauth/getOAuthCredentials");
const checkSubmissionStatus = async (req, res) => {
    console.log('🚀 checkSubmissionStatus handler called with:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    try {
        const { projectId } = req.body;
        const projectIdFinal = projectId || 'onboardingaudit';
        const maxPending = 6;
        // Get admin OAuth credentials
        const adminUserId = `luisdaniel883@gmail.com_${projectIdFinal}`;
        const credentials = await (0, getOAuthCredentials_1.getOAuthCredentials)(adminUserId);
        if (!credentials) {
            console.log('⚠️ No OAuth credentials found for admin user:', adminUserId);
            return res.status(500).json({
                success: false,
                canSubmit: false,
                pendingCount: 0,
                maxPending,
                message: "Service temporarily unavailable. Please try again later."
            });
        }
        // Get admin folder and count pending submissions
        const provider = new GoogleDriveProvider_1.GoogleDriveProvider();
        const adminFolderId = await provider.createFolderWithTokens('luisdaniel883@gmail.com', projectIdFinal, credentials.accessToken, credentials.refreshToken);
        // List all subfolders to count pending submissions
        const folders = await provider.listFilesWithTokens(adminFolderId, credentials.accessToken, credentials.refreshToken);
        // Count pending submissions (folders)
        const pendingSubmissions = folders.filter(folder => folder.mimeType === 'application/vnd.google-apps.folder');
        const pendingCount = pendingSubmissions.length;
        const canSubmit = pendingCount < maxPending;
        console.log('📊 Submission status check:', {
            projectId: projectIdFinal,
            pendingCount,
            maxPending,
            canSubmit
        });
        const response = {
            success: true,
            canSubmit,
            pendingCount,
            maxPending,
            message: canSubmit
                ? undefined
                : `We are currently working on ${pendingCount} pending requests. Please try again later when more slots become available.`
        };
        return res.status(200).json(response);
    }
    catch (error) {
        console.error("❌ Error in checkSubmissionStatus:", error);
        return res.status(500).json({
            success: false,
            canSubmit: false,
            pendingCount: 0,
            maxPending: 6,
            message: "Internal server error. Please try again later."
        });
    }
};
exports.checkSubmissionStatus = checkSubmissionStatus;
