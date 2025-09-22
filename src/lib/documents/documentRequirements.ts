import { DocumentType } from '@/types/claim';

export interface DocumentRequirement {
  documentType: DocumentType;
  required: boolean;
  conditional?: string;
  description: string;
  validationRules?: {
    maxSizeMB?: number;
    allowedFormats?: string[];
    expiryDays?: number;
  };
}

export const documentRequirements: Record<string, DocumentRequirement[]> = {
  Life: [
    {
      documentType: 'polis',
      required: true,
      description: 'Policy document showing coverage details'
    },
    {
      documentType: 'death_cert',
      required: true,
      description: 'Official death certificate (Akta/Surat Kematian)'
    },
    {
      documentType: 'id_beneficiary',
      required: true,
      description: 'Beneficiary identification (KTP/Passport)'
    },
    {
      documentType: 'claim_form',
      required: true,
      description: 'Completed claim form with signatures'
    },
    {
      documentType: 'doctor_letter',
      required: true,
      description: 'Doctor statement on cause of death'
    },
    {
      documentType: 'bank_account',
      required: true,
      description: 'Bank account details for payment'
    },
    {
      documentType: 'police_report',
      required: false,
      conditional: 'accident',
      description: 'Police report if death due to accident'
    },
    {
      documentType: 'family_relation',
      required: false,
      conditional: 'beneficiary_verification',
      description: 'Family relation proof (KK/Birth Certificate)'
    }
  ],

  CI: [
    {
      documentType: 'polis',
      required: true,
      description: 'Policy document'
    },
    {
      documentType: 'id_tertanggung',
      required: true,
      description: 'Insured person ID'
    },
    {
      documentType: 'id_beneficiary',
      required: true,
      description: 'Policy holder ID'
    },
    {
      documentType: 'claim_form',
      required: true,
      description: 'CI claim form'
    },
    {
      documentType: 'ci_diagnosis',
      required: true,
      description: 'Diagnosis results and lab reports'
    },
    {
      documentType: 'medical_report',
      required: true,
      description: 'Medical authorization letter'
    },
    {
      documentType: 'bank_account',
      required: true,
      description: 'Bank account for payment'
    },
    {
      documentType: 'accident_report',
      required: false,
      conditional: 'ci_from_accident',
      description: 'Accident report if CI caused by accident'
    }
  ],

  Accident: [
    {
      documentType: 'claim_form',
      required: true,
      description: 'Health/accident claim form'
    },
    {
      documentType: 'polis',
      required: true,
      description: 'Policy document'
    },
    {
      documentType: 'id_tertanggung',
      required: true,
      description: 'ID of insured'
    },
    {
      documentType: 'medical_receipt',
      required: true,
      description: 'Original receipts with cost breakdown'
    },
    {
      documentType: 'medical_resume',
      required: true,
      description: 'Medical resume from hospital'
    },
    {
      documentType: 'doctor_letter',
      required: true,
      description: 'Doctor statement'
    },
    {
      documentType: 'police_report',
      required: false,
      conditional: 'traffic_accident',
      description: 'Police report for traffic accidents'
    },
    {
      documentType: 'lab_result',
      required: false,
      conditional: 'if_performed',
      description: 'Lab/X-ray results if performed'
    }
  ],

  Health: [
    {
      documentType: 'claim_form',
      required: true,
      description: 'Health claim form'
    },
    {
      documentType: 'polis',
      required: true,
      description: 'Policy document'
    },
    {
      documentType: 'id_tertanggung',
      required: true,
      description: 'ID of insured'
    },
    {
      documentType: 'medical_receipt',
      required: true,
      description: 'Original receipts and bills'
    },
    {
      documentType: 'medical_resume',
      required: true,
      description: 'Medical resume'
    },
    {
      documentType: 'doctor_letter',
      required: true,
      description: 'Doctor certificate'
    }
  ]
};

export function getChecklistForClaimType(claimType: string): DocumentRequirement[] {
  return documentRequirements[claimType] || [];
}

export function validateDocumentCompleteness(
  claimType: string,
  uploadedDocuments: DocumentType[],
  conditions: Record<string, boolean> = {}
): {
  complete: boolean;
  missing: DocumentType[];
  percentage: number;
} {
  const requirements = getChecklistForClaimType(claimType);
  const missing: DocumentType[] = [];
  let requiredCount = 0;
  let uploadedCount = 0;

  requirements.forEach(req => {
    const isRequired = req.required || (req.conditional && conditions[req.conditional]);

    if (isRequired) {
      requiredCount++;
      if (uploadedDocuments.includes(req.documentType)) {
        uploadedCount++;
      } else {
        missing.push(req.documentType);
      }
    }
  });

  const percentage = requiredCount > 0 ? (uploadedCount / requiredCount) * 100 : 0;

  return {
    complete: missing.length === 0,
    missing,
    percentage: Math.round(percentage)
  };
}