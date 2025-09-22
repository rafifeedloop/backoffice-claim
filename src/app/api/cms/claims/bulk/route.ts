import { NextRequest, NextResponse } from 'next/server';
import claimStore from '@/lib/database/claimStore';

// POST /api/cms/claims/bulk - Perform bulk operations on claims
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, claimIds, data = {}, performedBy = 'system' } = body;

    if (!action || !claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and claim IDs are required' },
        { status: 400 }
      );
    }

    const results = {
      successful: [] as string[],
      failed: [] as { id: string; reason: string }[],
      action,
      totalProcessed: claimIds.length
    };

    switch (action) {
      case 'assign':
        if (!data.assignedTo) {
          return NextResponse.json(
            { error: 'Assignee is required for bulk assignment' },
            { status: 400 }
          );
        }

        for (const claimId of claimIds) {
          const success = claimStore.assignClaim(claimId, data.assignedTo, performedBy);
          if (success) {
            results.successful.push(claimId);
          } else {
            results.failed.push({ id: claimId, reason: 'Claim not found' });
          }
        }
        break;

      case 'updateStatus':
        if (!data.status) {
          return NextResponse.json(
            { error: 'Status is required for bulk status update' },
            { status: 400 }
          );
        }

        for (const claimId of claimIds) {
          const updatedClaim = claimStore.updateClaim(
            claimId,
            { status: data.status },
            performedBy
          );
          if (updatedClaim) {
            results.successful.push(claimId);
          } else {
            results.failed.push({ id: claimId, reason: 'Claim not found' });
          }
        }
        break;

      case 'updatePriority':
        if (!data.priority) {
          return NextResponse.json(
            { error: 'Priority is required for bulk priority update' },
            { status: 400 }
          );
        }

        for (const claimId of claimIds) {
          const updatedClaim = claimStore.updateClaim(
            claimId,
            { priority: data.priority },
            performedBy
          );
          if (updatedClaim) {
            results.successful.push(claimId);
          } else {
            results.failed.push({ id: claimId, reason: 'Claim not found' });
          }
        }
        break;

      case 'addNote':
        if (!data.note) {
          return NextResponse.json(
            { error: 'Note is required for bulk note addition' },
            { status: 400 }
          );
        }

        for (const claimId of claimIds) {
          const success = claimStore.addNote(claimId, data.note, performedBy);
          if (success) {
            results.successful.push(claimId);
          } else {
            results.failed.push({ id: claimId, reason: 'Claim not found' });
          }
        }
        break;

      case 'close':
        for (const claimId of claimIds) {
          const updatedClaim = claimStore.updateClaim(
            claimId,
            { status: 'Closed' },
            performedBy
          );
          if (updatedClaim) {
            results.successful.push(claimId);
          } else {
            results.failed.push({ id: claimId, reason: 'Claim not found' });
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}