import { Claim } from '@/types/claim';

export interface SLAConfig {
  stage: string;
  targetHours: number;
  warningThreshold: number; // Percentage of target (e.g., 0.8 = 80%)
  criticalThreshold: number; // Percentage of target (e.g., 0.9 = 90%)
}

export interface SLAStatus {
  claimId: string;
  currentStage: string;
  timeElapsed: number;
  timeRemaining: number;
  targetTime: number;
  status: 'green' | 'amber' | 'red';
  breachRisk: number; // 0-1 probability
  predictedCompletionTime?: Date;
  recommendations?: string[];
}

export const slaConfigurations: Record<string, SLAConfig[]> = {
  Life: [
    { stage: 'Intake', targetHours: 6, warningThreshold: 0.7, criticalThreshold: 0.9 },
    { stage: 'Validation', targetHours: 24, warningThreshold: 0.75, criticalThreshold: 0.9 },
    { stage: 'Analysis', targetHours: 72, warningThreshold: 0.8, criticalThreshold: 0.95 },
    { stage: 'Decision', targetHours: 120, warningThreshold: 0.8, criticalThreshold: 0.95 },
    { stage: 'Payment', targetHours: 24, warningThreshold: 0.8, criticalThreshold: 0.95 }
  ],
  CI: [
    { stage: 'Intake', targetHours: 6, warningThreshold: 0.7, criticalThreshold: 0.9 },
    { stage: 'Validation', targetHours: 24, warningThreshold: 0.75, criticalThreshold: 0.9 },
    { stage: 'Analysis', targetHours: 96, warningThreshold: 0.8, criticalThreshold: 0.95 },
    { stage: 'Decision', targetHours: 144, warningThreshold: 0.8, criticalThreshold: 0.95 },
    { stage: 'Payment', targetHours: 24, warningThreshold: 0.8, criticalThreshold: 0.95 }
  ],
  Accident: [
    { stage: 'Intake', targetHours: 4, warningThreshold: 0.7, criticalThreshold: 0.9 },
    { stage: 'Validation', targetHours: 12, warningThreshold: 0.75, criticalThreshold: 0.9 },
    { stage: 'Analysis', targetHours: 48, warningThreshold: 0.8, criticalThreshold: 0.95 },
    { stage: 'Decision', targetHours: 72, warningThreshold: 0.8, criticalThreshold: 0.95 },
    { stage: 'Payment', targetHours: 24, warningThreshold: 0.8, criticalThreshold: 0.95 }
  ],
  Health: [
    { stage: 'Intake', targetHours: 4, warningThreshold: 0.7, criticalThreshold: 0.9 },
    { stage: 'Validation', targetHours: 12, warningThreshold: 0.75, criticalThreshold: 0.9 },
    { stage: 'Analysis', targetHours: 24, warningThreshold: 0.8, criticalThreshold: 0.95 },
    { stage: 'Decision', targetHours: 48, warningThreshold: 0.8, criticalThreshold: 0.95 },
    { stage: 'Payment', targetHours: 24, warningThreshold: 0.8, criticalThreshold: 0.95 }
  ]
};

export function calculateSLAStatus(claim: Claim): SLAStatus {
  const configs = slaConfigurations[claim.type] || slaConfigurations['Life'];
  const currentStageConfig = configs.find(c => c.stage === claim.status) || configs[0];

  const now = new Date();
  const claimStartTime = new Date(claim.createdAt);
  const hoursElapsed = (now.getTime() - claimStartTime.getTime()) / (1000 * 60 * 60);

  const targetHours = currentStageConfig.targetHours;
  const hoursRemaining = Math.max(0, targetHours - hoursElapsed);
  const completionPercentage = Math.min(hoursElapsed / targetHours, 1);

  let status: 'green' | 'amber' | 'red' = 'green';
  if (completionPercentage >= currentStageConfig.criticalThreshold || hoursRemaining <= 0) {
    status = 'red';
  } else if (completionPercentage >= currentStageConfig.warningThreshold) {
    status = 'amber';
  }

  // Calculate breach risk using predictive model
  const breachRisk = calculateBreachRisk(
    hoursElapsed,
    targetHours,
    claim.type,
    claim.status,
    claim.documents?.length || 0
  );

  // Predict completion time
  const predictedCompletionTime = predictCompletionTime(
    claimStartTime,
    hoursElapsed,
    targetHours,
    claim.type
  );

  // Generate recommendations
  const recommendations = generateSLARecommendations(
    status,
    breachRisk,
    claim
  );

  return {
    claimId: claim.id,
    currentStage: claim.status,
    timeElapsed: hoursElapsed,
    timeRemaining: hoursRemaining,
    targetTime: targetHours,
    status,
    breachRisk,
    predictedCompletionTime,
    recommendations
  };
}

function calculateBreachRisk(
  hoursElapsed: number,
  targetHours: number,
  claimType: string,
  currentStage: string,
  documentCount: number
): number {
  // Base risk from time elapsed
  const timeRisk = Math.min(hoursElapsed / targetHours, 1);

  // Risk factors
  let riskMultiplier = 1;

  // Complex claim types take longer
  if (claimType === 'Life' || claimType === 'CI') {
    riskMultiplier += 0.1;
  }

  // Missing documents increase risk
  const expectedDocs = claimType === 'Life' ? 6 : 5;
  if (documentCount < expectedDocs) {
    riskMultiplier += 0.2;
  }

  // Decision stage has higher variance
  if (currentStage === 'Decision' || currentStage === 'Analysis') {
    riskMultiplier += 0.15;
  }

  const finalRisk = Math.min(timeRisk * riskMultiplier, 1);

  // Apply sigmoid function for smoother risk curve
  return 1 / (1 + Math.exp(-10 * (finalRisk - 0.5)));
}

function predictCompletionTime(
  startTime: Date,
  hoursElapsed: number,
  targetHours: number,
  claimType: string
): Date {
  // Historical average processing times (in hours)
  const historicalAverages: Record<string, number> = {
    Life: 96,
    CI: 120,
    Accident: 48,
    Health: 36
  };

  const historicalAvg = historicalAverages[claimType] || 72;

  // Weighted prediction: 60% historical, 40% current pace
  const currentPace = targetHours * (hoursElapsed / (targetHours * 0.5));
  const predictedTotalHours = historicalAvg * 0.6 + currentPace * 0.4;

  const predictedCompletion = new Date(startTime);
  predictedCompletion.setHours(predictedCompletion.getHours() + predictedTotalHours);

  return predictedCompletion;
}

function generateSLARecommendations(
  status: string,
  breachRisk: number,
  claim: Claim
): string[] {
  const recommendations: string[] = [];

  if (status === 'red') {
    recommendations.push('Immediate escalation required - SLA breached or critical');
    recommendations.push('Assign to senior adjuster for expedited processing');
    recommendations.push('Contact customer with status update');
  } else if (status === 'amber') {
    recommendations.push('Monitor closely - approaching SLA threshold');
    recommendations.push('Consider reassigning to available adjuster');
    recommendations.push('Review for any blockers or missing information');
  }

  if (breachRisk > 0.7) {
    recommendations.push('High breach risk detected - prioritize this claim');
  }

  if (!claim.documents || claim.documents.length < 3) {
    recommendations.push('Follow up on missing documents to avoid delays');
  }

  if (claim.fraudIndicators && claim.fraudIndicators.length > 0) {
    recommendations.push('Fraud flags may cause delays - assign to SIU early');
  }

  return recommendations;
}

export function generateOJKReport(claims: Claim[]): {
  summary: {
    totalClaims: number;
    onTimeClaims: number;
    delayedClaims: number;
    averageProcessingTime: number;
    slaComplianceRate: number;
  };
  byType: Record<string, {
    count: number;
    averageTime: number;
    compliance: number;
  }>;
  breaches: Array<{
    claimId: string;
    type: string;
    delayHours: number;
    reason: string;
  }>;
} {
  const summary = {
    totalClaims: claims.length,
    onTimeClaims: 0,
    delayedClaims: 0,
    averageProcessingTime: 0,
    slaComplianceRate: 0
  };

  const byType: Record<string, any> = {};
  const breaches: any[] = [];

  let totalProcessingTime = 0;

  claims.forEach(claim => {
    const slaStatus = calculateSLAStatus(claim);
    const processingTime = slaStatus.timeElapsed;
    totalProcessingTime += processingTime;

    // Track compliance
    if (slaStatus.status === 'green') {
      summary.onTimeClaims++;
    } else if (slaStatus.status === 'red') {
      summary.delayedClaims++;
      breaches.push({
        claimId: claim.id,
        type: claim.type,
        delayHours: Math.max(0, slaStatus.timeElapsed - slaStatus.targetTime),
        reason: determineDelayReason(claim)
      });
    }

    // Track by type
    if (!byType[claim.type]) {
      byType[claim.type] = {
        count: 0,
        totalTime: 0,
        compliant: 0
      };
    }

    byType[claim.type].count++;
    byType[claim.type].totalTime += processingTime;
    if (slaStatus.status !== 'red') {
      byType[claim.type].compliant++;
    }
  });

  // Calculate averages
  summary.averageProcessingTime = totalProcessingTime / claims.length;
  summary.slaComplianceRate = (summary.onTimeClaims / summary.totalClaims) * 100;

  // Calculate by-type metrics
  Object.keys(byType).forEach(type => {
    const data = byType[type];
    byType[type] = {
      count: data.count,
      averageTime: data.totalTime / data.count,
      compliance: (data.compliant / data.count) * 100
    };
  });

  return {
    summary,
    byType,
    breaches
  };
}

function determineDelayReason(claim: Claim): string {
  if (claim.documents?.length < 3) {
    return 'Incomplete documentation';
  }

  if (claim.fraudIndicators && claim.fraudIndicators.length > 0) {
    return 'Fraud investigation required';
  }

  if (claim.type === 'CI' || claim.type === 'Life') {
    return 'Complex medical review';
  }

  if (!claim.assignee || claim.assignee === 'Unassigned') {
    return 'Pending assignment';
  }

  return 'Processing delays';
}

export function predictSLABreaches(claims: Claim[]): Claim[] {
  const atRiskClaims: Claim[] = [];

  claims.forEach(claim => {
    const slaStatus = calculateSLAStatus(claim);

    // Flag claims with >60% breach risk or amber/red status
    if (slaStatus.breachRisk > 0.6 || slaStatus.status !== 'green') {
      atRiskClaims.push(claim);
    }
  });

  // Sort by breach risk (highest first)
  atRiskClaims.sort((a, b) => {
    const aStatus = calculateSLAStatus(a);
    const bStatus = calculateSLAStatus(b);
    return bStatus.breachRisk - aStatus.breachRisk;
  });

  return atRiskClaims;
}

export function calculateSLAMetrics(claims: Claim[]): {
  intake: { average: number; p95: number; compliance: number };
  validation: { average: number; p95: number; compliance: number };
  decision: { average: number; p95: number; compliance: number };
  payment: { average: number; p95: number; compliance: number };
  overall: { average: number; p95: number; compliance: number };
} {
  const stageMetrics: Record<string, number[]> = {
    Intake: [],
    Validation: [],
    Decision: [],
    Payment: []
  };

  claims.forEach(claim => {
    const slaStatus = calculateSLAStatus(claim);
    const stage = claim.status;

    if (stageMetrics[stage]) {
      stageMetrics[stage].push(slaStatus.timeElapsed);
    }
  });

  const calculateMetricsForStage = (times: number[], targetHours: number) => {
    if (times.length === 0) {
      return { average: 0, p95: 0, compliance: 100 };
    }

    const sorted = [...times].sort((a, b) => a - b);
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const p95Index = Math.floor(times.length * 0.95);
    const p95 = sorted[p95Index] || sorted[sorted.length - 1];
    const compliant = times.filter(t => t <= targetHours).length;
    const compliance = (compliant / times.length) * 100;

    return { average, p95, compliance };
  };

  return {
    intake: calculateMetricsForStage(stageMetrics.Intake, 6),
    validation: calculateMetricsForStage(stageMetrics.Validation, 24),
    decision: calculateMetricsForStage(stageMetrics.Decision, 120),
    payment: calculateMetricsForStage(stageMetrics.Payment, 24),
    overall: {
      average: Object.values(stageMetrics).flat().reduce((a, b) => a + b, 0) /
               Object.values(stageMetrics).flat().length || 0,
      p95: 0,
      compliance: 0
    }
  };
}