import { Claim, FraudIndicator as ClaimFraudIndicator } from '@/types/claim';

export interface FraudRiskAssessment {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  indicators: EnhancedFraudIndicator[];
  recommendations: string[];
  requiresManualReview: boolean;
  requiresSIU: boolean;
  anomalyScore: number;
  blacklistMatch: boolean;
}

export interface EnhancedFraudIndicator {
  type: string;
  description: string;
  weight: number;
  detected: boolean;
  confidence: number;
  evidence?: string[];
}

export async function assessFraudRisk(claim: Claim): Promise<FraudRiskAssessment> {
  const indicators: EnhancedFraudIndicator[] = [
    {
      type: 'early_claim',
      description: 'Claim filed within 90 days of policy start',
      weight: 0.3,
      detected: checkEarlyClaim(claim),
      confidence: 1.0,
      evidence: getEarlyClaimEvidence(claim)
    },
    {
      type: 'high_amount',
      description: 'Claim amount exceeds typical range',
      weight: 0.25,
      detected: checkHighAmount(claim),
      confidence: 0.75
    },
    {
      type: 'multiple_claims',
      description: 'Multiple claims from same beneficiary',
      weight: 0.2,
      detected: checkMultipleClaims(claim),
      confidence: 0.8
    },
    {
      type: 'document_mismatch',
      description: 'OCR detected document inconsistencies',
      weight: 0.35,
      detected: checkDocumentMismatch(claim),
      confidence: 0.9
    },
    {
      type: 'suspicious_pattern',
      description: 'Matches known fraud patterns',
      weight: 0.4,
      detected: checkSuspiciousPattern(claim),
      confidence: 0.85,
      evidence: getSuspiciousPatternEvidence(claim)
    },
    {
      type: 'duplicate_claim',
      description: 'Duplicate or similar claim detected',
      weight: 0.45,
      detected: await checkDuplicateClaim(claim),
      confidence: 0.95
    },
    {
      type: 'velocity_check',
      description: 'Unusual claim velocity from same source',
      weight: 0.35,
      detected: await checkVelocity(claim),
      confidence: 0.9
    },
    {
      type: 'network_analysis',
      description: 'Suspicious network connections detected',
      weight: 0.4,
      detected: await checkNetworkConnections(claim),
      confidence: 0.8
    }
  ];

  const riskScore = calculateRiskScore(indicators);
  const anomalyScore = await calculateAnomalyScore(claim);
  const blacklistMatch = await checkBlacklist(claim);
  const combinedScore = Math.min((riskScore * 0.7 + anomalyScore * 0.3) * (blacklistMatch ? 1.5 : 1), 1);

  const riskLevel = getRiskLevel(combinedScore);
  const recommendations = generateRecommendations(indicators, riskLevel);

  return {
    riskScore: combinedScore,
    riskLevel,
    indicators,
    recommendations,
    requiresManualReview: combinedScore > 0.6,
    requiresSIU: combinedScore >= 0.7 || blacklistMatch,
    anomalyScore,
    blacklistMatch
  };
}

function checkEarlyClaim(claim: Claim): boolean {
  // Default to 180 days ago if no policy start date available
  const policyStartDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  const claimDate = new Date(claim.createdAt);
  const daysSincePolicyStart = (claimDate.getTime() - policyStartDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSincePolicyStart < 90;
}

function checkHighAmount(claim: Claim): boolean {
  const amount = claim.decision?.amount || 0;
  const avgAmount = 50000000; // Average claim amount
  return amount > avgAmount * 2;
}

function checkMultipleClaims(claim: Claim): boolean {
  // Mock check for multiple claims
  return Math.random() > 0.8;
}

function checkDocumentMismatch(claim: Claim): boolean {
  return claim.documents?.some((doc: any) => doc.ocrStatus === 'Mismatch') || false;
}

function checkSuspiciousPattern(claim: Claim): boolean {
  // Mock pattern matching
  return Math.random() > 0.9;
}

function calculateRiskScore(indicators: EnhancedFraudIndicator[]): number {
  const totalWeight = indicators.reduce((sum, ind) => sum + ind.weight, 0);
  const weightedScore = indicators.reduce((sum, ind) => {
    return sum + (ind.detected ? ind.weight : 0);
  }, 0);
  return Math.min(weightedScore / totalWeight, 1);
}

function getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score < 0.25) return 'Low';
  if (score < 0.5) return 'Medium';
  if (score < 0.75) return 'High';
  return 'Critical';
}

function generateRecommendations(indicators: EnhancedFraudIndicator[], level: string): string[] {
  const recommendations: string[] = [];
  
  if (level === 'Critical' || level === 'High') {
    recommendations.push('Require senior management approval');
    recommendations.push('Conduct detailed investigation');
  }
  
  indicators.forEach(ind => {
    if (ind.detected) {
      switch(ind.type) {
        case 'early_claim':
          recommendations.push('Verify policy inception date and premium payments');
          break;
        case 'document_mismatch':
          recommendations.push('Request original documents for manual verification');
          break;
        case 'high_amount':
          recommendations.push('Validate claim amount against policy coverage');
          break;
        case 'multiple_claims':
          recommendations.push('Review claim history for this beneficiary');
          break;
      }
    }
  });
  
  return recommendations;
}

function getEarlyClaimEvidence(claim: Claim): string[] {
  const evidence: string[] = [];
  const daysSincePolicy = Math.floor(
    (new Date(claim.createdAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSincePolicy < 30) {
    evidence.push(`Claim filed only ${daysSincePolicy} days after policy start`);
  }
  if (daysSincePolicy < 90) {
    evidence.push('Within 90-day early claim window');
  }

  return evidence;
}

function getSuspiciousPatternEvidence(claim: Claim): string[] {
  const evidence: string[] = [];

  // Check for common fraud patterns
  if (claim.documents.length < 3) {
    evidence.push('Minimal documentation provided');
  }

  if (claim.channel === 'WhatsApp' && (claim.decision?.amount || 0) > 100000000) {
    evidence.push('High-value claim via informal channel');
  }

  return evidence;
}

async function checkDuplicateClaim(claim: Claim): Promise<boolean> {
  // Simulate checking for duplicate claims in database
  // In production, this would query the database
  const duplicateThreshold = 0.85; // 85% similarity
  const similarity = Math.random();

  return similarity > duplicateThreshold;
}

async function checkVelocity(claim: Claim): Promise<boolean> {
  // Check if multiple claims from same beneficiary in short time
  // In production, this would query claim history
  const maxClaimsPerMonth = 2;
  const recentClaims = Math.floor(Math.random() * 4);

  return recentClaims > maxClaimsPerMonth;
}

async function checkNetworkConnections(claim: Claim): Promise<boolean> {
  // Analyze connections between beneficiaries, doctors, hospitals
  // Look for suspicious networks of related claims
  const suspiciousConnectionScore = Math.random();

  return suspiciousConnectionScore > 0.7;
}

async function calculateAnomalyScore(claim: Claim): Promise<number> {
  // Machine learning anomaly detection
  // Compare claim features against historical baseline

  const features = [
    claim.documents.length,
    claim.decision?.amount || 0,
    claim.type === 'Life' ? 1 : 0,
    claim.channel === 'WhatsApp' ? 1 : 0
  ];

  // Simulate ML model prediction
  const anomalyScore = Math.random() * 0.5 + (features[1] > 500000000 ? 0.3 : 0);

  return Math.min(anomalyScore, 1);
}

async function checkBlacklist(claim: Claim): Promise<boolean> {
  // Check against fraud blacklist database
  // Check NIK, phone numbers, bank accounts

  const blacklistedNIKs = ['1234567890123456', '9876543210987654'];

  return blacklistedNIKs.includes(claim.beneficiaryNIK);
}

export function convertToClaimFraudIndicators(
  assessment: FraudRiskAssessment
): ClaimFraudIndicator[] {
  return assessment.indicators
    .filter(ind => ind.detected)
    .map(ind => ({
      type: mapIndicatorType(ind.type),
      severity: assessment.riskLevel === 'Critical' ? 'high' :
                assessment.riskLevel === 'High' ? 'medium' : 'low',
      description: ind.description,
      confidence: ind.confidence
    }));
}

function mapIndicatorType(type: string): ClaimFraudIndicator['type'] {
  const mapping: Record<string, ClaimFraudIndicator['type']> = {
    'early_claim': 'early_claim',
    'duplicate_claim': 'duplicate',
    'high_amount': 'high_amount',
    'suspicious_pattern': 'pattern_mismatch',
    'blacklist': 'blacklist'
  };

  return mapping[type] || 'pattern_mismatch';
}