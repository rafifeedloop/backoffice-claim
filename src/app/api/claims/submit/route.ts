import { NextRequest, NextResponse } from 'next/server';

interface ClaimSubmission {
  claimType: string;
  policyNumber: string;
  beneficiaryNIK: string;
  beneficiaryName: string;
  incidentDate: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  documents: Array<{
    type: string;
    filename: string;
    size: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const submission: ClaimSubmission = await request.json();

    // Generate a unique claim ID
    const claimId = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Mock claim submission processing
    const claimData = {
      claimId,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      estimatedProcessingDays: 14,
      nextSteps: [
        'Document verification in progress',
        'Initial assessment by claims adjuster',
        'Medical review (if applicable)',
        'Final decision and payout'
      ],
      requiredDocuments: getRequiredDocuments(submission.claimType),
      contactInfo: {
        phone: '+62-21-1500-123',
        email: 'claims@insurance.com',
        hours: 'Mon-Fri 9AM-5PM WIB'
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Claim submitted successfully',
      data: claimData
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit claim' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const claimId = searchParams.get('claimId');

  if (!claimId) {
    return NextResponse.json(
      { error: 'Claim ID is required' },
      { status: 400 }
    );
  }

  // Mock claim status lookup
  const mockClaimData = {
    claimId,
    policyNumber: 'POL-2024-001234',
    policyHolderName: 'John Doe',
    beneficiaryName: 'Jane Doe',
    status: 'Under Review',
    submittedAt: '2024-01-15T10:30:00Z',
    estimatedProcessingDate: '2024-01-29T17:00:00Z',
    claimAmount: 'Rp 150,000,000',
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: '2024-01-15T10:30:00Z',
        description: 'Claim submitted through online portal'
      },
      {
        status: 'Documents Received',
        timestamp: '2024-01-16T14:20:00Z',
        description: 'All required documents received and verified'
      },
      {
        status: 'Under Review',
        timestamp: '2024-01-18T09:15:00Z',
        description: 'Claim assigned to adjuster for detailed review'
      }
    ],
    documents: {
      'Death Certificate': {
        status: 'Verified',
        uploadedAt: '2024-01-15T10:35:00Z'
      },
      'Policy Document': {
        status: 'Verified',
        uploadedAt: '2024-01-15T10:36:00Z'
      },
      'Beneficiary ID': {
        status: 'Verified',
        uploadedAt: '2024-01-15T10:37:00Z'
      }
    }
  };

  return NextResponse.json(mockClaimData);
}

function getRequiredDocuments(claimType: string): string[] {
  switch (claimType) {
    case 'Life':
      return ['Death Certificate', 'Policy Document', 'Beneficiary ID', 'Medical Records'];
    case 'CI':
      return ['Medical Diagnosis', 'Hospital Records', 'Doctor Statement', 'Lab Reports'];
    case 'Accident':
      return ['Police Report', 'Medical Report', 'Accident Photos', 'Witness Statements'];
    case 'Health':
      return ['Medical Bills', 'Doctor Prescription', 'Hospital Discharge', 'Medical Reports'];
    default:
      return ['Policy Document', 'Incident Report', 'Supporting Documents'];
  }
}