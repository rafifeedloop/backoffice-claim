import { DocumentType } from '@/types/claim';

export interface OCRResult {
  text: string;
  confidence: number;
  extractedData: ExtractedData;
  validationStatus: 'Valid' | 'Invalid' | 'Needs Review';
  errors: string[];
  classification: DocumentClassification;
  quality: DocumentQuality;
}

export interface ExtractedData {
  documentType?: DocumentType;
  name?: string;
  idNumber?: string;
  date?: string;
  amount?: number;
  diagnosis?: string;
  causeOfDeath?: string;
  hospitalName?: string;
  doctorName?: string;
  policyNumber?: string;
  beneficiaryName?: string;
  bankAccount?: string;
  relationship?: string;
  address?: string;
  phoneNumber?: string;
  medicalCode?: string;
  treatmentDetails?: string[];
}

export interface DocumentClassification {
  predictedType: DocumentType;
  confidence: number;
  alternativeTypes: { type: DocumentType; confidence: number }[];
}

export interface DocumentQuality {
  readability: number;
  completeness: number;
  hasStamp: boolean;
  hasSignature: boolean;
  isOriginal: boolean;
  issues: string[];
}

export async function processDocument(file: File | string): Promise<OCRResult> {
  // Simulate OCR processing with enhanced features
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Document classification
  const classification = await classifyDocument(file);

  // Quality assessment
  const quality = await assessDocumentQuality(file);
  
  const mockTexts = [
    {
      text: 'Death Certificate\nName: John Doe\nDate of Death: 2025-09-01\nCause: Natural Causes\nID: 1234567890',
      type: 'death_cert'
    },
    {
      text: 'Medical Report\nPatient: Jane Smith\nDiagnosis: Critical Illness\nDate: 2025-08-15\nDoctor: Dr. Johnson',
      type: 'medical_report'
    },
    {
      text: 'Police Report\nIncident: Traffic Accident\nDate: 2025-08-20\nLocation: Jakarta\nVictim: Bob Wilson',
      type: 'police_report'
    }
  ];
  
  const randomDoc = mockTexts[Math.floor(Math.random() * mockTexts.length)];
  const extractedData = await extractDataFromText(randomDoc.text, randomDoc.type as DocumentType);
  const validation = validateExtractedData(extractedData, randomDoc.type);

  return {
    text: randomDoc.text,
    confidence: 0.85 + Math.random() * 0.14,
    extractedData,
    validationStatus: validation.isValid ? 'Valid' : validation.needsReview ? 'Needs Review' : 'Invalid',
    errors: validation.errors,
    classification,
    quality
  };
}

async function extractDataFromText(text: string, docType: DocumentType): Promise<ExtractedData> {
  const data: ExtractedData = {
    documentType: docType
  };
  
  // Extract name
  const nameMatch = text.match(/(?:Name|Patient|Victim):\s*([^\n]+)/i);
  if (nameMatch) data.name = nameMatch[1].trim();
  
  // Extract ID
  const idMatch = text.match(/(?:ID|NIK):\s*(\d+)/i);
  if (idMatch) data.idNumber = idMatch[1];
  
  // Extract date
  const dateMatch = text.match(/Date(?:\s+of\s+\w+)?:\s*([\d-]+)/i);
  if (dateMatch) data.date = dateMatch[1];
  
  // Extract diagnosis
  const diagnosisMatch = text.match(/Diagnosis:\s*([^\n]+)/i);
  if (diagnosisMatch) data.diagnosis = diagnosisMatch[1].trim();
  
  // Extract cause of death
  const causeMatch = text.match(/Cause(?:\s+of\s+Death)?:\s*([^\n]+)/i);
  if (causeMatch) data.causeOfDeath = causeMatch[1].trim();
  
  // Extract hospital
  const hospitalMatch = text.match(/Hospital:\s*([^\n]+)/i);
  if (hospitalMatch) data.hospitalName = hospitalMatch[1].trim();
  
  // Extract doctor
  const doctorMatch = text.match(/Doctor:\s*([^\n]+)/i);
  if (doctorMatch) data.doctorName = doctorMatch[1].trim();

  // Extract beneficiary
  const beneficiaryMatch = text.match(/Beneficiary:\s*([^\n]+)/i);
  if (beneficiaryMatch) data.beneficiaryName = beneficiaryMatch[1].trim();

  // Extract bank account
  const bankMatch = text.match(/(?:Bank Account|Account|Rekening):\s*([\d-]+)/i);
  if (bankMatch) data.bankAccount = bankMatch[1];

  // Extract phone
  const phoneMatch = text.match(/(?:Phone|Tel|HP):\s*([\d+\s-]+)/i);
  if (phoneMatch) data.phoneNumber = phoneMatch[1].trim();

  // Extract medical codes (ICD-10)
  const icdMatch = text.match(/(?:ICD|Code|Kode):\s*([A-Z]\d{2}(?:\.\d+)?)/i);
  if (icdMatch) data.medicalCode = icdMatch[1];

  // Extract amount
  const amountMatch = text.match(/(?:Amount|Total|Jumlah):\s*(?:Rp\.?\s*)?([\d,.]+)/i);
  if (amountMatch) {
    data.amount = parseFloat(amountMatch[1].replace(/[,\.]/g, ''));
  }

  return data;
}

function validateExtractedData(data: ExtractedData, expectedType: string): {
  isValid: boolean;
  needsReview: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  let needsReview = false;
  
  // Validate based on document type
  switch(expectedType) {
    case 'death_cert':
      if (!data.name) errors.push('Name not found');
      if (!data.date) errors.push('Date of death not found');
      if (!data.causeOfDeath) {
        errors.push('Cause of death not found');
        needsReview = true;
      }
      break;
      
    case 'medical_report':
      if (!data.name) errors.push('Patient name not found');
      if (!data.diagnosis) errors.push('Diagnosis not found');
      if (!data.doctorName) needsReview = true;
      break;
      
    case 'police_report':
      if (!data.date) errors.push('Incident date not found');
      if (!data.name) needsReview = true;
      break;
  }
  
  return {
    isValid: errors.length === 0 && !needsReview,
    needsReview,
    errors
  };
}

export async function compareDocuments(doc1: ExtractedData, doc2: ExtractedData): Promise<{
  matchScore: number;
  discrepancies: string[];
}> {
  const discrepancies: string[] = [];
  let matchCount = 0;
  let totalFields = 0;
  
  const fieldsToCompare = ['name', 'idNumber', 'date', 'policyNumber'];
  
  fieldsToCompare.forEach(field => {
    if (doc1[field as keyof ExtractedData] && doc2[field as keyof ExtractedData]) {
      totalFields++;
      if (doc1[field as keyof ExtractedData] === doc2[field as keyof ExtractedData]) {
        matchCount++;
      } else {
        discrepancies.push(`${field} mismatch: "${doc1[field as keyof ExtractedData]}" vs "${doc2[field as keyof ExtractedData]}"`);
      }
    }
  });
  
  const matchScore = totalFields > 0 ? matchCount / totalFields : 0;
  
  return {
    matchScore,
    discrepancies
  };
}

async function classifyDocument(file: File | string): Promise<DocumentClassification> {
  // Simulate ML-based document classification
  const documentTypes: DocumentType[] = [
    'polis', 'death_cert', 'id_tertanggung', 'medical_report',
    'claim_form', 'doctor_letter', 'bank_account', 'police_report'
  ];

  const mainType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
  const mainConfidence = 0.75 + Math.random() * 0.2;

  // Generate alternative predictions
  const alternatives = documentTypes
    .filter(t => t !== mainType)
    .slice(0, 2)
    .map(type => ({
      type,
      confidence: Math.random() * 0.3
    }));

  return {
    predictedType: mainType,
    confidence: mainConfidence,
    alternativeTypes: alternatives
  };
}

async function assessDocumentQuality(file: File | string): Promise<DocumentQuality> {
  // Simulate document quality assessment
  const readability = 0.7 + Math.random() * 0.3;
  const completeness = 0.6 + Math.random() * 0.4;
  const issues: string[] = [];

  if (readability < 0.8) {
    issues.push('Low image quality detected');
  }

  if (completeness < 0.7) {
    issues.push('Document appears incomplete');
  }

  const hasStamp = Math.random() > 0.3;
  const hasSignature = Math.random() > 0.2;
  const isOriginal = Math.random() > 0.4;

  if (!hasStamp) {
    issues.push('Official stamp not detected');
  }

  if (!hasSignature) {
    issues.push('Signature not detected');
  }

  if (!isOriginal) {
    issues.push('Document appears to be a copy');
  }

  return {
    readability,
    completeness,
    hasStamp,
    hasSignature,
    isOriginal,
    issues
  };
}

export async function batchProcessDocuments(
  documents: Array<{ type: DocumentType; file: File | string }>
): Promise<Map<DocumentType, OCRResult>> {
  const results = new Map<DocumentType, OCRResult>();

  // Process documents in parallel for efficiency
  const promises = documents.map(async doc => {
    const result = await processDocument(doc.file);
    return { type: doc.type, result };
  });

  const processedDocs = await Promise.all(promises);

  processedDocs.forEach(({ type, result }) => {
    results.set(type, result);
  });

  return results;
}

export function calculateOCRAccuracy(results: OCRResult[]): number {
  if (results.length === 0) return 0;

  const totalAccuracy = results.reduce((sum, result) => {
    const fieldAccuracy = result.confidence;
    const qualityScore = result.quality.readability;
    const validationScore = result.validationStatus === 'Valid' ? 1 :
                          result.validationStatus === 'Needs Review' ? 0.7 : 0.3;

    return sum + (fieldAccuracy * 0.4 + qualityScore * 0.3 + validationScore * 0.3);
  }, 0);

  return totalAccuracy / results.length;
}

export async function detectDocumentForgery(ocrResult: OCRResult): Promise<{
  isSuspicious: boolean;
  forgeryIndicators: string[];
  confidence: number;
}> {
  const indicators: string[] = [];

  // Check for common forgery indicators
  if (!ocrResult.quality.hasStamp) {
    indicators.push('Missing official stamp');
  }

  if (!ocrResult.quality.isOriginal) {
    indicators.push('Document is not original');
  }

  if (ocrResult.quality.readability < 0.7) {
    indicators.push('Suspicious image quality');
  }

  if (ocrResult.confidence < 0.8) {
    indicators.push('Low OCR confidence');
  }

  // Check for data inconsistencies
  if (ocrResult.errors.length > 2) {
    indicators.push('Multiple validation errors');
  }

  const isSuspicious = indicators.length >= 2;
  const confidence = 1 - (indicators.length * 0.2);

  return {
    isSuspicious,
    forgeryIndicators: indicators,
    confidence: Math.max(0, confidence)
  };
}