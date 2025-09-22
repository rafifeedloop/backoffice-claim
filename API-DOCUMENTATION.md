# CMS API Documentation

## Overview
Complete API endpoints for the Claim Management System (CMS) with database integration.

## Database
- In-memory database simulation with persistent storage during runtime
- Pre-populated with sample claims data
- Full CRUD operations support

## API Endpoints

### 1. Claims Management

#### GET /api/cms/claims
Retrieve all claims with filtering and pagination
- Query params:
  - `status` - Filter by claim status
  - `assignedTo` - Filter by assigned adjuster
  - `priority` - Filter by priority level
  - `channel` - Filter by submission channel
  - `dateFrom` - Filter by start date
  - `dateTo` - Filter by end date
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 10)

#### GET /api/cms/claims/[id]
Get specific claim details by ID

#### PUT /api/cms/claims/[id]
Update claim information
- Body:
  ```json
  {
    "status": "Approved",
    "amount": 1000000,
    "updatedBy": "adjuster@company.com"
  }
  ```

#### DELETE /api/cms/claims/[id]
Soft delete claim (changes status to "Closed")

### 2. Statistics & Analytics

#### GET /api/cms/claims/stats
Get comprehensive statistics and metrics
- Returns:
  - Total claims count
  - Status breakdown
  - Priority breakdown
  - Channel breakdown
  - Performance metrics
  - SLA compliance rate

### 3. Search & Export

#### GET /api/cms/claims/search
Advanced search with multiple filters
- Query params:
  - `q` - Search query
  - `field` - Search field (id, policyNumber, beneficiaryName, nik, all)
  - `status` - Filter by status
  - `priority` - Filter by priority
  - `riskLevel` - Filter by risk level
  - `slaStatus` - Filter by SLA status
  - `minAmount` - Minimum claim amount
  - `maxAmount` - Maximum claim amount
  - `sortBy` - Sort field
  - `sortOrder` - asc/desc

#### GET /api/cms/claims/export
Export claims data in various formats
- Query params:
  - `format` - Export format (json, csv, summary)
  - `dateFrom` - Start date filter
  - `dateTo` - End date filter

### 4. Claim Operations

#### POST /api/cms/claims/[id]/notes
Add note to claim
- Body:
  ```json
  {
    "text": "Note content",
    "createdBy": "user@company.com"
  }
  ```

#### GET /api/cms/claims/[id]/notes
Get all notes for a claim

#### POST /api/cms/claims/[id]/assign
Assign claim to adjuster
- Body:
  ```json
  {
    "assignedTo": "adjuster@company.com",
    "assignedBy": "manager@company.com"
  }
  ```

#### GET /api/cms/claims/[id]/assign
Get assignment history for a claim

#### GET /api/cms/claims/[id]/audit-log
Get complete audit trail for a claim

### 5. Bulk Operations

#### POST /api/cms/claims/bulk
Perform bulk operations on multiple claims
- Body:
  ```json
  {
    "action": "assign|updateStatus|updatePriority|addNote|close",
    "claimIds": ["CLM-2024-000001", "CLM-2024-000002"],
    "data": {
      "assignedTo": "adjuster@company.com",
      "status": "Approved",
      "priority": "High",
      "note": "Bulk note text"
    },
    "performedBy": "manager@company.com"
  }
  ```

### 6. WhatsApp Integration

#### POST /api/whatsapp/webhook
Handle WhatsApp messages for claim submission

#### GET /api/whatsapp/webhook
Verify WhatsApp webhook

### 7. Claim Submission

#### POST /api/claims/submit
Submit new claim via web interface

#### POST /api/claim/initiate
Initialize new claim (used by WhatsApp integration)

#### GET /api/claim/status
Check claim status by ID

## Data Models

### Claim Object
```typescript
{
  id: string;
  policyNumber: string;
  claimType: 'Life' | 'Health' | 'Accident' | 'Critical Illness';
  nik: string;
  dateOfBirth: string;
  incidentDate: string;
  description: string;
  documents: Document[];
  status: 'Intake' | 'Document Review' | 'Validation' | 'Investigation' | 'Decision' | 'Approved' | 'Rejected' | 'Closed';
  amount?: number;
  beneficiaryName: string;
  beneficiaryNIK: string;
  submittedAt: string;
  updatedAt: string;
  assignedTo?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  slaDeadline: string;
  slaStatus: 'Green' | 'Yellow' | 'Red';
  decision?: Decision;
  notes: Note[];
  auditLog: AuditEntry[];
  channel: 'Web' | 'WhatsApp' | 'Email' | 'Phone';
  fraudScore?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
}
```

## Features

1. **Complete CRUD Operations** - Create, Read, Update, Delete claims
2. **Advanced Filtering** - Multiple filter options for precise data retrieval
3. **Audit Trail** - Complete history tracking for compliance
4. **Bulk Operations** - Process multiple claims simultaneously
5. **Export Capabilities** - Export data in JSON, CSV, or summary format
6. **Assignment Management** - Track and manage claim assignments
7. **Notes System** - Internal communication and documentation
8. **Statistics Dashboard** - Real-time metrics and analytics
9. **Search Functionality** - Advanced search across multiple fields
10. **WhatsApp Integration** - Accept claims via WhatsApp channel

## Usage Examples

### Get all pending claims
```
GET /api/cms/claims?status=Intake&status=Document Review
```

### Search for claims by NIK
```
GET /api/cms/claims/search?q=3217050801900001&field=nik
```

### Export claims as CSV
```
GET /api/cms/claims/export?format=csv&dateFrom=2024-01-01&dateTo=2024-12-31
```

### Bulk assign claims
```
POST /api/cms/claims/bulk
{
  "action": "assign",
  "claimIds": ["CLM-2024-000001", "CLM-2024-000002"],
  "data": { "assignedTo": "adjuster@company.com" }
}
```