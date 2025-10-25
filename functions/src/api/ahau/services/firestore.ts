import * as admin from 'firebase-admin';
import { TenantSettings, TenantMember, Draft } from '../types';

export class FirestoreService {
  private db: admin.firestore.Firestore;

  constructor() {
    this.db = admin.firestore();
  }

  async getTenantSettings(tenantId: string): Promise<TenantSettings | null> {
    try {
      const doc = await this.db.doc(`tenants/${tenantId}/settings/default`).get();
      return doc.exists ? (doc.data() as TenantSettings) : null;
    } catch (error) {
      console.error('Error getting tenant settings:', error);
      throw error;
    }
  }

  async upsertTenantSettings(tenantId: string, settings: Partial<TenantSettings>, updatedBy: string): Promise<void> {
    try {
      const updateData = {
        ...settings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy
      };

      await this.db.doc(`tenants/${tenantId}/settings/default`).set(updateData, { merge: true });
    } catch (error) {
      console.error('Error upserting tenant settings:', error);
      throw error;
    }
  }

  async listMembers(tenantId: string): Promise<TenantMember[]> {
    try {
      const snapshot = await this.db.collection(`tenants/${tenantId}/members`).get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as unknown as TenantMember;
      });
    } catch (error) {
      console.error('Error listing members:', error);
      throw error;
    }
  }

  async inviteMember(tenantId: string, email: string, role: string, createdBy: string): Promise<void> {
    try {
      const memberData = {
        email: email.toLowerCase(),
        role: role as 'admin' | 'member',
        status: 'invited',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy
      };

      // Use email hash as document ID to avoid duplicates
      const emailHash = this.hashEmail(email);
      await this.db.doc(`tenants/${tenantId}/members/${emailHash}`).set(memberData);
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  async updateMemberRole(tenantId: string, memberId: string, role: string): Promise<void> {
    try {
      await this.db.doc(`tenants/${tenantId}/members/${memberId}`).update({
        role: role as 'admin' | 'member'
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  async createDraft(tenantId: string, draft: Partial<Draft>, createdBy: string): Promise<string> {
    try {
      const draftData = {
        ...draft,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await this.db.collection(`tenants/${tenantId}/drafts`).add(draftData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating draft:', error);
      throw error;
    }
  }

  async listDrafts(tenantId: string, limit?: number): Promise<Draft[]> {
    try {
      let query = this.db.collection(`tenants/${tenantId}/drafts`).orderBy('createdAt', 'desc');
      
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as unknown as Draft;
      });
    } catch (error) {
      console.error('Error listing drafts:', error);
      throw error;
    }
  }

  private hashEmail(email: string): string {
    // Simple hash function for email
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
