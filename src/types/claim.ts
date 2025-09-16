export interface Claim {
  id: string;
  policyId: string;
  type: 'Life' | 'CI' | 'Accident';
  status: 'Received' | 'Verification' | 'Decision' | 'Payment' | 'Closed';
  beneficiaryNIK: string;
  beneficiaryName?: string;
  documents: Document[];
  timeline: TimelineEntry[];
  slaDeadline: Date;
  slaStatus: 'Green' | 'Amber' | 'Red';
  redFlags?: string[];
  assignee?: string;
  decision?: Decision;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  type: 'death_cert' | 'id' | 'medical_report' | 'accident_report' | 'ci_diagnosis';
  url: string;
  valid?: boolean;
  ocrStatus?: 'Matched' | 'Mismatch' | 'Pending';
}

export interface TimelineEntry {
  stage: string;
  date: string;
  description?: string;
}

export interface Policy {
  id: string;
  status: 'Active' | 'Lapsed' | 'Terminated';
  product: 'Life' | 'CI' | 'Accident';
  holderName: string;
  holderNIK: string;
  beneficiaries: Beneficiary[];
}

export interface Beneficiary {
  name: string;
  nik: string;
  relationship: string;
  percentage: number;
  matchScore?: number;
}

export interface RuleOutcome {
  causeOfDeath?: string;
  exclusionMatch: boolean;
  diagnosisValid?: boolean;
  accidentValid?: boolean;
  evidence: string[];
}

export interface Decision {
  status: 'Pending' | 'Approved' | 'PartialApproved' | 'Denied';
  amount?: number;
  reason?: string;
  requiredApprovals: number;
  currentApprovals: number;
  approvers: Approver[];
}

export interface Approver {
  userId: string;
  name: string;
  approvedAt?: Date;
  comments?: string;
}

export interface ClaimInitiateRequest {
  policyId: string;
  type: 'Life' | 'CI' | 'Accident';
  beneficiaryNIK: string;
  documents: {
    type: string;
    url: string;
  }[];
}

export interface ClaimStatusResponse {
  id: string;
  status: string;
  timeline: TimelineEntry[];
  missingDocs: string[];
}