import { Claim, Policy, RuleOutcome, FraudIndicator } from '@/types/claim';

export interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  automate: boolean;
  action: (claim: Claim, policy?: Policy) => Promise<AnalysisResult>;
}

export interface AnalysisResult {
  passed: boolean;
  message: string;
  data?: any;
  nextStep?: string;
}

export const lifeClaimAnalysis: AnalysisStep[] = [
  {
    id: 'completeness_check',
    name: 'Document Completeness',
    description: 'Verify all required documents are present',
    required: true,
    automate: true,
    action: async (claim: Claim) => {
      const requiredDocs = ['polis', 'death_cert', 'id_beneficiary', 'claim_form', 'doctor_letter', 'bank_account'];
      const uploadedTypes = claim.documents.map(d => d.type);
      const missing = requiredDocs.filter(doc => !uploadedTypes.includes(doc as any));

      return {
        passed: missing.length === 0,
        message: missing.length === 0
          ? 'All required documents present'
          : `Missing documents: ${missing.join(', ')}`,
        data: { completeness: ((requiredDocs.length - missing.length) / requiredDocs.length) * 100 }
      };
    }
  },
  {
    id: 'policy_validation',
    name: 'Policy Validation',
    description: 'Check policy status, waiting period, and coverage',
    required: true,
    automate: true,
    action: async (claim: Claim, policy?: Policy) => {
      if (!policy) {
        return { passed: false, message: 'Policy not found' };
      }

      if (policy.status !== 'Active') {
        return { passed: false, message: `Policy status: ${policy.status}` };
      }

      // Check waiting period (90 days)
      const policyAge = Math.floor((Date.now() - new Date(claim.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (policyAge < 90) {
        return {
          passed: false,
          message: `Policy in waiting period (${policyAge}/90 days)`,
          data: { earlyClaimFlag: true }
        };
      }

      return { passed: true, message: 'Policy valid and active' };
    }
  },
  {
    id: 'beneficiary_match',
    name: 'Beneficiary Verification',
    description: 'Verify beneficiary identity matches policy records',
    required: true,
    automate: true,
    action: async (claim: Claim, policy?: Policy) => {
      if (!policy) {
        return { passed: false, message: 'Policy not found' };
      }

      const beneficiary = policy.beneficiaries.find(b => b.nik === claim.beneficiaryNIK);

      if (!beneficiary) {
        return { passed: false, message: 'Beneficiary not found in policy' };
      }

      // Simulate name matching score
      const matchScore = beneficiary.matchScore || 0.95;

      return {
        passed: matchScore > 0.9,
        message: `Beneficiary match score: ${(matchScore * 100).toFixed(0)}%`,
        data: { beneficiary, matchScore }
      };
    }
  },
  {
    id: 'cause_of_death_exclusion',
    name: 'Cause of Death vs Exclusions',
    description: 'Check if cause of death is covered',
    required: true,
    automate: false,
    action: async (claim: Claim) => {
      const exclusions = ['suicide', 'pre-existing', 'war', 'criminal_activity'];

      // This would be determined from OCR/document analysis
      const causeOfDeath = 'natural_causes'; // Placeholder

      const isExcluded = exclusions.includes(causeOfDeath);

      return {
        passed: !isExcluded,
        message: isExcluded
          ? `Cause of death (${causeOfDeath}) is excluded`
          : 'Cause of death is covered',
        data: { causeOfDeath, exclusionMatch: isExcluded }
      };
    }
  },
  {
    id: 'fraud_screen',
    name: 'Fraud Detection',
    description: 'Screen for fraud indicators',
    required: true,
    automate: true,
    action: async (claim: Claim) => {
      const fraudIndicators: FraudIndicator[] = [];

      // Check for early claim
      const claimAge = Math.floor((Date.now() - new Date(claim.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (claimAge < 90) {
        fraudIndicators.push({
          type: 'early_claim',
          severity: 'medium',
          description: `Claim submitted within ${claimAge} days of policy`,
          confidence: 0.7
        });
      }

      // Check for duplicate claims
      // This would query the database for similar claims

      const riskScore = fraudIndicators.reduce((score, indicator) => {
        return score + (indicator.severity === 'high' ? 0.4 : indicator.severity === 'medium' ? 0.2 : 0.1);
      }, 0);

      return {
        passed: riskScore < 0.7,
        message: fraudIndicators.length === 0
          ? 'No fraud indicators detected'
          : `${fraudIndicators.length} fraud indicators found`,
        data: { fraudIndicators, riskScore }
      };
    }
  },
  {
    id: 'benefit_calculation',
    name: 'Benefit Calculation',
    description: 'Calculate payable benefit amount',
    required: true,
    automate: true,
    action: async (claim: Claim, policy?: Policy) => {
      // This would calculate based on policy terms
      const baseAmount = 500000000; // IDR 500M placeholder
      const deductions = 0;
      const finalAmount = baseAmount - deductions;

      return {
        passed: true,
        message: `Benefit amount: IDR ${finalAmount.toLocaleString()}`,
        data: { baseAmount, deductions, finalAmount }
      };
    }
  },
  {
    id: 'aml_pep_check',
    name: 'AML/PEP Screening',
    description: 'Anti-money laundering and PEP checks',
    required: true,
    automate: true,
    action: async (claim: Claim) => {
      // Simulate AML/PEP check
      const amlResult = {
        status: 'clear' as const,
        pepMatch: false,
        sanctionsMatch: false,
        nameMatchScore: 0.98,
        checkedAt: new Date()
      };

      return {
        passed: amlResult.status === 'clear',
        message: `AML Check: ${amlResult.status}`,
        data: amlResult
      };
    }
  }
];

export const ciClaimAnalysis: AnalysisStep[] = [
  {
    id: 'ci_classification',
    name: 'CI Classification',
    description: 'Verify diagnosis matches policy CI definitions',
    required: true,
    automate: false,
    action: async (claim: Claim) => {
      // This would match diagnosis against policy CI definitions
      const coveredConditions = ['cancer', 'heart_attack', 'stroke', 'kidney_failure'];
      const diagnosis = 'cancer'; // Placeholder from OCR

      const isCovered = coveredConditions.includes(diagnosis);

      return {
        passed: isCovered,
        message: isCovered
          ? `Diagnosis (${diagnosis}) is covered`
          : `Diagnosis (${diagnosis}) not in CI definitions`,
        data: { diagnosis, covered: isCovered }
      };
    }
  },
  {
    id: 'waiting_period',
    name: 'Waiting Period Check',
    description: 'Verify waiting period and pre-existing conditions',
    required: true,
    automate: true,
    action: async (claim: Claim) => {
      const waitingPeriod = 180; // days
      const policyAge = Math.floor((Date.now() - new Date(claim.createdAt).getTime()) / (1000 * 60 * 60 * 24));

      if (policyAge < waitingPeriod) {
        return {
          passed: false,
          message: `Within waiting period (${policyAge}/${waitingPeriod} days)`,
          data: { inWaitingPeriod: true }
        };
      }

      return {
        passed: true,
        message: 'Waiting period satisfied'
      };
    }
  },
  {
    id: 'medical_evidence',
    name: 'Medical Evidence Validation',
    description: 'Verify medical reports and lab results',
    required: true,
    automate: false,
    action: async (claim: Claim) => {
      // Medical officer review required
      return {
        passed: true,
        message: 'Medical evidence requires manual review',
        data: { requiresMedicalOfficer: true }
      };
    }
  }
];

export const accidentHealthAnalysis: AnalysisStep[] = [
  {
    id: 'incident_verification',
    name: 'Incident Verification',
    description: 'Verify accident/illness details',
    required: true,
    automate: false,
    action: async (claim: Claim) => {
      // Check police report for accidents, medical reports for illness
      return {
        passed: true,
        message: 'Incident details verified',
        data: { incidentType: 'accident', verified: true }
      };
    }
  },
  {
    id: 'eligibility_check',
    name: 'Coverage Eligibility',
    description: 'Check covered expenses and sub-limits',
    required: true,
    automate: true,
    action: async (claim: Claim) => {
      const coveredExpenses = ['hospitalization', 'surgery', 'medication', 'consultation'];
      const claimedExpenses = ['hospitalization', 'surgery']; // From receipts

      const allCovered = claimedExpenses.every(exp => coveredExpenses.includes(exp));

      return {
        passed: allCovered,
        message: allCovered
          ? 'All expenses covered'
          : 'Some expenses not covered',
        data: { coveredExpenses, claimedExpenses }
      };
    }
  },
  {
    id: 'medical_necessity',
    name: 'Medical Necessity',
    description: 'Verify treatment was medically necessary',
    required: true,
    automate: false,
    action: async (claim: Claim) => {
      return {
        passed: true,
        message: 'Medical necessity requires review',
        data: { requiresMedicalReview: true }
      };
    }
  },
  {
    id: 'bill_audit',
    name: 'Bill Audit',
    description: 'Audit medical bills for accuracy',
    required: true,
    automate: true,
    action: async (claim: Claim) => {
      // Automated bill validation
      const totalBilled = 15000000; // IDR 15M
      const adjustments = 500000; // Overcharges found
      const approvedAmount = totalBilled - adjustments;

      return {
        passed: true,
        message: `Approved amount: IDR ${approvedAmount.toLocaleString()}`,
        data: { totalBilled, adjustments, approvedAmount }
      };
    }
  }
];

export function getAnalysisWorkflow(claimType: string): AnalysisStep[] {
  switch (claimType) {
    case 'Life':
      return lifeClaimAnalysis;
    case 'CI':
      return ciClaimAnalysis;
    case 'Accident':
    case 'Health':
      return accidentHealthAnalysis;
    default:
      return [];
  }
}

export async function runAnalysisWorkflow(
  claim: Claim,
  policy?: Policy
): Promise<{
  completed: boolean;
  results: Map<string, AnalysisResult>;
  recommendation: string;
}> {
  const workflow = getAnalysisWorkflow(claim.type);
  const results = new Map<string, AnalysisResult>();
  let allPassed = true;

  for (const step of workflow) {
    if (step.automate) {
      const result = await step.action(claim, policy);
      results.set(step.id, result);

      if (step.required && !result.passed) {
        allPassed = false;
      }
    }
  }

  let recommendation = 'auto_approve';
  if (!allPassed) {
    recommendation = 'manual_review';
  }

  const riskScore = claim.riskScore || 0;
  if (riskScore > 0.7) {
    recommendation = 'investigate';
  }

  return {
    completed: true,
    results,
    recommendation
  };
}