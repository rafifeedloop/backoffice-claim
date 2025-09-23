import { UserRole, ApprovalRule, Claim, Decision } from '@/types/claim';

export interface ApprovalRequirement {
  roles: UserRole[];
  minApprovals: number;
  mandatoryRoles?: UserRole[];
  escalationTimeHours: number;
}

export const approvalMatrix: Record<string, ApprovalRequirement[]> = {
  'low': [
    {
      roles: ['L1_Adjuster', 'L2_Supervisor'],
      minApprovals: 2,
      escalationTimeHours: 24
    }
  ],
  'medium': [
    {
      roles: ['L2_Supervisor', 'Manager'],
      minApprovals: 2,
      escalationTimeHours: 48
    }
  ],
  'high': [
    {
      roles: ['Manager', 'Head', 'Compliance'],
      minApprovals: 2,
      mandatoryRoles: ['Head'],
      escalationTimeHours: 72
    }
  ],
  'fraud_flagged': [
    {
      roles: ['SIU_Investigator', 'Manager', 'Compliance'],
      minApprovals: 2,
      mandatoryRoles: ['SIU_Investigator'],
      escalationTimeHours: 96
    }
  ],
  'medical_required': [
    {
      roles: ['Medical_Officer', 'L2_Supervisor'],
      minApprovals: 2,
      mandatoryRoles: ['Medical_Officer'],
      escalationTimeHours: 48
    }
  ],
  'reinsurance': [
    {
      roles: ['Reinsurance_Coordinator', 'Head', 'Finance'],
      minApprovals: 3,
      mandatoryRoles: ['Reinsurance_Coordinator', 'Head'],
      escalationTimeHours: 120
    }
  ]
};

export function getApprovalLevel(amount: number): string {
  if (amount <= 50000000) return 'low';           // <= IDR 50M
  if (amount <= 250000000) return 'medium';       // 50M - 250M
  return 'high';                                   // > 250M
}

export function getRequiredApprovals(claim: Claim): ApprovalRequirement {
  const amount = claim.decision?.amount || 0;
  let level = getApprovalLevel(amount);

  // Special conditions override standard levels
  if (claim.fraudIndicators && claim.fraudIndicators.length > 0) {
    const hasHighSeverity = claim.fraudIndicators.some(f => f.severity === 'high');
    if (hasHighSeverity || (claim.riskScore && claim.riskScore >= 0.7)) {
      return approvalMatrix['fraud_flagged'][0];
    }
  }

  if (claim.type === 'CI' || claim.type === 'Health') {
    return approvalMatrix['medical_required'][0];
  }

  // Check if reinsurance is needed (exceeds retention limit)
  const retentionLimit = 1000000000; // IDR 1B
  if (amount > retentionLimit) {
    return approvalMatrix['reinsurance'][0];
  }

  return approvalMatrix[level][0];
}

export interface ApprovalAction {
  userId: string;
  userRole: UserRole;
  action: 'approve' | 'reject' | 'request_info';
  comments?: string;
  timestamp: Date;
}

export class ApprovalManager {
  private approvals: Map<string, ApprovalAction[]> = new Map();

  addApproval(claimId: string, action: ApprovalAction): boolean {
    const existing = this.approvals.get(claimId) || [];

    // Check if user already approved
    const hasApproved = existing.some(a => a.userId === action.userId);
    if (hasApproved) {
      return false;
    }

    existing.push(action);
    this.approvals.set(claimId, existing);
    return true;
  }

  checkApprovalStatus(claim: Claim): {
    isComplete: boolean;
    currentApprovals: number;
    requiredApprovals: number;
    missingRoles: UserRole[];
    canAutoApprove: boolean;
  } {
    const requirement = getRequiredApprovals(claim);
    const claimApprovals = this.approvals.get(claim.id) || [];
    const approvedActions = claimApprovals.filter(a => a.action === 'approve');

    // Check mandatory roles
    const missingRoles: UserRole[] = [];
    if (requirement.mandatoryRoles) {
      requirement.mandatoryRoles.forEach(role => {
        const hasRole = approvedActions.some(a => a.userRole === role);
        if (!hasRole) {
          missingRoles.push(role);
        }
      });
    }

    const isComplete =
      approvedActions.length >= requirement.minApprovals &&
      missingRoles.length === 0;

    // Auto-approval conditions
    const canAutoApprove =
      claim.aiAnalysis?.recommendedAction === 'auto_approve' &&
      (claim.riskScore || 1) < 0.3 &&
      claim.aiAnalysis?.documentCompleteness >= 95 &&
      (claim.amlCheck?.nameMatchScore || 0) >= 0.9 &&
      (claim.decision?.amount || 0) < 50000000;

    return {
      isComplete,
      currentApprovals: approvedActions.length,
      requiredApprovals: requirement.minApprovals,
      missingRoles,
      canAutoApprove
    };
  }

  getApprovalChain(claimId: string): ApprovalAction[] {
    return this.approvals.get(claimId) || [];
  }

  generateApprovalMatrix(claim: Claim): {
    level: string;
    requirement: ApprovalRequirement;
    progress: {
      role: UserRole;
      required: boolean;
      approved: boolean;
      approver?: string;
      timestamp?: Date;
    }[];
  } {
    const amount = claim.decision?.amount || 0;
    const level = getApprovalLevel(amount);
    const requirement = getRequiredApprovals(claim);
    const claimApprovals = this.approvals.get(claim.id) || [];

    const progress = requirement.roles.map(role => {
      const approval = claimApprovals.find(
        a => a.userRole === role && a.action === 'approve'
      );

      return {
        role,
        required: requirement.mandatoryRoles?.includes(role) || false,
        approved: !!approval,
        approver: approval?.userId,
        timestamp: approval?.timestamp
      };
    });

    return {
      level,
      requirement,
      progress
    };
  }

  canUserApprove(userId: string, userRole: UserRole, claim: Claim): boolean {
    const requirement = getRequiredApprovals(claim);

    // Check if user's role is in the required roles
    if (!requirement.roles.includes(userRole)) {
      return false;
    }

    // Check if user has already approved
    const claimApprovals = this.approvals.get(claim.id) || [];
    const hasApproved = claimApprovals.some(a => a.userId === userId);

    return !hasApproved;
  }

  escalateIfNeeded(claim: Claim): {
    shouldEscalate: boolean;
    escalationLevel?: string;
    notifyRoles?: UserRole[];
  } {
    const requirement = getRequiredApprovals(claim);
    const claimAge = Math.floor(
      (Date.now() - new Date(claim.createdAt).getTime()) / (1000 * 60 * 60)
    );

    if (claimAge > requirement.escalationTimeHours) {
      // Determine next escalation level
      const currentLevel = getApprovalLevel(claim.decision?.amount || 0);
      const escalationMap: Record<string, string> = {
        'low': 'medium',
        'medium': 'high',
        'high': 'high' // Max level
      };

      const nextLevel = escalationMap[currentLevel];
      const nextRequirement = approvalMatrix[nextLevel][0];

      return {
        shouldEscalate: true,
        escalationLevel: nextLevel,
        notifyRoles: nextRequirement.roles
      };
    }

    return { shouldEscalate: false };
  }
}

export const approvalManager = new ApprovalManager();

export function generateDecisionLetter(
  claim: Claim,
  decision: Decision
): string {
  const isApproved = decision.status === 'Approved';
  const isPartial = decision.status === 'PartialApproved';

  let letter = `
Dear ${claim.beneficiaryName || 'Valued Customer'},

RE: Claim Decision - ${claim.id}
Policy Number: ${claim.policyId}

We have completed our review of your ${claim.type} insurance claim.

DECISION: ${decision.status.toUpperCase()}
`;

  if (isApproved || isPartial) {
    letter += `
APPROVED AMOUNT: IDR ${decision.amount?.toLocaleString()}

The approved benefit will be processed for payment within 24 hours to your registered bank account.
`;
  } else {
    letter += `
REASON: ${decision.reason}

Please contact our customer service for more information.
`;
  }

  letter += `

If you have any questions about this decision, please contact our Claims Department.

Sincerely,
Claims Department
ClaimCare Insurance
`;

  return letter;
}