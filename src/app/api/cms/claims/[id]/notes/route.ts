import { NextRequest, NextResponse } from 'next/server';
import claimStore from '@/lib/database/claimStore';

// POST /api/cms/claims/[id]/notes - Add note to claim
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { text, createdBy = 'system' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Note text is required' },
        { status: 400 }
      );
    }

    const success = claimStore.addNote(id, text, createdBy);

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

    return NextResponse.json(claim.notes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}