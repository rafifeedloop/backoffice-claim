import { NextRequest, NextResponse } from 'next/server';
import claimStore from '@/lib/database/claimStore';

// GET /api/cms/claims/export - Export claims data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const filters = {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };

    const claims = claimStore.getAllClaims(filters);

    // Format data based on requested format
    if (format === 'csv') {
      // Generate CSV format
      const headers = [
        'Claim ID',
        'Policy Number',
        'Type',
        'Status',
        'Priority',
        'Amount',
        'Beneficiary Name',
        'NIK',
        'Submitted Date',
        'SLA Deadline',
        'Assigned To',
        'Channel'
      ];

      const rows = claims.map(claim => [
        claim.id,
        claim.policyNumber,
        claim.claimType,
        claim.status,
        claim.priority,
        claim.amount || 0,
        claim.beneficiaryName,
        claim.beneficiaryNIK,
        claim.submittedAt,
        claim.slaDeadline,
        claim.assignedTo || 'Unassigned',
        claim.channel
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="claims-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else if (format === 'summary') {
      // Generate summary report
      const summary = {
        exportDate: new Date().toISOString(),
        totalClaims: claims.length,
        dateRange: {
          from: dateFrom || 'All time',
          to: dateTo || 'Present'
        },
        statusBreakdown: claims.reduce((acc, claim) => {
          acc[claim.status] = (acc[claim.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        typeBreakdown: claims.reduce((acc, claim) => {
          acc[claim.claimType] = (acc[claim.claimType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        totalAmount: claims.reduce((sum, claim) => sum + (claim.amount || 0), 0),
        averageAmount: claims.length > 0
          ? claims.reduce((sum, claim) => sum + (claim.amount || 0), 0) / claims.length
          : 0,
        channelBreakdown: claims.reduce((acc, claim) => {
          acc[claim.channel] = (acc[claim.channel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      return NextResponse.json(summary);
    } else {
      // Default JSON format
      return NextResponse.json({
        exportDate: new Date().toISOString(),
        totalRecords: claims.length,
        claims
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export claims' },
      { status: 500 }
    );
  }
}