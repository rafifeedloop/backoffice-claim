import { NextRequest, NextResponse } from 'next/server';
import claimStore from '@/lib/database/claimStore';

// GET /api/cms/claims/[id] - Get specific claim details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const claim = claimStore.getClaimById(id);

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(claim);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch claim' },
      { status: 500 }
    );
  }
}

// PUT /api/cms/claims/[id] - Update claim
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { updatedBy = 'system', ...updates } = body;

    const updatedClaim = claimStore.updateClaim(id, updates, updatedBy);

    if (!updatedClaim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedClaim);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update claim' },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/claims/[id] - Soft delete claim (change status to Closed)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedClaim = claimStore.updateClaim(
      id,
      { status: 'Closed' },
      'system'
    );

    if (!updatedClaim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Claim closed successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to close claim' },
      { status: 500 }
    );
  }
}