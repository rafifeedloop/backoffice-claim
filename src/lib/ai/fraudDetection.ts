export interface FraudRiskAssessment {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  indicators: FraudIndicator[];
  recommendations: string[];
  requiresManualReview: boolean;
}

export interface FraudIndicator {
  type: string;
  description: string;
  weight: number;
  detected: boolean;
}

export async function assessFraudRisk(claim: any): Promise<FraudRiskAssessment> {
  const indicators: FraudIndicator[] = [
    {
      type: 'early_claim',
      description: 'Claim filed within 90 days of policy start',
      weight: 0.3,
      detected: checkEarlyClaim(claim)
    },
    {
      type: 'high_amount',
      description: 'Claim amount exceeds typical range',
      weight: 0.25,
      detected: checkHighAmount(claim)
    },
    {
      type: 'multiple_claims',
      description: 'Multiple claims from same beneficiary',
      weight: 0.2,
      detected: checkMultipleClaims(claim)
    },
    {
      type: 'document_mismatch',
      description: 'OCR detected document inconsistencies',
      weight: 0.35,
      detected: checkDocumentMismatch(claim)
    },
    {
      type: 'suspicious_pattern',
      description: 'Matches known fraud patterns',
      weight: 0.4,
      detected: checkSuspiciousPattern(claim)
    }
  ];

  const riskScore = calculateRiskScore(indicators);
  const riskLevel = getRiskLevel(riskScore);
  const recommendations = generateRecommendations(indicators, riskLevel);

  return {
    riskScore,
    riskLevel,
    indicators,
    recommendations,
    requiresManualReview: riskScore > 0.6
  };
}

function checkEarlyClaim(claim: any): boolean {
  const policyStartDate = new Date(claim.policy?.startDate || Date.now() - 180 * 24 * 60 * 60 * 1000);
  const claimDate = new Date(claim.createdAt);
  const daysSincePolicyStart = (claimDate.getTime() - policyStartDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSincePolicyStart < 90;
}

function checkHighAmount(claim: any): boolean {
  const amount = claim.amount || 0;
  const avgAmount = 50000000; // Average claim amount
  return amount > avgAmount * 2;
}

function checkMultipleClaims(claim: any): boolean {
  // Mock check for multiple claims
  return Math.random() > 0.8;
}

function checkDocumentMismatch(claim: any): boolean {
  return claim.documents?.some((doc: any) => doc.ocrStatus === 'Mismatch') || false;
}

function checkSuspiciousPattern(claim: any): boolean {
  // Mock pattern matching
  return Math.random() > 0.9;
}

function calculateRiskScore(indicators: FraudIndicator[]): number {
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

function generateRecommendations(indicators: FraudIndicator[], level: string): string[] {
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