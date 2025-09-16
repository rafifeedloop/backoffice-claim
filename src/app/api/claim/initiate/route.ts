import { NextRequest, NextResponse } from 'next/server';
import { ClaimInitiateRequest } from '@/types/claim';

export async function POST(request: NextRequest) {
  try {
    const body: ClaimInitiateRequest = await request.json();
    
    const claimId = `CLM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
    
    const claim = {
      id: claimId,
      ...body,
      status: 'Received',
      timeline: [
        {
          stage: 'Received',
          date: new Date().toISOString(),
          description: 'Claim submitted successfully'
        }
      ],
      slaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      slaStatus: 'Green',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to initiate claim' },
      { status: 500 }
    );
  }
}