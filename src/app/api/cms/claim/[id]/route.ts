import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const mockClaim = {
    claimId: params.id,
    policy: { 
      status: 'Active', 
      product: 'Life',
      holderName: 'John Doe',
      holderNIK: '123456789012'
    },
    beneficiary: { 
      name: 'Ani S.', 
      matchScore: 0.97 
    },
    documents: [
      { type: 'death_cert', valid: true, ocrStatus: 'Matched' },
      { type: 'id', valid: true, ocrStatus: 'Matched' }
    ],
    ruleOutcomes: {
      causeOfDeath: 'Accident',
      exclusionMatch: false,
      evidence: ['Police report verified', 'Hospital records match']
    },
    decision: { 
      status: 'Pending', 
      requiredApprovals: 2,
      currentApprovals: 0,
      approvers: []
    }
  };
  
  return NextResponse.json(mockClaim);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  
  return NextResponse.json({
    claimId: params.id,
    ...body,
    updatedAt: new Date()
  });
}