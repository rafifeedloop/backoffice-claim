// CMS API Client Utility
// This utility provides easy access to all CMS API endpoints

class CMSApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Claims Management
  async getClaims(params?: {
    status?: string;
    assignedTo?: string;
    priority?: string;
    channel?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/api/cms/claims?${searchParams}`);
    return response.json();
  }

  async getClaimById(id: string) {
    const response = await fetch(`${this.baseUrl}/api/cms/claims/${id}`);
    return response.json();
  }

  async updateClaim(id: string, updates: any, updatedBy?: string) {
    const response = await fetch(`${this.baseUrl}/api/cms/claims/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, updatedBy })
    });
    return response.json();
  }

  async closeClaim(id: string) {
    const response = await fetch(`${this.baseUrl}/api/cms/claims/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // Statistics & Analytics
  async getStatistics() {
    const response = await fetch(`${this.baseUrl}/api/cms/claims/stats`);
    return response.json();
  }

  // Search & Export
  async searchClaims(params: {
    q?: string;
    field?: string;
    status?: string;
    priority?: string;
    riskLevel?: string;
    slaStatus?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/api/cms/claims/search?${searchParams}`);
    return response.json();
  }

  async exportClaims(format: 'json' | 'csv' | 'summary', dateFrom?: string, dateTo?: string) {
    const searchParams = new URLSearchParams({ format });
    if (dateFrom) searchParams.append('dateFrom', dateFrom);
    if (dateTo) searchParams.append('dateTo', dateTo);

    const response = await fetch(`${this.baseUrl}/api/cms/claims/export?${searchParams}`);

    if (format === 'csv') {
      return response.text();
    }
    return response.json();
  }

  // Claim Operations
  async addNote(claimId: string, text: string, createdBy?: string) {
    const response = await fetch(`${this.baseUrl}/api/cms/claims/${claimId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, createdBy })
    });
    return response.json();
  }

  async getNotes(claimId: string) {
    const response = await fetch(`${this.baseUrl}/api/cms/claims/${claimId}/notes`);
    return response.json();
  }

  async assignClaim(claimId: string, assignedTo: string, assignedBy?: string) {
    const response = await fetch(`${this.baseUrl}/api/cms/claims/${claimId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedTo, assignedBy })
    });
    return response.json();
  }

  async getAssignmentHistory(claimId: string) {
    const response = await fetch(`${this.baseUrl}/api/cms/claims/${claimId}/assign`);
    return response.json();
  }

  async getAuditLog(claimId: string) {
    const response = await fetch(`${this.baseUrl}/api/cms/claims/${claimId}/audit-log`);
    return response.json();
  }

  // Bulk Operations
  async bulkOperation(action: string, claimIds: string[], data?: any, performedBy?: string) {
    const response = await fetch(`${this.baseUrl}/api/cms/claims/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, claimIds, data, performedBy })
    });
    return response.json();
  }

  async bulkAssign(claimIds: string[], assignedTo: string, performedBy?: string) {
    return this.bulkOperation('assign', claimIds, { assignedTo }, performedBy);
  }

  async bulkUpdateStatus(claimIds: string[], status: string, performedBy?: string) {
    return this.bulkOperation('updateStatus', claimIds, { status }, performedBy);
  }

  async bulkUpdatePriority(claimIds: string[], priority: string, performedBy?: string) {
    return this.bulkOperation('updatePriority', claimIds, { priority }, performedBy);
  }

  async bulkAddNote(claimIds: string[], note: string, performedBy?: string) {
    return this.bulkOperation('addNote', claimIds, { note }, performedBy);
  }

  async bulkClose(claimIds: string[], performedBy?: string) {
    return this.bulkOperation('close', claimIds, {}, performedBy);
  }
}

// Create singleton instance
const cmsApi = new CMSApiClient();
export default cmsApi;

// Named exports for specific use cases
export const {
  getClaims,
  getClaimById,
  updateClaim,
  closeClaim,
  getStatistics,
  searchClaims,
  exportClaims,
  addNote,
  getNotes,
  assignClaim,
  getAssignmentHistory,
  getAuditLog,
  bulkAssign,
  bulkUpdateStatus,
  bulkUpdatePriority,
  bulkAddNote,
  bulkClose
} = cmsApi;