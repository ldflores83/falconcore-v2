"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerFactory = providerFactory;
const GoogleDriveProvider_1 = require("../providers/GoogleDriveProvider");
function providerFactory(provider, accessToken) {
    switch (provider) {
        case 'google':
            return new GoogleDriveProvider_1.GoogleDriveProvider(accessToken);
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}
