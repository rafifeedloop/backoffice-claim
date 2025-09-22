'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, CheckCircle, Clock, AlertCircle, FileText, Calendar, DollarSign } from 'lucide-react';

interface ClaimStatus {
  claimId: string;
  policyNumber: string;
  policyHolderName: string;
  beneficiaryName: string;
  status: string;
  submittedAt: string;
  estimatedProcessingDate: string;
  claimAmount: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    description: string;
  }>;
  documents: {
    [key: string]: {
      status: string;
      uploadedAt: string;
    };
  };
}

export default function TrackClaimPage() {
  const searchParams = useSearchParams();
  const [searchId, setSearchId] = useState(searchParams.get('id') || '');
  const [claimData, setClaimData] = useState<ClaimStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError('Please enter a claim ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/claims/submit?claimId=${searchId}`);

      if (!response.ok) {
        throw new Error('Claim not found');
      }

      const data = await response.json();
      setClaimData(data);
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

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(Number(amount));
  };

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
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Track Your Claim</h1>
            <p className="text-sm text-gray-600 mt-1">Enter your claim ID to check the status</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Claim ID (e.g., CLM-2025-000123)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-black placeholder-opacity-70"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 flex items-center"
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
                  <p className="text-sm text-gray-600">ID: {claimData.claimId}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(claimData.status)}`}>
                  {getStatusIcon(claimData.status)}
                  <span className="ml-2">{claimData.status}</span>
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Policy Number</p>
                  <p className="font-medium">{claimData.policyNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Policy Holder</p>
                  <p className="font-medium">{claimData.policyHolderName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Beneficiary</p>
                  <p className="font-medium">{claimData.beneficiaryName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Claim Amount</p>
                  <p className="font-medium">{formatCurrency(claimData.claimAmount)}</p>
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
                    <p className="font-medium">{formatDate(claimData.submittedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Completion</p>
                    <p className="font-medium">{formatDate(claimData.estimatedProcessingDate)}</p>
                  </div>
                </div>
              </div>

              <div className="relative">
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
              </div>
            </div>

            {claimData.documents && Object.keys(claimData.documents).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Document Status</h3>

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
          </div>
        )}
      </div>
    </div>
  );
}