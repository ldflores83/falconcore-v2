export interface Product {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'development' | 'beta';
  frontendUrl: string;
  features: Record<string, boolean>;
  collections: Record<string, string>;
  storageBucket: string;
  lastUpdated: string;
}

export interface ProductStats {
  productId: string;
  totalVisits: number;
  totalSubmissions: number;
  totalWaitlist: number;
  conversionRate: number;
  lastActivity: string;
}

export interface WaitlistEntry {
  id: string;
  productName: string;
  website: string;
  email: string;
  projectId: string;
  timestamp: Date;
  status: 'waiting' | 'notified' | 'converted';
  name?: string;
  company?: string;
  role?: string;
}

export interface Submission {
  id: string;
  projectId: string;
  email: string;
  status: 'pending' | 'synced' | 'in_progress' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export interface GlobalStats {
  totalProducts: number;
  totalVisits: number;
  totalSubmissions: number;
  totalWaitlist: number;
  activeUsers: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'visit' | 'submission' | 'waitlist' | 'status_change';
  productId: string;
  productName: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface AuthUser {
  email: string;
  clientId: string;
  permissions: string[];
  lastLogin: string;
}
