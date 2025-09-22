export interface Claim {
  id: string;
  policyId: string;
  type: 'Life' | 'CI' | 'Accident' | 'Health';
  status: 'Intake' | 'Validation' | 'Analysis' | 'Decision' | 'Payment' | 'Closed';
  channel: 'WhatsApp' | 'Web' | 'App' | 'Email';
  beneficiaryNIK: string;
  beneficiaryName?: string;
  policyHolderNIK?: string;
  documents: Document[];
  checklistItems: ChecklistItem[];
  conversation?: Conversation;
  timeline: TimelineEntry[];
  slaDeadline: Date;
  slaStatus: 'Green' | 'Amber' | 'Red';
  redFlags?: string[];
  riskScore?: number;
  fraudIndicators?: FraudIndicator[];
  assignee?: string;
  decision?: Decision;
  aiAnalysis?: AIAnalysis;
  amlCheck?: AMLCheck;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  type: DocumentType;
  url: string;
  valid?: boolean;
  ocrStatus?: 'Matched' | 'Mismatch' | 'Pending' | 'Processing';
  ocrData?: any;
  uploadedAt: Date;
  processedAt?: Date;
}

export type DocumentType =
  | 'polis'
  | 'death_cert'
  | 'id_tertanggung'
  | 'id_beneficiary'
  | 'medical_report'
  | 'accident_report'
  | 'ci_diagnosis'
  | 'claim_form'
  | 'doctor_letter'
  | 'bank_account'
  | 'police_report'
  | 'family_relation'
  | 'medical_resume'
  | 'lab_result'
  | 'medical_bill'
  | 'medical_receipt';

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

export interface ChecklistItem {
  id: string;
  claimType: 'Life' | 'CI' | 'Accident' | 'Health';
  documentType: DocumentType;
  required: boolean;
  conditional?: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  notes?: string;
}

export interface Conversation {
  id: string;
  channel: 'WhatsApp' | 'Web' | 'App';
  transcript: Message[];
  startedAt: Date;
  endedAt?: Date;
}

export interface Message {
  sender: 'customer' | 'bot' | 'agent';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

export interface FraudIndicator {
  type: 'early_claim' | 'duplicate' | 'high_amount' | 'pattern_mismatch' | 'blacklist';
  severity: 'low' | 'medium' | 'high';
  description: string;
  confidence: number;
}

export interface AIAnalysis {
  eligibilityCheck: {
    eligible: boolean;
    reasons: string[];
  };
  documentCompleteness: number;
  riskScore: number;
  recommendedAction: 'auto_approve' | 'manual_review' | 'investigate' | 'deny';
  insights: string[];
  generatedAt: Date;
}

export interface AMLCheck {
  status: 'clear' | 'flagged' | 'pending';
  pepMatch: boolean;
  sanctionsMatch: boolean;
  nameMatchScore: number;
  checkedAt: Date;
}

export interface ApprovalRule {
  id: string;
  claimType: string;
  amountRange: {
    min: number;
    max: number;
  };
  requiredRoles: UserRole[];
  requiredApprovals: number;
  escalationSLA: number;
}

export type UserRole =
  | 'L1_Adjuster'
  | 'L2_Supervisor'
  | 'Manager'
  | 'Medical_Officer'
  | 'SIU_Investigator'
  | 'Finance'
  | 'Compliance'
  | 'Head'
  | 'Reinsurance_Coordinator';

export interface ClaimMetrics {
  ocrAccuracy: number;
  docClassificationF1: number;
  fraudFalsePositiveRate: number;
  autoApprovalRate: number;
  appealRate: number;
  slaCompliance: {
    intake: number;
    validation: number;
    decision: number;
    payment: number;
  };
}