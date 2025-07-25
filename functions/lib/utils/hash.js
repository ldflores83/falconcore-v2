"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdFromEmail = void 0;
// /functions/src/utils/hash.ts
const crypto_1 = __importDefault(require("crypto"));
const getUserIdFromEmail = (email) => {
    const salt = process.env.SYSTEM_SALT || "falconcore_default_salt";
    return crypto_1.default.createHmac("sha256", salt).update(email).digest("hex");
};
exports.getUserIdFromEmail = getUserIdFromEmail;
