"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedInClient = void 0;
const admin = __importStar(require("firebase-admin"));
// Type guard functions
function isLinkedInPostResponse(obj) {
    return typeof obj === 'object' && obj !== null && 'id' in obj && typeof obj.id === 'string';
}
function isLinkedInMetricsResponse(obj) {
    return typeof obj === 'object' && obj !== null;
}
function isLinkedInPersonResponse(obj) {
    return typeof obj === 'object' && obj !== null && 'id' in obj && typeof obj.id === 'string';
}
class LinkedInClient {
    constructor(accessToken, organizationId) {
        this.accessToken = accessToken;
        this.organizationId = organizationId;
    }
    async publishPost(content, isCompanyPage = false) {
        const postData = {
            author: isCompanyPage && this.organizationId
                ? `urn:li:organization:${this.organizationId}`
                : 'urn:li:person:' + await this.getPersonId(),
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: content
                    },
                    shareMediaCategory: 'NONE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        };
        const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(postData)
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`LinkedIn API error: ${response.status} - ${error}`);
        }
        const result = await response.json();
        if (!isLinkedInPostResponse(result)) {
            throw new Error('Invalid LinkedIn API response format');
        }
        return result.id;
    }
    async getPostMetrics(postId) {
        const response = await fetch(`https://api.linkedin.com/v2/socialMetrics/${postId}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch LinkedIn metrics: ${response.status}`);
        }
        const data = await response.json();
        if (!isLinkedInMetricsResponse(data)) {
            throw new Error('Invalid LinkedIn metrics API response format');
        }
        const statistics = data.totalShareStatistics || {};
        return {
            impressions: statistics.impressionCount || 0,
            likes: statistics.likeCount || 0,
            comments: statistics.commentCount || 0,
            shares: statistics.shareCount || 0,
            engagementRate: this.calculateEngagementRate(statistics)
        };
    }
    async getPersonId() {
        const response = await fetch('https://api.linkedin.com/v2/me', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to get LinkedIn person ID');
        }
        const data = await response.json();
        if (!isLinkedInPersonResponse(data)) {
            throw new Error('Invalid LinkedIn person API response format');
        }
        return data.id;
    }
    calculateEngagementRate(statistics) {
        const totalEngagement = (statistics.likeCount || 0) +
            (statistics.commentCount || 0) +
            (statistics.shareCount || 0);
        const impressions = statistics.impressionCount || 1;
        return Math.round((totalEngagement / impressions) * 100 * 100) / 100; // 2 decimal places
    }
    static async getClientForTenant(tenantId) {
        const db = admin.firestore();
        const tenantDoc = await db.doc(`tenants/${tenantId}`).get();
        if (!tenantDoc.exists) {
            throw new Error('Tenant not found');
        }
        const tenantData = tenantDoc.data();
        const linkedInToken = tenantData?.linkedInToken;
        const organizationId = tenantData?.linkedInOrganizationId;
        if (!linkedInToken) {
            throw new Error('LinkedIn token not configured for this tenant');
        }
        return new LinkedInClient(linkedInToken, organizationId);
    }
}
exports.LinkedInClient = LinkedInClient;
