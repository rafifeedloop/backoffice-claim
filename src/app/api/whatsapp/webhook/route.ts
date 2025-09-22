import { NextRequest, NextResponse } from 'next/server';

interface WhatsAppMessage {
  from: string;
  body: string;
  type: 'text' | 'image' | 'document' | 'interactive';
  media_url?: string;
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string };
  };
}

interface ClaimSession {
  phoneNumber: string;
  step: 'init' | 'type_selected' | 'policy_number' | 'nik' | 'dob' | 'documents' | 'completed';
  claimType?: 'Life' | 'CI' | 'Accident' | 'Health';
  policyNumber?: string;
  nik?: string;
  dob?: string;
  documents: Array<{ type: string; url: string }>;
  startedAt: Date;
  claimId?: string;
}

const sessions = new Map<string, ClaimSession>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message: WhatsAppMessage = body.message;
    
    const response = await handleWhatsAppMessage(message);
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process WhatsApp message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const verifyToken = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  if (verifyToken === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }
  
  return NextResponse.json({ error: 'Invalid verify token' }, { status: 403 });
}

async function handleWhatsAppMessage(message: WhatsAppMessage) {
  const phoneNumber = message.from;
  let session = sessions.get(phoneNumber);

  if (message.type === 'interactive') {
    return handleInteractiveMessage(message, session);
  }

  const body = message.body.toLowerCase();
  
  if (body === 'hi' || body === 'hello' || body === 'start' || body === 'reset') {
    sessions.delete(phoneNumber);
    return {
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        header: {
          type: 'text',
          text: '🏥 ClaimCare Insurance'
        },
        body: {
          text: 'Welcome! I\'m your claims assistant. I\'ll guide you through the claim process step-by-step. How can I help you today?'
        },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'new_claim', title: '📝 Submit Claim' }},
            { type: 'reply', reply: { id: 'check_status', title: '🔍 Check Status' }},
            { type: 'reply', reply: { id: 'required_docs', title: '📄 Documents Info' }}
          ]
        }
      }
    };
  }
  
  if (session && session.step === 'policy_number') {
    if (body.match(/^[A-Z0-9]{8,12}$/i)) {
      session.policyNumber = body.toUpperCase();
      session.step = 'nik';
      sessions.set(phoneNumber, session);

      return {
        to: phoneNumber,
        type: 'text',
        text: {
          body: `✅ Policy Number: ${session.policyNumber} recorded.\n\nPlease enter your NIK (16-digit ID number):`
        }
      };
    } else {
      return {
        to: phoneNumber,
        type: 'text',
        text: {
          body: '❌ Invalid policy number format. Please enter a valid policy number (8-12 alphanumeric characters):'
        }
      };
    }
  }

  if (session && session.step === 'nik') {
    if (body.match(/^\d{16}$/)) {
      session.nik = body;
      session.step = 'dob';
      sessions.set(phoneNumber, session);

      return {
        to: phoneNumber,
        type: 'text',
        text: {
          body: `✅ NIK: ${session.nik} recorded.\n\nPlease enter your Date of Birth (DD-MM-YYYY):`
        }
      };
    } else {
      return {
        to: phoneNumber,
        type: 'text',
        text: {
          body: '❌ Invalid NIK format. Please enter a valid 16-digit NIK:'
        }
      };
    }
  }

  if (session && session.step === 'dob') {
    if (body.match(/^\d{2}-\d{2}-\d{4}$/)) {
      session.dob = body;
      session.step = 'documents';
      sessions.set(phoneNumber, session);

      const requiredDocs = getRequiredDocuments(session.claimType!);

      return {
        to: phoneNumber,
        type: 'text',
        text: {
          body: `✅ Date of Birth: ${session.dob} recorded.\n\n📄 *Required Documents for ${session.claimType} Claim:*\n${requiredDocs}\n\nPlease upload each document one by one. I'll confirm receipt of each document.`
        }
      };
    } else {
      return {
        to: phoneNumber,
        type: 'text',
        text: {
          body: '❌ Invalid date format. Please enter your Date of Birth as DD-MM-YYYY:'
        }
      };
    }
  }
  
  if (body.startsWith('status ')) {
    const claimId = body.replace('status ', '').toUpperCase();
    
    const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/claim/status?claimId=${claimId}`);
    const statusData = await statusResponse.json();
    
    return {
      to: phoneNumber,
      type: 'text',
      text: {
        body: `📋 Claim Status Update\n\n` +
              `Claim ID: ${statusData.id}\n` +
              `Current Status: ${statusData.status}\n` +
              `Last Update: ${statusData.timeline[statusData.timeline.length - 1]?.date}\n\n` +
              `To check again, send: STATUS ${claimId}`
      }
    };
  }
  
  if (body === 'required documents' || body === 'documents') {
    return {
      to: phoneNumber,
      type: 'text',
      text: {
        body: `📄 Required Documents by Claim Type:\n\n` +
              `*Life Insurance:*\n` +
              `• Death Certificate\n` +
              `• Policy Document\n` +
              `• Beneficiary ID\n` +
              `• Medical Records\n\n` +
              `*Critical Illness:*\n` +
              `• Medical Diagnosis\n` +
              `• Hospital Records\n` +
              `• Doctor's Statement\n\n` +
              `*Accident:*\n` +
              `• Police Report\n` +
              `• Medical Report\n` +
              `• Accident Photos`
      }
    };
  }
  
  if ((message.type === 'document' || message.type === 'image') && session && session.step === 'documents') {
    session.documents.push({
      type: determineDocumentType(session.documents.length, session.claimType!),
      url: message.media_url || ''
    });
    sessions.set(phoneNumber, session);

    const requiredCount = getRequiredDocumentCount(session.claimType!);
    const remaining = requiredCount - session.documents.length;

    if (remaining > 0) {
      return {
        to: phoneNumber,
        type: 'text',
        text: {
          body: `✅ Document ${session.documents.length}/${requiredCount} received!\n\nPlease upload the next document. (${remaining} remaining)`
        }
      };
    } else {
      const claimId = await createClaim(session);
      session.claimId = claimId;
      session.step = 'completed';
      sessions.set(phoneNumber, session);

      return {
        to: phoneNumber,
        type: 'text',
        text: {
          body: `🎉 *Claim Successfully Submitted!*\n\n` +
                `📋 Claim ID: *${claimId}*\n` +
                `📍 Status: Processing\n` +
                `⏱️ SLA: 5 business days\n\n` +
                `We'll process your claim and notify you of updates via WhatsApp.\n\n` +
                `To check status anytime, send:\n` +
                `STATUS ${claimId}`
        }
      };
    }
  }
  
  return {
    to: phoneNumber,
    type: 'text',
    text: {
      body: `I can help you with:\n` +
            `• Submit a new claim\n` +
            `• Check claim status (send: STATUS <CLAIM-ID>)\n` +
            `• View required documents\n\n` +
            `Please type "Hi" to start or "Reset" to start over.`
    }
  };
}

async function handleInteractiveMessage(message: WhatsAppMessage, session: ClaimSession | undefined) {
  const phoneNumber = message.from;
  const buttonId = message.interactive?.button_reply?.id;
  const listId = message.interactive?.list_reply?.id;

  if (buttonId === 'new_claim') {
    sessions.set(phoneNumber, {
      phoneNumber,
      step: 'type_selected',
      documents: [],
      startedAt: new Date()
    });

    return {
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: '📝 New Claim Submission'
        },
        body: {
          text: 'Please select your claim type:'
        },
        footer: {
          text: 'Select the type that matches your claim'
        },
        action: {
          button: 'Select Type',
          sections: [{
            title: 'Available Claim Types',
            rows: [
              { id: 'life_claim', title: 'Life Insurance', description: 'Death benefit claim' },
              { id: 'ci_claim', title: 'Critical Illness', description: 'CI benefit claim' },
              { id: 'accident_claim', title: 'Accident', description: 'Accident insurance claim' },
              { id: 'health_claim', title: 'Health', description: 'Medical expense claim' }
            ]
          }]
        }
      }
    };
  }

  if (listId && listId.endsWith('_claim')) {
    const claimTypeMap: { [key: string]: 'Life' | 'CI' | 'Accident' | 'Health' } = {
      'life_claim': 'Life',
      'ci_claim': 'CI',
      'accident_claim': 'Accident',
      'health_claim': 'Health'
    };

    const claimType = claimTypeMap[listId];
    if (!session) {
      session = {
        phoneNumber,
        step: 'init',
        documents: [],
        startedAt: new Date()
      };
    }

    session.claimType = claimType;
    session.step = 'policy_number';
    sessions.set(phoneNumber, session);

    return {
      to: phoneNumber,
      type: 'text',
      text: {
        body: `You selected: *${claimType} Claim*\n\nLet's start collecting your information.\n\nPlease enter your Policy Number:`
      }
    };
  }

  return {
    to: phoneNumber,
    type: 'text',
    text: {
      body: 'Please use the menu options or type "Hi" to start.'
    }
  };
}

function getRequiredDocuments(claimType: string): string {
  const docs: { [key: string]: string[] } = {
    'Life': [
      '• Polis (Policy Document)',
      '• Akta/Surat Kematian (Death Certificate)',
      '• ID Beneficiary',
      '• Formulir Klaim (Claim Form)',
      '• Surat Keterangan Dokter',
      '• Buku Tabungan (Bank Account)'
    ],
    'CI': [
      '• Polis (Policy Document)',
      '• ID Tertanggung & Pemegang Polis',
      '• Formulir Klaim CI',
      '• Hasil Diagnosis/Lab',
      '• Surat Kuasa Data Medis',
      '• Rekening Bank'
    ],
    'Accident': [
      '• Polis (Policy Document)',
      '• ID',
      '• Laporan Polisi (Police Report)',
      '• Surat Keterangan Dokter',
      '• Kwitansi Biaya Medis',
      '• Foto Kecelakaan (if available)'
    ],
    'Health': [
      '• Form Klaim Kesehatan',
      '• Polis',
      '• ID',
      '• Kwitansi Asli + Rincian Biaya',
      '• Resume Medis',
      '• Surat Dokter'
    ]
  };

  return docs[claimType]?.join('\n') || 'Documents required for this claim type';
}

function getRequiredDocumentCount(claimType: string): number {
  const counts: { [key: string]: number } = {
    'Life': 6,
    'CI': 6,
    'Accident': 5,
    'Health': 6
  };
  return counts[claimType] || 5;
}

function determineDocumentType(index: number, claimType: string): string {
  const docTypes: { [key: string]: string[] } = {
    'Life': ['polis', 'death_cert', 'id_beneficiary', 'claim_form', 'doctor_letter', 'bank_account'],
    'CI': ['polis', 'id_tertanggung', 'claim_form', 'ci_diagnosis', 'medical_auth', 'bank_account'],
    'Accident': ['polis', 'id_tertanggung', 'police_report', 'doctor_letter', 'medical_bill'],
    'Health': ['claim_form', 'polis', 'id_tertanggung', 'medical_receipt', 'medical_resume', 'doctor_letter']
  };

  return docTypes[claimType]?.[index] || 'document';
}

async function createClaim(session: ClaimSession): Promise<string> {
  const claimId = `CLM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;

  const claimData = {
    id: claimId,
    policyId: session.policyNumber,
    type: session.claimType,
    beneficiaryNIK: session.nik,
    documents: session.documents,
    channel: 'WhatsApp',
    status: 'Intake',
    createdAt: new Date(),
    slaDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  };

  try {
    await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/claim/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claimData)
    });
  } catch (error) {
    console.error('Error creating claim:', error);
  }

  return claimId;
}