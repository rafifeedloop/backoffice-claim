'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, FileText, CreditCard, XCircle } from 'lucide-react';

interface TimelineItem {
  stage: string;
  date: string;
  description?: string;
  icon: any;
  status: 'completed' | 'current' | 'pending';
}

function StatusContent() {
  const searchParams = useSearchParams();
  const [claimId, setClaimId] = useState('');
  const [claimData, setClaimData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = searchParams.get('claimId');
    if (id) {
      setClaimId(id);
      fetchClaimStatus(id);
    }
  }, [searchParams]);

  const fetchClaimStatus = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/claim/status?claimId=${id}`);
      const data = await response.json();
      setClaimData(data);
    } catch (error) {
      console.error('Error fetching claim status:', error);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (claimId) {
      fetchClaimStatus(claimId);
    }
  };

  const getTimelineItems = (): TimelineItem[] => {
    const stages = [
      { name: 'Received', icon: FileText },
      { name: 'Verification', icon: Clock },
      { name: 'Decision', icon: CheckCircle },
      { name: 'Payment', icon: CreditCard },
      { name: 'Closed', icon: CheckCircle }
    ];

    const currentStageIndex = stages.findIndex(s => s.name === claimData?.status);

    return stages.map((stage, index) => ({
      stage: stage.name,
      date: claimData?.timeline?.find((t: any) => t.stage === stage.name)?.date || '',
      description: claimData?.timeline?.find((t: any) => t.stage === stage.name)?.description || '',
      icon: stage.icon,
      status: index < currentStageIndex ? 'completed' : index === currentStageIndex ? 'current' : 'pending'
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Track Your Claim</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter Claim ID (e.g., CLM-2025-000123)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading claim details...</p>
          </div>
        )}

        {claimData && !loading && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Claim Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Claim ID</p>
                  <p className="font-semibold">{claimData.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <p className="font-semibold text-blue-600">{claimData.status}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Progress Timeline</h2>
              <div className="relative">
                {getTimelineItems().map((item, index) => (
                  <div key={index} className="flex items-start mb-8 last:mb-0">
                    <div className="relative flex items-center justify-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        item.status === 'completed' ? 'bg-green-100' :
                        item.status === 'current' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <item.icon className={`w-6 h-6 ${
                          item.status === 'completed' ? 'text-green-600' :
                          item.status === 'current' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                      {index < getTimelineItems().length - 1 && (
                        <div className={`absolute top-12 left-6 w-0.5 h-16 ${
                          item.status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className={`font-semibold ${
                        item.status === 'completed' ? 'text-green-700' :
                        item.status === 'current' ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {item.stage}
                      </h3>
                      {item.date && (
                        <p className="text-sm text-gray-600 mt-1">{item.date}</p>
                      )}
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {claimData.missingDocs && claimData.missingDocs.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Missing Documents</h3>
                <ul className="list-disc list-inside text-sm text-yellow-700">
                  {claimData.missingDocs.map((doc: string, idx: number) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="flex gap-4">
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  Live Chat
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  Call Center: 1-800-CLAIMS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <StatusContent />
    </Suspense>
  );
}