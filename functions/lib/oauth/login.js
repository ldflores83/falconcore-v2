"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthLoginHandler = void 0;
const oauth_projects_1 = require("./oauth_projects");
const google_1 = require("./providers/google");
const microsoft_1 = require("./providers/microsoft");
const oauthLoginHandler = (req, res) => {
    const projectId = req.query.project_id;
    const config = oauth_projects_1.OAUTH_CONFIG_BY_PROJECT[projectId];
    if (!config) {
        res.status(400).json({ error: 'Invalid project_id' });
        return;
    }
    let authUrl = '';
    switch (config.provider) {
        case 'google':
            authUrl = (0, google_1.getGoogleAuthUrl)(config);
            break;
        case 'microsoft':
            authUrl = (0, microsoft_1.getMicrosoftAuthUrl)(config);
            break;
        default:
            res.status(400).json({ error: 'Unsupported provider' });
            return;
    }
    res.redirect(authUrl);
};
exports.oauthLoginHandler = oauthLoginHandler;
