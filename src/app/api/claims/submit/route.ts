import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  // Get the search parameters from the URL
  const searchParams = request.nextUrl.searchParams;
  const referenceNumber = searchParams.get('reference_number');
  
  // Remove the 'eq.' prefix if it exists (from your Supabase direct API format)
  const cleanReferenceNumber = referenceNumber?.startsWith('eq.') 
    ? referenceNumber.substring(3) 
    : referenceNumber;
  
  if (!cleanReferenceNumber) {
    return NextResponse.json({ error: 'Reference number is required' }, { status: 400 });
  }
  
  try {
    // Fetch claim using reference_number
    const { data, error } = await supabase
      .from('insurance_claims')
      .select('*')
      .eq('reference_number', cleanReferenceNumber);
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: `Claim with reference number ${cleanReferenceNumber} not found` }, 
        { status: 404 }
      );
    }
    
    // Return the first (and should be only) result
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error fetching claim:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch claim data',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// Additional endpoint for POST if you need to create claims
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const {
//       policy_number,
//       claim_type,
//       nik,
//       date_of_birth,
//       incident_date,
//       description,
//       document,
//       status = 'pending', // Default status
//       reference_number,
//       name, // Added new field
//       amount, // Added new field
//     } = body;

//     // Validate required fields
//     if (!policy_number) {
//       return NextResponse.json(
//         { error: 'Policy number is required' },
//         { status: 400 }
//       );
//     }

//     const { data, error } = await supabase
//       .from('insurance_claims')
//       .insert([{
//         policy_number,
//         claim_type,
//         nik,
//         date_of_birth,
//         incident_date,
//         description,
//         document,
//         status,
//         reference_number,
//         name, // Include new field
//         amount, // Include new field
//       }])
//       .select();

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 400 });
//     }

//     return NextResponse.json({ data: data[0] }, { status: 201 });
//   } catch (error) {
//     console.error('Error creating insurance claim:', error);
//     return NextResponse.json(
//       { error: 'Failed to create insurance claim' },
//       { status: 500 }
//     );
//   }
// }

function getRequiredDocuments(claim_type: string): string[] {
  switch (claim_type) {
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