import * as admin from 'firebase-admin';

export type Role = 'admin' | 'member';
export type MemberStatus = 'active' | 'invited';

export interface TenantSettings {
  tenantName: string;
  logoUrl?: string;
  primaryTopic: string;
  about?: string;
  updatedAt: admin.firestore.Timestamp;
  updatedBy: string;
}

export interface TenantMember {
  email: string;
  displayName?: string;
  role: Role;
  status: MemberStatus;
  createdAt: admin.firestore.Timestamp;
  createdBy: string;
}

export interface Draft {
  title: string;
  content: string;
  topic?: string;
  createdAt: admin.firestore.Timestamp;
  createdBy: string;
  updatedAt: admin.firestore.Timestamp;
}

export interface ContentGenerationRequest {
  tenantId: string;
  prompt: string;
  topic?: string;
}

export interface ContentGenerationResponse {
  text: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface TenantSettingsUpdateRequest {
  tenantName?: string;
  logoUrl?: string;
  primaryTopic?: string;
  about?: string;
}

export interface MemberInviteRequest {
  email: string;
  role: Role;
}

export interface MemberUpdateRequest {
  role?: Role;
}
