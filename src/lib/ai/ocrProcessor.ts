export interface OCRResult {
  text: string;
  confidence: number;
  extractedData: ExtractedData;
  validationStatus: 'Valid' | 'Invalid' | 'Needs Review';
  errors: string[];
}

export interface ExtractedData {
  documentType?: string;
  name?: string;
  idNumber?: string;
  date?: string;
  amount?: number;
  diagnosis?: string;
  causeOfDeath?: string;
  hospitalName?: string;
  doctorName?: string;
  policyNumber?: string;
}

export async function processDocument(file: File | string): Promise<OCRResult> {
  // Simulate OCR processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
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
  const extractedData = extractDataFromText(randomDoc.text, randomDoc.type);
  const validation = validateExtractedData(extractedData, randomDoc.type);
  
  return {
    text: randomDoc.text,
    confidence: 0.85 + Math.random() * 0.14,
    extractedData,
    validationStatus: validation.isValid ? 'Valid' : validation.needsReview ? 'Needs Review' : 'Invalid',
    errors: validation.errors
  };
}

function extractDataFromText(text: string, docType: string): ExtractedData {
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