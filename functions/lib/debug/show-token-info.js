"use strict";
// src/debug/show-token-info.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showTokenInfoHandler = void 0;
const axios_1 = __importDefault(require("axios"));
const showTokenInfoHandler = async (req, res) => {
    try {
        const accessToken = req.query.access_token;
        if (!accessToken) {
            res.status(400).json({ error: 'Missing access_token' });
            return;
        }
        const response = await axios_1.default.get('https://www.googleapis.com/oauth2/v1/tokeninfo', {
            params: { access_token: accessToken },
        });
        res.status(200).json({
            token_info: response.data,
        });
    }
    catch (error) {
        console.error('[showTokenInfoHandler] Error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data || error.message,
        });
    }
};
exports.showTokenInfoHandler = showTokenInfoHandler;
