import { NextRequest, NextResponse } from 'next/server';
import { ClaimStatusResponse } from '@/types/claim';

const mockClaims: Record<string, ClaimStatusResponse> = {
  'CLM-2025-000123': {
    id: 'CLM-2025-000123',
    status: 'Verification',
    timeline: [
      { stage: 'Received', date: '2025-09-10', description: 'Claim received' },
      { stage: 'Verification', date: '2025-09-12', description: 'Documents under review' }
    ],
    missingDocs: []
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const claimId = searchParams.get('claimId');
  
  if (!claimId) {
    return NextResponse.json(
      { error: 'Claim ID is required' },
      { status: 400 }
    );
  }
  
  const claim = mockClaims[claimId] || {
    id: claimId,
    status: 'Received',
    timeline: [
      { stage: 'Received', date: new Date().toISOString().split('T')[0] }
    ],
    missingDocs: []
  };
  
  return NextResponse.json(claim);
}