import { NextRequest, NextResponse } from 'next/server';

interface WhatsAppMessage {
  from: string;
  body: string;
  type: 'text' | 'image' | 'document';
  media_url?: string;
}

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
  const body = message.body.toLowerCase();
  const phoneNumber = message.from;
  
  if (body === 'hi' || body === 'hello' || body === 'start') {
    return {
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: 'Welcome to ClaimCare! How can I help you today?'
        },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'new_claim', title: 'Submit Claim' }},
            { type: 'reply', reply: { id: 'check_status', title: 'Check Status' }},
            { type: 'reply', reply: { id: 'required_docs', title: 'Required Documents' }}
          ]
        }
      }
    };
  }
  
  if (body.includes('submit claim') || body.includes('new claim')) {
    return {
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text: 'Please select your claim type:'
        },
        action: {
          button: 'Select Type',
          sections: [{
            title: 'Claim Types',
            rows: [
              { id: 'life', title: 'Life Insurance', description: 'Death benefit claim' },
              { id: 'ci', title: 'Critical Illness', description: 'Critical illness benefit' },
              { id: 'accident', title: 'Accident', description: 'Accident insurance claim' }
            ]
          }]
        }
      }
    };
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
  
  if (message.type === 'document' || message.type === 'image') {
    return {
      to: phoneNumber,
      type: 'text',
      text: {
        body: `✅ Document received!\n\n` +
              `We've received your document. Please upload all required documents for your claim type.\n\n` +
              `Once all documents are uploaded, we'll generate your Claim ID.`
      }
    };
  }
  
  return {
    to: phoneNumber,
    type: 'text',
    text: {
      body: `I can help you with:\n` +
            `• Submit a new claim\n` +
            `• Check claim status (send: STATUS <CLAIM-ID>)\n` +
            `• View required documents\n\n` +
            `Please type one of the options above or say "Hi" to start over.`
    }
  };
}