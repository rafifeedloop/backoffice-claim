interface Claim {
  id: string;
  policyNumber: string;
  claimType: string;
  nik: string;
  dateOfBirth: string;
  incidentDate: string;
  description: string;
  documents: Array<{
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  status: 'Intake' | 'Document Review' | 'Validation' | 'Investigation' | 'Decision' | 'Approved' | 'Rejected' | 'Closed';
  amount?: number;
  beneficiaryName: string;
  beneficiaryNIK: string;
  submittedAt: string;
  updatedAt: string;
  assignedTo?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  slaDeadline: string;
  slaStatus: 'Green' | 'Yellow' | 'Red';
  decision?: {
    status: string;
    amount: number;
    reason: string;
    comments: string;
    decidedBy: string;
    decidedAt: string;
  };
  notes: Array<{
    id: string;
    text: string;
    createdBy: string;
    createdAt: string;
  }>;
  auditLog: Array<{
    id: string;
    action: string;
    description: string;
    performedBy: string;
    performedAt: string;
    changes?: any;
  }>;
  channel: 'Web' | 'WhatsApp' | 'Email' | 'Phone';
  fraudScore?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
}

class ClaimStore {
  private claims: Map<string, Claim> = new Map();

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleClaims: Claim[] = [
      {
        id: 'CLM-2024-000001',
        policyNumber: 'POL-2024-123456',
        claimType: 'Life',
        nik: '3217050801900001',
        dateOfBirth: '1990-08-01',
        incidentDate: '2024-01-15',
        description: 'Life insurance claim for policy holder',
        documents: [
          { name: 'death_certificate.pdf', type: 'death_cert', url: '/docs/death_cert_001.pdf', uploadedAt: '2024-01-20T10:00:00Z' },
          { name: 'policy_document.pdf', type: 'policy', url: '/docs/policy_001.pdf', uploadedAt: '2024-01-20T10:05:00Z' }
        ],
        status: 'Document Review',
        beneficiaryName: 'John Doe',
        beneficiaryNIK: '3217050801900002',
        submittedAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-22T14:30:00Z',
        assignedTo: 'adjuster1@company.com',
        priority: 'High',
        slaDeadline: '2024-01-27T23:59:59Z',
        slaStatus: 'Green',
        notes: [],
        auditLog: [
          {
            id: '1',
            action: 'CLAIM_SUBMITTED',
            description: 'Claim submitted via Web',
            performedBy: 'system',
            performedAt: '2024-01-20T10:00:00Z'
          },
          {
            id: '2',
            action: 'STATUS_CHANGED',
            description: 'Status changed from Intake to Document Review',
            performedBy: 'adjuster1@company.com',
            performedAt: '2024-01-22T14:30:00Z',
            changes: { from: 'Intake', to: 'Document Review' }
          }
        ],
        channel: 'Web',
        fraudScore: 15,
        riskLevel: 'Low'
      },
      {
        id: 'CLM-2024-000002',
        policyNumber: 'POL-2024-789012',
        claimType: 'Health',
        nik: '3217050801850001',
        dateOfBirth: '1985-05-15',
        incidentDate: '2024-01-18',
        description: 'Medical reimbursement for hospitalization',
        documents: [
          { name: 'medical_receipt.pdf', type: 'receipt', url: '/docs/receipt_002.pdf', uploadedAt: '2024-01-19T09:00:00Z' },
          { name: 'diagnosis.pdf', type: 'diagnosis', url: '/docs/diagnosis_002.pdf', uploadedAt: '2024-01-19T09:10:00Z' }
        ],
        status: 'Validation',
        amount: 15000000,
        beneficiaryName: 'Jane Smith',
        beneficiaryNIK: '3217050801850001',
        submittedAt: '2024-01-19T09:00:00Z',
        updatedAt: '2024-01-23T11:00:00Z',
        assignedTo: 'adjuster2@company.com',
        priority: 'Medium',
        slaDeadline: '2024-01-26T23:59:59Z',
        slaStatus: 'Yellow',
        notes: [
          {
            id: '1',
            text: 'Waiting for hospital verification',
            createdBy: 'adjuster2@company.com',
            createdAt: '2024-01-23T11:00:00Z'
          }
        ],
        auditLog: [
          {
            id: '1',
            action: 'CLAIM_SUBMITTED',
            description: 'Claim submitted via WhatsApp',
            performedBy: 'system',
            performedAt: '2024-01-19T09:00:00Z'
          }
        ],
        channel: 'WhatsApp',
        fraudScore: 25,
        riskLevel: 'Medium'
      },
      {
        id: 'CLM-2024-000003',
        policyNumber: 'POL-2024-345678',
        claimType: 'Accident',
        nik: '3217050801920001',
        dateOfBirth: '1992-03-20',
        incidentDate: '2024-01-10',
        description: 'Motorcycle accident claim',
        documents: [
          { name: 'police_report.pdf', type: 'police_report', url: '/docs/police_003.pdf', uploadedAt: '2024-01-11T15:00:00Z' }
        ],
        status: 'Investigation',
        beneficiaryName: 'Robert Johnson',
        beneficiaryNIK: '3217050801920001',
        submittedAt: '2024-01-11T15:00:00Z',
        updatedAt: '2024-01-24T09:00:00Z',
        priority: 'High',
        slaDeadline: '2024-01-18T23:59:59Z',
        slaStatus: 'Red',
        notes: [],
        auditLog: [],
        channel: 'Web',
        fraudScore: 45,
        riskLevel: 'High'
      }
    ];

    sampleClaims.forEach(claim => {
      this.claims.set(claim.id, claim);
    });
  }

  // Get all claims with optional filtering
  getAllClaims(filters?: {
    status?: string;
    assignedTo?: string;
    priority?: string;
    channel?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Claim[] {
    let claims = Array.from(this.claims.values());

    if (filters) {
      if (filters.status) {
        claims = claims.filter(c => c.status === filters.status);
      }
      if (filters.assignedTo) {
        claims = claims.filter(c => c.assignedTo === filters.assignedTo);
      }
      if (filters.priority) {
        claims = claims.filter(c => c.priority === filters.priority);
      }
      if (filters.channel) {
        claims = claims.filter(c => c.channel === filters.channel);
      }
      if (filters.dateFrom) {
        claims = claims.filter(c => new Date(c.submittedAt) >= new Date(filters.dateFrom!));
      }
      if (filters.dateTo) {
        claims = claims.filter(c => new Date(c.submittedAt) <= new Date(filters.dateTo!));
      }
    }

    return claims.sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  // Get claim by ID
  getClaimById(id: string): Claim | undefined {
    return this.claims.get(id);
  }

  // Create new claim
  createClaim(claimData: Partial<Claim>): Claim {
    const claimId = `CLM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;

    const newClaim: Claim = {
      id: claimId,
      policyNumber: claimData.policyNumber || '',
      claimType: claimData.claimType || '',
      nik: claimData.nik || '',
      dateOfBirth: claimData.dateOfBirth || '',
      incidentDate: claimData.incidentDate || '',
      description: claimData.description || '',
      documents: claimData.documents || [],
      status: 'Intake',
      beneficiaryName: claimData.beneficiaryName || '',
      beneficiaryNIK: claimData.beneficiaryNIK || claimData.nik || '',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: 'Medium',
      slaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      slaStatus: 'Green',
      notes: [],
      auditLog: [
        {
          id: '1',
          action: 'CLAIM_SUBMITTED',
          description: `Claim submitted via ${claimData.channel || 'Web'}`,
          performedBy: 'system',
          performedAt: new Date().toISOString()
        }
      ],
      channel: claimData.channel || 'Web',
      fraudScore: Math.floor(Math.random() * 50),
      riskLevel: 'Low'
    };

    this.claims.set(claimId, newClaim);
    return newClaim;
  }

  // Update claim
  updateClaim(id: string, updates: Partial<Claim>, updatedBy: string = 'system'): Claim | undefined {
    const claim = this.claims.get(id);
    if (!claim) return undefined;

    const updatedClaim = {
      ...claim,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Add audit log entry for the update
    updatedClaim.auditLog.push({
      id: String(claim.auditLog.length + 1),
      action: 'CLAIM_UPDATED',
      description: 'Claim details updated',
      performedBy: updatedBy,
      performedAt: new Date().toISOString(),
      changes: updates
    });

    this.claims.set(id, updatedClaim);
    return updatedClaim;
  }

  // Add note to claim
  addNote(claimId: string, note: string, createdBy: string): boolean {
    const claim = this.claims.get(claimId);
    if (!claim) return false;

    claim.notes.push({
      id: String(claim.notes.length + 1),
      text: note,
      createdBy,
      createdAt: new Date().toISOString()
    });

    claim.auditLog.push({
      id: String(claim.auditLog.length + 1),
      action: 'NOTE_ADDED',
      description: 'Note added to claim',
      performedBy: createdBy,
      performedAt: new Date().toISOString()
    });

    claim.updatedAt = new Date().toISOString();
    return true;
  }

  // Get statistics
  getStatistics() {
    const claims = Array.from(this.claims.values());
    const total = claims.length;
    const byStatus = claims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = claims.reduce((acc, claim) => {
      acc[claim.priority] = (acc[claim.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byChannel = claims.reduce((acc, claim) => {
      acc[claim.channel] = (acc[claim.channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = claims.reduce((sum, claim) => sum + (claim.amount || 0), 0);

    return {
      total,
      byStatus,
      byPriority,
      byChannel,
      totalAmount,
      averageProcessingTime: '3.5 days',
      slaCompliance: 85,
      pendingClaims: claims.filter(c => ['Intake', 'Document Review', 'Validation', 'Investigation'].includes(c.status)).length,
      approvedThisMonth: claims.filter(c => c.status === 'Approved').length,
      rejectedThisMonth: claims.filter(c => c.status === 'Rejected').length
    };
  }

  // Assign claim to adjuster
  assignClaim(claimId: string, assignedTo: string, assignedBy: string): boolean {
    const claim = this.claims.get(claimId);
    if (!claim) return false;

    const previousAssignee = claim.assignedTo;
    claim.assignedTo = assignedTo;
    claim.updatedAt = new Date().toISOString();

    claim.auditLog.push({
      id: String(claim.auditLog.length + 1),
      action: 'CLAIM_ASSIGNED',
      description: `Claim assigned to ${assignedTo}`,
      performedBy: assignedBy,
      performedAt: new Date().toISOString(),
      changes: { from: previousAssignee, to: assignedTo }
    });

    return true;
  }
}

// Create singleton instance
const claimStore = new ClaimStore();
export default claimStore;