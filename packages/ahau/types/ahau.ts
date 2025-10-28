export type Role = "admin" | "member";
export type UserStatus = "active" | "invited";

export interface Tenant {
  id: string;
  name: string;
  logoUrl?: string;
  createdAt: number;
  createdBy: string;
}

export interface TenantUser {
  uid: string;
  email: string;
  role: Role;
  status: UserStatus;
  addedAt: number;
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface UserInviteRequest {
  tenantId: string;
  email: string;
}

export interface TenantUpdateRequest {
  tenantId: string;
  name?: string;
  logoUrl?: string;
}

export interface DraftCreateRequest {
  tenantId: string;
  title: string;
  content: string;
}
