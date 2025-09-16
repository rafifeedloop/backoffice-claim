'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Upload, Check, AlertCircle } from 'lucide-react';

export default function ClaimPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    policyId: '',
    nik: '',
    dob: '',
    claimType: 'Life',
    beneficiaryName: '',
    beneficiaryNIK: '',
    documents: [] as File[]
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const response = await fetch('/api/claim/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        policyId: formData.policyId,
        type: formData.claimType,
        beneficiaryNIK: formData.beneficiaryNIK,
        documents: formData.documents.map(f => ({ 
          type: f.name.includes('death') ? 'death_cert' : 'id',
          url: `/uploads/${f.name}`
        }))
      })
    });
    
    const claim = await response.json();
    router.push(`/status?claimId=${claim.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Submit Insurance Claim</h1>
            <div className="flex items-center mt-4 space-x-4">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {s < step ? <Check className="w-5 h-5" /> : s}
                  </div>
                  {s < 4 && <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Step 1: Policy Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.policyId}
                    onChange={(e) => setFormData({...formData, policyId: e.target.value})}
                    placeholder="P-001234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIK (National ID Number)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.nik}
                    onChange={(e) => setFormData({...formData, nik: e.target.value})}
                    placeholder="3210000000000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Claim Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.claimType}
                    onChange={(e) => setFormData({...formData, claimType: e.target.value})}
                  >
                    <option value="Life">Life Insurance</option>
                    <option value="CI">Critical Illness</option>
                    <option value="Accident">Accident</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Step 2: Upload Documents</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drop files here or click to browse</p>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setFormData({...formData, documents: files});
                    }}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                    Select Files
                  </label>
                </div>
                {formData.documents.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Uploaded Documents:</h3>
                    <ul className="space-y-1">
                      {formData.documents.map((doc, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          {doc.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Step 3: Review & Confirm</h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Policy Number:</span>
                    <span className="font-medium">{formData.policyId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Claim Type:</span>
                    <span className="font-medium">{formData.claimType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Documents:</span>
                    <span className="font-medium">{formData.documents.length} files</span>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm text-blue-800">
                        Your claim will be processed within 5-7 business days. 
                        You'll receive updates via SMS and email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Submitted!</h2>
                <p className="text-gray-600 mb-4">
                  Your claim ID is: <span className="font-mono font-bold">CLM-2025-{Math.floor(Math.random() * 999999)}</span>
                </p>
                <p className="text-sm text-gray-500">You can track your claim status anytime.</p>
              </div>
            )}
          </div>

          <div className="border-t px-6 py-4 flex justify-between">
            {step > 1 && step < 4 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {step < 3 && (
              <button
                onClick={handleNext}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            )}
            {step === 3 && (
              <button
                onClick={() => { handleSubmit(); setStep(4); }}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Claim
              </button>
            )}
            {step === 4 && (
              <button
                onClick={() => router.push('/status')}
                className="mx-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Track Status
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}