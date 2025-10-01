'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, CheckCircle, Clock, AlertCircle, FileText, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';


// Define document requirements by claim type
interface DocumentRequirement {
  name: string;
  required: boolean;
  description: string;
}

interface DocumentRequirements {
  [key: string]: DocumentRequirement[];
}

// Add the document interface to your existing ClaimStatus
interface ClaimStatus {
  // ...existing fields...
  id: number;
  amount: string;
  date_of_birth: string;
  name: string;
  status: string;
  incident_date: string;
  nik: string;
  claim_type: string;
  policy_number: string;
  description: string;
  reference_number: string;
  documents: {
    [key: string]: {
      status: string;
      uploadedAt: string;
    };
  };
  requiredDocuments?: DocumentRequirement[]; // Add this new field
}

function TrackClaimContent() {
  const [claimId, setClaimId] = useState('');
  const [claimData, setClaimData] = useState<ClaimStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (claimId) {
      handleSearch();
    }
  }, []);

  // Function to get required documents based on claim type
  const getRequiredDocuments = (claimType: string): DocumentRequirement[] => {
    const documentRequirements: DocumentRequirements = {
      'Health': [
        { name: 'Medical Certificate', required: true, description: 'Certificate from doctor or hospital' },
        { name: 'Medical Bills', required: true, description: 'Original medical bills and receipts' },
        { name: 'ID Card', required: true, description: 'Copy of national ID card' },
        { name: 'Claim Form', required: true, description: 'Completed health claim form' },
        { name: 'Lab Reports', required: false, description: 'Laboratory test results if applicable' }
      ],
      'Life': [
        { name: 'Death Certificate', required: true, description: 'Official death certificate' },
        { name: 'ID Card', required: true, description: 'Copy of deceased person\'s ID' },
        { name: 'Beneficiary ID', required: true, description: 'Copy of beneficiary ID' },
        { name: 'Claim Form', required: true, description: 'Completed life insurance claim form' },
        { name: 'Medical Records', required: false, description: 'Medical records related to cause of death' }
      ],
      'Vehicle': [
        { name: 'Police Report', required: true, description: 'Official police report of the accident' },
        { name: 'Vehicle Registration', required: true, description: 'Vehicle registration document' },
        { name: 'Repair Estimate', required: true, description: 'Estimate from authorized repair shop' },
        { name: 'ID Card', required: true, description: 'Copy of national ID card' },
        { name: 'Photos', required: true, description: 'Photos of vehicle damage' }
      ],
      'Property': [
        { name: 'Police Report', required: false, description: 'Required for theft or vandalism' },
        { name: 'Property Ownership', required: true, description: 'Proof of property ownership' },
        { name: 'Damage Photos', required: true, description: 'Photos of property damage' },
        { name: 'Repair Estimate', required: true, description: 'Estimate for repairs from contractor' },
        { name: 'ID Card', required: true, description: 'Copy of national ID card' }
      ]
    };
    
    // Return documents for the given claim type, or an empty array if type not found
    return documentRequirements[claimType] || [];
  };

  const handleSearch = async () => {
    if (!claimId.trim()) {
      setError('Please enter a claim ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/claims/submit?reference_number=eq.${claimId}`);

      if (!response.ok) {
        throw new Error('Claim not found');
      }

      const data = await response.json();
      
      // Enhance claim data with required documents based on claim type
      const enhancedData = {
        ...data,
        requiredDocuments: getRequiredDocuments(data.claim_type)
      };

      setClaimData(enhancedData);
    } catch (err) {
      setError('Claim not found. Please check your claim ID and try again.');
      setClaimData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Submitted': 'text-blue-600 bg-blue-50',
      'Documents Verified': 'text-purple-600 bg-purple-50',
      'Under Review': 'text-yellow-600 bg-yellow-50',
      'Processing': 'text-orange-600 bg-orange-50',
      'Approved': 'text-green-600 bg-green-50',
      'Rejected': 'text-red-600 bg-red-50',
      'Paid': 'text-green-700 bg-green-100'
    };
    return statusColors[status] || 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('Approved') || status.includes('Paid')) {
      return <CheckCircle className="w-5 h-5" />;
    } else if (status.includes('Review') || status.includes('Processing')) {
      return <Clock className="w-5 h-5" />;
    } else {
      return <AlertCircle className="w-5 h-5" />;
    }
  };

  // const formatCurrency = (amount: string) => {
  //   return new Intl.NumberFormat('id-ID', {
  //     style: 'currency',
  //     currency: 'IDR'
  //   }).format(Number(amount));
  // };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Add back button to go home */}
          <div className="flex">
            <div className="py-4 mt-2">
              <Link 
                href="/"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <ArrowLeft size={18} />
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="py-6 flex-1 text-center mr-30">
              <h1 className="text-2xl font-bold text-gray-900">Track Your Claim</h1>
              <p className="text-sm text-gray-600 mt-1">Enter your claim ID to check the status</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search box */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
              placeholder="Enter Claim ID (e.g., CLM-2025-000123)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-black placeholder-opacity-70"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 flex items-center cursor-pointer"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {claimData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Claim Information</h2>
                  {/* <p className="text-sm text-gray-600">ID: {claimData.id}</p> */}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(claimData.status)}`}>
                  {getStatusIcon(claimData.status)}
                  <span className="ml-2">{claimData.status}</span>
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Policy Number</p>
                  <p className="font-medium">{claimData.policy_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Policy Holder</p>
                  <p className="font-medium">{claimData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Beneficiary</p>
                  <p className="font-medium">{claimData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Claim Amount</p>
                  <p className="font-medium">{claimData.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Claim Type</p>
                  <p className="font-medium">{claimData.claim_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">{claimData.date_of_birth}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Processing Timeline</h3>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Submitted On</p>
                    <p className="font-medium">{formatDate(claimData.incident_date)}</p>
                  </div>
                </div>
                {/* <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Completion</p>
                    <p className="font-medium">{formatDate(claimData.estimatedProcessingDate)}</p>
                  </div>
                </div> */}
              </div>

              {/* <div className="relative">
                {claimData.statusHistory.map((status, index) => (
                  <div key={index} className="flex mb-6 last:mb-0">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      {index < claimData.statusHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-medium">{status.status}</p>
                      <p className="text-sm text-gray-600">{status.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(status.timestamp).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>

            {/* Add Required Documents Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
              <p className="text-sm text-gray-600 mb-4">
                The following documents are required for {claimData.claim_type} claims:
              </p>

              <div className="space-y-3">
                {claimData.requiredDocuments?.map((doc, index) => {
                  // Find if document has been submitted (match by name)
                  const submittedDoc = claimData.documents && 
                    Object.entries(claimData.documents).find(([key]) => 
                      key.toLowerCase().includes(doc.name.toLowerCase()));
                  
                  const isSubmitted = !!submittedDoc;
                  const verificationStatus = isSubmitted ? submittedDoc[1].status : 'Not Submitted';
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">{doc.name}</p>
                            {doc.required && (
                              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{doc.description}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isSubmitted
                          ? verificationStatus === 'Verified' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {verificationStatus}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Existing document status section can remain if you want to show both */}
            {claimData.documents && Object.keys(claimData.documents).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Submitted Documents</h3>

                <div className="space-y-3">
                  {Object.entries(claimData.documents).map(([docType, docInfo]) => (
                    <div key={docType} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium capitalize">{docType.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded: {formatDate(docInfo.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        docInfo.status === 'Verified'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {docInfo.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
                  <p className="text-sm text-blue-800">
                    If you have questions about your claim, please contact our customer service:
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-blue-700">📞 Phone: 1500-123</p>
                    <p className="text-sm text-blue-700">📧 Email: claims@insurance.com</p>
                    <p className="text-sm text-blue-700">💬 WhatsApp: +62 812-3456-7890</p>
                  </div>
                </div>
              </div>
            </div>
          </div>)
        }
      </div>
    </div>
  );
}

export default function TrackClaimPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <TrackClaimContent />
    </Suspense>
  );
}