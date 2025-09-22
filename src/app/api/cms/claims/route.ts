import { NextRequest, NextResponse } from 'next/server';
import claimStore from '@/lib/database/claimStore';

// GET /api/cms/claims - Get all claims with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      status: searchParams.get('status') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      priority: searchParams.get('priority') || undefined,
      channel: searchParams.get('channel') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    };

    const claims = claimStore.getAllClaims(filters);

    // Add pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedClaims = claims.slice(startIndex, endIndex);

    return NextResponse.json({
      claims: paginatedClaims,
      pagination: {
        total: claims.length,
        page,
        limit,
        pages: Math.ceil(claims.length / limit)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}

// POST /api/cms/claims - Create new claim (for internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newClaim = claimStore.createClaim(body);

    return NextResponse.json(newClaim, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create claim' },
      { status: 500 }
    );
  }
}