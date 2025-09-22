import { NextRequest, NextResponse } from 'next/server';
import claimStore from '@/lib/database/claimStore';

// GET /api/cms/claims/search - Advanced search for claims
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const searchField = searchParams.get('field') || 'all';

    let claims = claimStore.getAllClaims();

    if (query) {
      claims = claims.filter(claim => {
        const searchLower = query.toLowerCase();

        switch (searchField) {
          case 'id':
            return claim.id.toLowerCase().includes(searchLower);
          case 'policyNumber':
            return claim.policyNumber.toLowerCase().includes(searchLower);
          case 'beneficiaryName':
            return claim.beneficiaryName.toLowerCase().includes(searchLower);
          case 'nik':
            return claim.beneficiaryNIK.includes(query) || claim.nik.includes(query);
          case 'all':
          default:
            return (
              claim.id.toLowerCase().includes(searchLower) ||
              claim.policyNumber.toLowerCase().includes(searchLower) ||
              claim.beneficiaryName.toLowerCase().includes(searchLower) ||
              claim.beneficiaryNIK.includes(query) ||
              claim.nik.includes(query) ||
              claim.description.toLowerCase().includes(searchLower) ||
              claim.claimType.toLowerCase().includes(searchLower)
            );
        }
      });
    }

    // Apply additional filters
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const riskLevel = searchParams.get('riskLevel');
    const slaStatus = searchParams.get('slaStatus');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    if (status) {
      claims = claims.filter(c => c.status === status);
    }
    if (priority) {
      claims = claims.filter(c => c.priority === priority);
    }
    if (riskLevel) {
      claims = claims.filter(c => c.riskLevel === riskLevel);
    }
    if (slaStatus) {
      claims = claims.filter(c => c.slaStatus === slaStatus);
    }
    if (minAmount) {
      claims = claims.filter(c => (c.amount || 0) >= parseFloat(minAmount));
    }
    if (maxAmount) {
      claims = claims.filter(c => (c.amount || 0) <= parseFloat(maxAmount));
    }

    // Sort options
    const sortBy = searchParams.get('sortBy') || 'submittedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    claims.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'submittedAt':
          aValue = new Date(a.submittedAt).getTime();
          bValue = new Date(b.submittedAt).getTime();
          break;
        case 'slaDeadline':
          aValue = new Date(a.slaDeadline).getTime();
          bValue = new Date(b.slaDeadline).getTime();
          break;
        case 'priority':
          const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        default:
          aValue = a[sortBy as keyof typeof a];
          bValue = b[sortBy as keyof typeof b];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedClaims = claims.slice(startIndex, endIndex);

    return NextResponse.json({
      results: paginatedClaims,
      total: claims.length,
      page,
      limit,
      pages: Math.ceil(claims.length / limit),
      query,
      searchField
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search claims' },
      { status: 500 }
    );
  }
}