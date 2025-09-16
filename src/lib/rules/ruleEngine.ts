export interface Rule {
  id: string;
  name: string;
  category: string;
  condition: (claim: any) => boolean;
  action: 'approve' | 'deny' | 'review' | 'flag';
  priority: number;
  message: string;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  action: string;
  message: string;
}

export class RuleEngine {
  private rules: Rule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    this.rules = [
      {
        id: 'RULE_001',
        name: 'Suicide Exclusion',
        category: 'Life',
        condition: (claim) => {
          const causeOfDeath = claim.ruleOutcomes?.causeOfDeath?.toLowerCase();
          const policyAge = this.getPolicyAgeInMonths(claim);
          return causeOfDeath?.includes('suicide') && policyAge < 24;
        },
        action: 'deny',
        priority: 1,
        message: 'Claim denied: Suicide within 2-year exclusion period'
      },
      {
        id: 'RULE_002',
        name: 'Pre-existing Condition',
        category: 'CI',
        condition: (claim) => {
          const diagnosisDate = new Date(claim.diagnosisDate || Date.now());
          const policyStartDate = new Date(claim.policy?.startDate || Date.now());
          const daysSincePolicyStart = (diagnosisDate.getTime() - policyStartDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSincePolicyStart < 90;
        },
        action: 'review',
        priority: 2,
        message: 'Manual review required: Possible pre-existing condition'
      },
      {
        id: 'RULE_003',
        name: 'Maximum Benefit Limit',
        category: 'All',
        condition: (claim) => {
          const claimAmount = claim.amount || 0;
          const maxBenefit = claim.policy?.maxBenefit || 1000000000;
          return claimAmount > maxBenefit;
        },
        action: 'flag',
        priority: 3,
        message: 'Claim amount exceeds maximum benefit limit'
      },
      {
        id: 'RULE_004',
        name: 'Valid Critical Illness',
        category: 'CI',
        condition: (claim) => {
          const validDiagnoses = ['cancer', 'heart attack', 'stroke', 'kidney failure', 'organ transplant'];
          const diagnosis = claim.diagnosis?.toLowerCase() || '';
          return validDiagnoses.some(d => diagnosis.includes(d));
        },
        action: 'approve',
        priority: 4,
        message: 'Valid critical illness diagnosis confirmed'
      },
      {
        id: 'RULE_005',
        name: 'Document Completeness',
        category: 'All',
        condition: (claim) => {
          const requiredDocs = this.getRequiredDocuments(claim.type);
          const uploadedDocs = claim.documents?.map((d: any) => d.type) || [];
          return requiredDocs.every(doc => uploadedDocs.includes(doc));
        },
        action: 'approve',
        priority: 5,
        message: 'All required documents are present'
      },
      {
        id: 'RULE_006',
        name: 'Drunk Driving Exclusion',
        category: 'Accident',
        condition: (claim) => {
          const policeReport = claim.policeReport?.toLowerCase() || '';
          return policeReport.includes('alcohol') || policeReport.includes('dui') || policeReport.includes('drunk');
        },
        action: 'deny',
        priority: 1,
        message: 'Claim denied: Accident caused by drunk driving'
      },
      {
        id: 'RULE_007',
        name: 'War/Terrorism Exclusion',
        category: 'All',
        condition: (claim) => {
          const cause = (claim.causeOfDeath || claim.causeOfInjury || '').toLowerCase();
          return cause.includes('war') || cause.includes('terrorism') || cause.includes('military');
        },
        action: 'deny',
        priority: 1,
        message: 'Claim denied: War/terrorism exclusion applies'
      },
      {
        id: 'RULE_008',
        name: 'Beneficiary Verification',
        category: 'Life',
        condition: (claim) => {
          const matchScore = claim.beneficiary?.matchScore || 0;
          return matchScore >= 0.85;
        },
        action: 'approve',
        priority: 6,
        message: 'Beneficiary identity verified'
      }
    ];
  }

  private getPolicyAgeInMonths(claim: any): number {
    const policyStartDate = new Date(claim.policy?.startDate || Date.now());
    const currentDate = new Date();
    const months = (currentDate.getFullYear() - policyStartDate.getFullYear()) * 12 +
                  (currentDate.getMonth() - policyStartDate.getMonth());
    return months;
  }

  private getRequiredDocuments(claimType: string): string[] {
    switch(claimType) {
      case 'Life':
        return ['death_cert', 'id', 'policy_doc'];
      case 'CI':
        return ['medical_report', 'diagnosis', 'id'];
      case 'Accident':
        return ['police_report', 'medical_report', 'id'];
      default:
        return ['id'];
    }
  }

  public evaluateClaim(claim: any): RuleResult[] {
    const results: RuleResult[] = [];
    
    // Filter rules by category
    const applicableRules = this.rules.filter(rule => 
      rule.category === 'All' || rule.category === claim.type
    );
    
    // Sort by priority
    applicableRules.sort((a, b) => a.priority - b.priority);
    
    // Evaluate each rule
    for (const rule of applicableRules) {
      const passed = rule.condition(claim);
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        passed,
        action: passed ? rule.action : 'none',
        message: passed ? rule.message : `Rule ${rule.name} not triggered`
      });
      
      // Stop on first deny action
      if (passed && rule.action === 'deny') {
        break;
      }
    }
    
    return results;
  }

  public getRecommendedAction(results: RuleResult[]): {
    action: string;
    confidence: number;
    reasons: string[];
  } {
    const denyResults = results.filter(r => r.action === 'deny' && r.passed);
    const approveResults = results.filter(r => r.action === 'approve' && r.passed);
    const reviewResults = results.filter(r => r.action === 'review' && r.passed);
    const flagResults = results.filter(r => r.action === 'flag' && r.passed);
    
    if (denyResults.length > 0) {
      return {
        action: 'deny',
        confidence: 1.0,
        reasons: denyResults.map(r => r.message)
      };
    }
    
    if (reviewResults.length > 0 || flagResults.length > 0) {
      return {
        action: 'review',
        confidence: 0.6,
        reasons: [...reviewResults, ...flagResults].map(r => r.message)
      };
    }
    
    if (approveResults.length >= 2) {
      return {
        action: 'approve',
        confidence: Math.min(0.9, 0.3 + approveResults.length * 0.15),
        reasons: approveResults.map(r => r.message)
      };
    }
    
    return {
      action: 'review',
      confidence: 0.5,
      reasons: ['Insufficient data for automatic decision']
    };
  }
}