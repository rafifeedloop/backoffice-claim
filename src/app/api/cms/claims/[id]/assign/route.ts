import { NextRequest, NextResponse } from 'next/server';
import claimStore from '@/lib/database/claimStore';

// POST /api/cms/claims/[id]/assign - Assign claim to adjuster
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { assignedTo, assignedBy = 'system' } = body;

    if (!assignedTo) {
      return NextResponse.json(
        { error: 'Assignee is required' },
        { status: 400 }
      );
    }

    const success = claimStore.assignClaim(params.id, assignedTo, assignedBy);

    if (!success) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Claim assigned successfully',
      assignedTo,
      claimId: params.id
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to assign claim' },
      { status: 500 }
    );
  }
}

// GET /api/cms/claims/[id]/assign - Get assignment history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const claim = claimStore.getClaimById(params.id);

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Filter audit log for assignment actions
    const assignmentHistory = claim.auditLog.filter(
      log => log.action === 'CLAIM_ASSIGNED'
    );

    return NextResponse.json({
      currentAssignee: claim.assignedTo,
      assignmentHistory
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch assignment history' },
      { status: 500 }
    );
  }
}