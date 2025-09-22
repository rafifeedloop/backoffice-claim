'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';

export default function ClaimWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('validate');
  const [claimData, setClaimData] = useState<any>(null);
  const [decision, setDecision] = useState({
    status: '',
    amount: 0,
    reason: '',
    comments: ''
  });

  useEffect(() => {
    const fetchClaimData = async () => {
      try {
        const response = await fetch(`/api/cms/claims/${params.id}`);
        const data = await response.json();
        setClaimData(data);

        // Set decision amount if claim has existing amount
        if (data.amount) {
          setDecision(prev => ({ ...prev, amount: data.amount }));
        }
      } catch (error) {
        console.error('Error fetching claim:', error);
      }
    };

    fetchClaimData();
  }, [params.id]);

  const handleApproval = async (approvalType: string) => {
    const updatedDecision = {
      ...decision,
      status: approvalType,
      timestamp: new Date().toISOString()
    };

    try {
      await fetch(`/api/cms/claims/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: approvalType === 'approved' ? 'Approved' : 'Rejected',
          decision: updatedDecision,
          amount: decision.amount,
          updatedBy: 'adjuster@company.com' // In real app, get from auth context
        })
      });
      alert(`Claim ${approvalType}!`);
      router.push('/cms');
    } catch (error) {
      console.error('Error updating claim:', error);
    }
  };

  if (!claimData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Claim Workspace</h1>
                <p className="text-sm text-gray-600 mt-1">ID: {params.id}</p>
              </div>
              <button
                onClick={() => router.push('/cms')}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to Queue
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Policy Status</p>
              <p className="font-semibold text-green-600">{claimData.policy?.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Product</p>
              <p className="font-semibold">{claimData.policy?.product}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Policy Holder</p>
              <p className="font-semibold">{claimData.policy?.holderName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Decision Status</p>
              <p className="font-semibold text-yellow-600">{claimData.decision?.status}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex -mb-px">
              {['validate', 'rules', 'decision'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'validate' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Document Validation</h3>
                  <div className="space-y-3">
                    {claimData.documents?.map((doc: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">{doc.type}</p>
                            <p className="text-sm text-gray-600">OCR Status: {doc.ocrStatus}</p>
                          </div>
                        </div>
                        {doc.valid ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Beneficiary Verification</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{claimData.beneficiary?.name}</p>
                        <p className="text-sm text-gray-600">Match Score: {(claimData.beneficiary?.matchScore * 100).toFixed(0)}%</p>
                      </div>
                      {claimData.beneficiary?.matchScore > 0.9 ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Rule Engine Outcomes</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Cause of Death</p>
                      <span className="text-sm text-gray-600">{claimData.ruleOutcomes?.causeOfDeath}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Exclusion Match</p>
                      <span className={`text-sm font-semibold ${
                        claimData.ruleOutcomes?.exclusionMatch ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {claimData.ruleOutcomes?.exclusionMatch ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Evidence</h4>
                    <ul className="space-y-2">
                      {claimData.ruleOutcomes?.evidence?.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'decision' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Claim Decision</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setDecision({...decision, status: 'Approved'})}
                    className={`p-4 border-2 rounded-lg text-center hover:border-green-500 ${
                      decision.status === 'Approved' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold">Approve</p>
                  </button>
                  <button
                    onClick={() => setDecision({...decision, status: 'PartialApproved'})}
                    className={`p-4 border-2 rounded-lg text-center hover:border-yellow-500 ${
                      decision.status === 'PartialApproved' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                    }`}
                  >
                    <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="font-semibold">Partial Approve</p>
                  </button>
                  <button
                    onClick={() => setDecision({...decision, status: 'Denied'})}
                    className={`p-4 border-2 rounded-lg text-center hover:border-red-500 ${
                      decision.status === 'Denied' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="font-semibold">Deny</p>
                  </button>
                </div>

                {decision.status && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Benefit Amount
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={decision.amount || ''}
                        onChange={(e) => setDecision({...decision, amount: parseFloat(e.target.value) || 0})}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comments / Reason
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={4}
                        value={decision.comments}
                        onChange={(e) => setDecision({...decision, comments: e.target.value})}
                        placeholder="Enter decision rationale..."
                      />
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">4-Eyes Approval Required</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    This decision requires approval from {claimData.decision?.requiredApprovals} reviewers.
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm">Current Approvals: {claimData.decision?.currentApprovals}/{claimData.decision?.requiredApprovals}</span>
                    </div>
                  </div>
                </div>

                {decision.status && (
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setDecision({status: '', amount: 0, reason: '', comments: ''})}
                      className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleApproval(decision.status)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Submit Decision
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}