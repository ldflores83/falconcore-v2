import * as admin from 'firebase-admin';

interface LinkedInPost {
  author: string;
  lifecycleState: string;
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string;
      };
      shareMediaCategory: string;
    };
  };
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': string;
  };
}

interface LinkedInMetrics {
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate?: number;
}

interface LinkedInStatistics {
  impressionCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
}

// LinkedIn API response interfaces
interface LinkedInPostResponse {
  id: string;
}

interface LinkedInMetricsResponse {
  totalShareStatistics?: LinkedInStatistics;
}

interface LinkedInPersonResponse {
  id: string;
}

// Type guard functions
function isLinkedInPostResponse(obj: unknown): obj is LinkedInPostResponse {
  return typeof obj === 'object' && obj !== null && 'id' in obj && typeof (obj as any).id === 'string';
}

function isLinkedInMetricsResponse(obj: unknown): obj is LinkedInMetricsResponse {
  return typeof obj === 'object' && obj !== null;
}

function isLinkedInPersonResponse(obj: unknown): obj is LinkedInPersonResponse {
  return typeof obj === 'object' && obj !== null && 'id' in obj && typeof (obj as any).id === 'string';
}

export class LinkedInClient {
  private accessToken: string;
  private organizationId?: string;

  constructor(accessToken: string, organizationId?: string) {
    this.accessToken = accessToken;
    this.organizationId = organizationId;
  }

  async publishPost(content: string, isCompanyPage: boolean = false): Promise<string> {
    const postData: LinkedInPost = {
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

  async getPostMetrics(postId: string): Promise<LinkedInMetrics> {
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
    const statistics: LinkedInStatistics = data.totalShareStatistics || {};
    
    return {
      impressions: statistics.impressionCount || 0,
      likes: statistics.likeCount || 0,
      comments: statistics.commentCount || 0,
      shares: statistics.shareCount || 0,
      engagementRate: this.calculateEngagementRate(statistics)
    };
  }

  private async getPersonId(): Promise<string> {
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

  private calculateEngagementRate(statistics: LinkedInStatistics): number {
    const totalEngagement = (statistics.likeCount || 0) + 
                           (statistics.commentCount || 0) + 
                           (statistics.shareCount || 0);
    const impressions = statistics.impressionCount || 1;
    
    return Math.round((totalEngagement / impressions) * 100 * 100) / 100; // 2 decimal places
  }

  static async getClientForTenant(tenantId: string): Promise<LinkedInClient> {
    const db = admin.firestore();
    const tenantDoc = await db.doc(`tenants/${tenantId}`).get();
    
    if (!tenantDoc.exists) {
      throw new Error('Tenant not found');
    }

    const tenantData = tenantDoc.data() as any;
    const linkedInToken = tenantData?.linkedInToken;
    const organizationId = tenantData?.linkedInOrganizationId;

    if (!linkedInToken) {
      throw new Error('LinkedIn token not configured for this tenant');
    }

    return new LinkedInClient(linkedInToken, organizationId);
  }
}
