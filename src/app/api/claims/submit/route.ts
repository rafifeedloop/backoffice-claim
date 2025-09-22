import { NextRequest, NextResponse } from 'next/server';

interface ClaimSubmission {
  policyNumber: string;
  policyHolderName: string;
  policyHolderNIK: string;
  beneficiaryName: string;
  beneficiaryNIK: string;
  beneficiaryRelation: string;
  dateOfDeath: string;
  causeOfDeath: string;
  claimAmount: string;
  bankAccount: string;
  bankName: string;
  email: string;
  phone: string;
  documents: {
    deathCertificate: string;
    identityCard: string;
    policeReport?: string;
    medicalRecord?: string;
  };
  submittedAt: string;
}

const claimsDatabase = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body: ClaimSubmission = await request.json();

    const claimId = `CLM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;

    const newClaim = {
      claimId,
      ...body,
      status: 'Submitted',
      statusHistory: [
        {
          status: 'Submitted',
          timestamp: new Date().toISOString(),
          description: 'Claim submitted successfully'
        }
      ],
      assignedTo: null,
      estimatedProcessingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    claimsDatabase.set(claimId, newClaim);

    return NextResponse.json({
      success: true,
      claimId,
      message: 'Claim submitted successfully',
      estimatedProcessingDate: newClaim.estimatedProcessingDate
    });
  } catch (error) {
    console.error('Error submitting claim:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit claim'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const claimId = searchParams.get('claimId');
  const email = searchParams.get('email');

  if (claimId) {
    const claim = claimsDatabase.get(claimId);

    if (!claim) {
      const mockClaim = {
        claimId,
        policyNumber: 'POL-2023-123456',
        policyHolderName: 'John Doe',
        beneficiaryName: 'Jane Doe',
        status: 'Under Review',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedProcessingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        claimAmount: '100000000',
        statusHistory: [
          {
            status: 'Submitted',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Claim submitted successfully'
          },
          {
            status: 'Documents Verified',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'All documents have been verified'
          },
          {
            status: 'Under Review',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            description: 'Claim is being reviewed by our team'
          }
        ],
        documents: {
          deathCertificate: { status: 'Verified', uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          identityCard: { status: 'Verified', uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          policeReport: { status: 'Pending Review', uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
        }
      };

      return NextResponse.json(mockClaim);
    }

    return NextResponse.json(claim);
  }

  if (email) {
    const userClaims = Array.from(claimsDatabase.values()).filter(
      claim => claim.email === email
    );

    if (userClaims.length === 0) {
      return NextResponse.json([
        {
          claimId: 'CLM-2024-000001',
          policyNumber: 'POL-2023-123456',
          status: 'Approved',
          submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          claimAmount: '50000000'
        },
        {
          claimId: 'CLM-2024-000002',
          policyNumber: 'POL-2023-789012',
          status: 'Processing',
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          claimAmount: '75000000'
        }
      ]);
    }

    return NextResponse.json(userClaims);
  }

  return NextResponse.json(
    { message: 'Please provide claimId or email parameter' },
    { status: 400 }
  );
}