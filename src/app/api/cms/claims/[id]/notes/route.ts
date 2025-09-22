import { NextRequest, NextResponse } from 'next/server';
import claimStore from '@/lib/database/claimStore';

// POST /api/cms/claims/[id]/notes - Add note to claim
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { text, createdBy = 'system' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Note text is required' },
        { status: 400 }
      );
    }

    const success = claimStore.addNote(params.id, text, createdBy);

    if (!success) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Note added successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    );
  }
}

// GET /api/cms/claims/[id]/notes - Get all notes for a claim
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

    return NextResponse.json(claim.notes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}