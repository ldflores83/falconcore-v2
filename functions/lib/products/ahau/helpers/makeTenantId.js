"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTenantId = makeTenantId;
function makeTenantId(name) {
    const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 30);
    const suffix = Math.random().toString(36).slice(2, 8);
    return `ahau_${slug || 'workspace'}_${suffix}`;
}
