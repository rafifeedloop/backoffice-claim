import { NextRequest, NextResponse } from 'next/server';
import claimStore from '@/lib/database/claimStore';

// GET /api/cms/claims/[id]/audit-log - Get audit log for a claim
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

    // Return audit log sorted by timestamp (most recent first)
    const sortedAuditLog = [...claim.auditLog].sort((a, b) =>
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );

    return NextResponse.json({
      claimId: claim.id,
      totalEntries: sortedAuditLog.length,
      auditLog: sortedAuditLog
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch audit log' },
      { status: 500 }
    );
  }
}