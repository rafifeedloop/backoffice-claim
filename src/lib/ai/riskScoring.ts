import { Claim, AIAnalysis, DocumentType } from '@/types/claim';
import { assessFraudRisk, convertToClaimFraudIndicators } from './fraudDetection';
import { processDocument, calculateOCRAccuracy, detectDocumentForgery } from './ocrProcessor';
import { validateDocumentCompleteness } from '../documents/documentRequirements';
import { runAnalysisWorkflow } from '../workflows/claimAnalysis';

export interface RiskAssessment {
  overallRiskScore: number;
  riskCategory: 'Low' | 'Medium' | 'High' | 'Critical';
  components: {
    fraudRisk: number;
    documentRisk: number;
    policyRisk: number;
    amountRisk: number;
    velocityRisk: number;
  };
  aiRecommendation: 'auto_approve' | 'manual_review' | 'investigate' | 'deny';
  confidenceLevel: number;
  insights: string[];
  requiresActions: string[];
}

export async function calculateComprehensiveRiskScore(
  claim: Claim
): Promise<RiskAssessment> {
  // 1. Fraud Risk Assessment
  const fraudAssessment = await assessFraudRisk(claim);
  const fraudRisk = fraudAssessment.riskScore;

  // 2. Document Risk Assessment
  const documentRisk = await assessDocumentRisk(claim);

  // 3. Policy Risk Assessment
  const policyRisk = assessPolicyRisk(claim);

  // 4. Amount Risk Assessment
  const amountRisk = assessAmountRisk(claim);

  // 5. Velocity Risk Assessment
  const velocityRisk = await assessVelocityRisk(claim);

  // Calculate weighted overall risk
  const weights = {
    fraud: 0.35,
    document: 0.25,
    policy: 0.15,
    amount: 0.15,
    velocity: 0.10
  };

  const overallRiskScore =
    fraudRisk * weights.fraud +
    documentRisk * weights.document +
    policyRisk * weights.policy +
    amountRisk * weights.amount +
    velocityRisk * weights.velocity;

  // Determine risk category
  const riskCategory = getRiskCategory(overallRiskScore);

  // Generate AI recommendation
  const aiRecommendation = generateAIRecommendation(
    overallRiskScore,
    fraudAssessment,
    claim
  );

  // Calculate confidence level
  const confidenceLevel = calculateConfidence(claim, documentRisk);

  // Generate insights
  const insights = generateInsights(
    claim,
    fraudAssessment,
    documentRisk,
    policyRisk,
    amountRisk,
    velocityRisk
  );

  // Determine required actions
  const requiresActions = determineRequiredActions(
    riskCategory,
    fraudAssessment,
    documentRisk
  );

  return {
    overallRiskScore,
    riskCategory,
    components: {
      fraudRisk,
      documentRisk,
      policyRisk,
      amountRisk,
      velocityRisk
    },
    aiRecommendation,
    confidenceLevel,
    insights,
    requiresActions
  };
}

async function assessDocumentRisk(claim: Claim): Promise<number> {
  if (!claim.documents || claim.documents.length === 0) {
    return 1.0; // Maximum risk if no documents
  }

  let totalRisk = 0;
  let documentCount = 0;

  // Check document completeness
  const uploadedTypes = claim.documents.map(d => d.type);
  const completeness = validateDocumentCompleteness(
    claim.type,
    uploadedTypes
  );

  // Base risk from incompleteness
  totalRisk += (100 - completeness.percentage) / 100 * 0.5;

  // Check each document for quality and forgery
  for (const doc of claim.documents) {
    if (doc.ocrStatus === 'Mismatch') {
      totalRisk += 0.3;
    } else if (doc.ocrStatus === 'Pending') {
      totalRisk += 0.1;
    }

    documentCount++;
  }

  // Average the document-specific risks
  if (documentCount > 0) {
    totalRisk = totalRisk / documentCount;
  }

  return Math.min(totalRisk, 1.0);
}

function assessPolicyRisk(claim: Claim): number {
  let risk = 0;

  // Check policy age (early claim risk)
  const policyAge = Math.floor(
    (Date.now() - new Date(claim.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (policyAge < 30) {
    risk += 0.5; // Very early claim
  } else if (policyAge < 90) {
    risk += 0.3; // Early claim
  } else if (policyAge < 180) {
    risk += 0.1; // Somewhat early
  }

  // Check claim frequency (if this is not the first claim)
  // In production, this would query historical claims
  const previousClaims = Math.floor(Math.random() * 3);
  if (previousClaims > 2) {
    risk += 0.3;
  } else if (previousClaims > 0) {
    risk += 0.1;
  }

  return Math.min(risk, 1.0);
}

function assessAmountRisk(claim: Claim): number {
  const amount = claim.decision?.amount || 0;
  let risk = 0;

  // Risk based on absolute amount
  if (amount > 1000000000) { // > 1B IDR
    risk += 0.5;
  } else if (amount > 500000000) { // > 500M IDR
    risk += 0.3;
  } else if (amount > 100000000) { // > 100M IDR
    risk += 0.15;
  } else if (amount > 50000000) { // > 50M IDR
    risk += 0.05;
  }

  // Risk based on claim type and amount relationship
  const typicalAmounts: Record<string, number> = {
    'Life': 500000000,
    'CI': 200000000,
    'Accident': 50000000,
    'Health': 10000000
  };

  const typical = typicalAmounts[claim.type] || 100000000;
  const ratio = amount / typical;

  if (ratio > 3) {
    risk += 0.4; // Much higher than typical
  } else if (ratio > 2) {
    risk += 0.2; // Higher than typical
  } else if (ratio > 1.5) {
    risk += 0.1; // Somewhat higher
  }

  return Math.min(risk, 1.0);
}

async function assessVelocityRisk(claim: Claim): Promise<number> {
  // Check claim velocity (multiple claims in short period)
  // In production, this would query the database

  let risk = 0;

  // Simulate checking recent claims from same beneficiary
  const recentClaimsCount = Math.floor(Math.random() * 5);
  const recentClaimsPeriodDays = 30;

  if (recentClaimsCount > 3) {
    risk += 0.5; // Very high velocity
  } else if (recentClaimsCount > 1) {
    risk += 0.2; // Moderate velocity
  }

  // Check for claim bursts (multiple claims on same day)
  const sameDayClaims = Math.floor(Math.random() * 3);
  if (sameDayClaims > 1) {
    risk += 0.3;
  }

  return Math.min(risk, 1.0);
}

function getRiskCategory(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score < 0.25) return 'Low';
  if (score < 0.5) return 'Medium';
  if (score < 0.75) return 'High';
  return 'Critical';
}

function generateAIRecommendation(
  riskScore: number,
  fraudAssessment: any,
  claim: Claim
): 'auto_approve' | 'manual_review' | 'investigate' | 'deny' {
  // Auto-approve conditions
  if (
    riskScore < 0.3 &&
    !fraudAssessment.blacklistMatch &&
    !fraudAssessment.requiresSIU &&
    (claim.decision?.amount || 0) < 50000000
  ) {
    return 'auto_approve';
  }

  // Investigate conditions
  if (
    riskScore >= 0.7 ||
    fraudAssessment.requiresSIU ||
    fraudAssessment.blacklistMatch
  ) {
    return 'investigate';
  }

  // Deny conditions (very rare, only for obvious fraud)
  if (
    riskScore > 0.9 &&
    fraudAssessment.blacklistMatch
  ) {
    return 'deny';
  }

  // Default to manual review
  return 'manual_review';
}

function calculateConfidence(claim: Claim, documentRisk: number): number {
  let confidence = 1.0;

  // Reduce confidence based on missing information
  if (!claim.documents || claim.documents.length === 0) {
    confidence -= 0.3;
  }

  // Reduce confidence based on document risk
  confidence -= documentRisk * 0.2;

  // Reduce confidence if no AI analysis yet
  if (!claim.aiAnalysis) {
    confidence -= 0.2;
  }

  // Reduce confidence for complex claim types
  if (claim.type === 'CI' || claim.type === 'Life') {
    confidence -= 0.1;
  }

  return Math.max(0.3, confidence); // Minimum 30% confidence
}

function generateInsights(
  claim: Claim,
  fraudAssessment: any,
  documentRisk: number,
  policyRisk: number,
  amountRisk: number,
  velocityRisk: number
): string[] {
  const insights: string[] = [];

  // Fraud insights
  if (fraudAssessment.riskScore > 0.5) {
    insights.push(`High fraud risk detected (${(fraudAssessment.riskScore * 100).toFixed(0)}%)`);
  }

  if (fraudAssessment.blacklistMatch) {
    insights.push('Beneficiary found in fraud blacklist');
  }

  // Document insights
  if (documentRisk > 0.5) {
    insights.push('Document quality or completeness issues detected');
  }

  // Policy insights
  if (policyRisk > 0.3) {
    const policyAge = Math.floor(
      (Date.now() - new Date(claim.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (policyAge < 90) {
      insights.push(`Early claim warning: Policy only ${policyAge} days old`);
    }
  }

  // Amount insights
  if (amountRisk > 0.3) {
    insights.push('Claim amount significantly above typical range');
  }

  // Velocity insights
  if (velocityRisk > 0.3) {
    insights.push('Multiple recent claims detected from same source');
  }

  // Positive insights
  if (fraudAssessment.riskScore < 0.2 && documentRisk < 0.2) {
    insights.push('Low risk profile - eligible for fast-track processing');
  }

  return insights;
}

function determineRequiredActions(
  riskCategory: string,
  fraudAssessment: any,
  documentRisk: number
): string[] {
  const actions: string[] = [];

  // Risk category based actions
  switch (riskCategory) {
    case 'Critical':
      actions.push('Mandatory SIU investigation required');
      actions.push('Senior management approval required');
      break;
    case 'High':
      actions.push('Enhanced due diligence required');
      actions.push('Manager approval required');
      break;
    case 'Medium':
      actions.push('Standard review process');
      actions.push('Supervisor approval required');
      break;
    case 'Low':
      actions.push('Eligible for streamlined processing');
      break;
  }

  // Specific condition based actions
  if (fraudAssessment.blacklistMatch) {
    actions.push('Verify beneficiary identity with enhanced KYC');
  }

  if (documentRisk > 0.5) {
    actions.push('Request original documents for verification');
  }

  if (fraudAssessment.requiresSIU) {
    actions.push('Assign to SIU team for investigation');
  }

  return actions;
}

export async function generateAIAnalysis(claim: Claim): Promise<AIAnalysis> {
  const riskAssessment = await calculateComprehensiveRiskScore(claim);

  // Check document completeness
  const uploadedTypes = claim.documents.map(d => d.type);
  const completeness = validateDocumentCompleteness(claim.type, uploadedTypes);

  // Determine eligibility
  const eligible = riskAssessment.riskCategory === 'Low' ||
                  riskAssessment.riskCategory === 'Medium';

  const eligibilityReasons: string[] = [];
  if (!eligible) {
    if (riskAssessment.components.fraudRisk > 0.6) {
      eligibilityReasons.push('High fraud risk detected');
    }
    if (riskAssessment.components.documentRisk > 0.6) {
      eligibilityReasons.push('Document verification issues');
    }
    if (riskAssessment.components.policyRisk > 0.6) {
      eligibilityReasons.push('Policy validation concerns');
    }
  }

  return {
    eligibilityCheck: {
      eligible,
      reasons: eligible ? ['All checks passed'] : eligibilityReasons
    },
    documentCompleteness: completeness.percentage,
    riskScore: riskAssessment.overallRiskScore,
    recommendedAction: riskAssessment.aiRecommendation,
    insights: riskAssessment.insights,
    generatedAt: new Date()
  };
}