'use client';

import { useState } from 'react';
import { Upload, Play, Pause, CheckCircle, XCircle, AlertCircle, FileSpreadsheet, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BatchProcessingPage() {
  const [batchJobs, setBatchJobs] = useState([
    {
      id: 'BATCH-001',
      name: 'Monthly Life Claims Processing',
      status: 'completed',
      totalClaims: 156,
      processed: 156,
      approved: 112,
      denied: 28,
      pending: 16,
      startTime: '2025-09-15 09:00',
      endTime: '2025-09-15 11:30',
      progress: 100
    },
    {
      id: 'BATCH-002',
      name: 'CI Claims Auto-Review',
      status: 'processing',
      totalClaims: 89,
      processed: 67,
      approved: 45,
      denied: 12,
      pending: 10,
      startTime: '2025-09-16 08:30',
      endTime: null,
      progress: 75
    },
    {
      id: 'BATCH-003',
      name: 'Accident Claims Q3',
      status: 'queued',
      totalClaims: 234,
      processed: 0,
      approved: 0,
      denied: 0,
      pending: 0,
      startTime: null,
      endTime: null,
      progress: 0
    }
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingRules, setProcessingRules] = useState({
    autoApproveThreshold: 0.8,
    fraudCheckEnabled: true,
    ocrValidation: true,
    maxProcessingTime: 120
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />;
      case 'queued':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const startBatchProcessing = () => {
    if (!selectedFile) return;
    
    const newBatch = {
      id: `BATCH-${String(batchJobs.length + 1).padStart(3, '0')}`,
      name: selectedFile.name.replace('.csv', ''),
      status: 'processing',
      totalClaims: Math.floor(Math.random() * 300) + 50,
      processed: 0,
      approved: 0,
      denied: 0,
      pending: 0,
      startTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      endTime: null,
      progress: 0
    };
    
    setBatchJobs([newBatch, ...batchJobs]);
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Batch Processing & Automation</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Upload Batch Claims</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-center">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload CSV file with batch claims</p>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="batch-upload"
              />
              <label
                htmlFor="batch-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select File
              </label>
              {selectedFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
                  <button
                    onClick={startBatchProcessing}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Start Processing
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Processing Rules */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Automation Rules</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Approve Confidence Threshold
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={processingRules.autoApproveThreshold * 100}
                  onChange={(e) => setProcessingRules({
                    ...processingRules,
                    autoApproveThreshold: parseInt(e.target.value) / 100
                  })}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12">
                  {(processingRules.autoApproveThreshold * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Processing Time (minutes)
              </label>
              <input
                type="number"
                value={processingRules.maxProcessingTime}
                onChange={(e) => setProcessingRules({
                  ...processingRules,
                  maxProcessingTime: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="fraud-check"
                checked={processingRules.fraudCheckEnabled}
                onChange={(e) => setProcessingRules({
                  ...processingRules,
                  fraudCheckEnabled: e.target.checked
                })}
                className="mr-2"
              />
              <label htmlFor="fraud-check" className="text-sm font-medium text-gray-700">
                Enable AI Fraud Detection
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ocr-validation"
                checked={processingRules.ocrValidation}
                onChange={(e) => setProcessingRules({
                  ...processingRules,
                  ocrValidation: e.target.checked
                })}
                className="mr-2"
              />
              <label htmlFor="ocr-validation" className="text-sm font-medium text-gray-700">
                Enable OCR Document Validation
              </label>
            </div>
          </div>
        </div>

        {/* Batch Jobs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Batch Processing Jobs</h2>
          </div>
          <div className="divide-y">
            {batchJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="font-medium">{job.name}</p>
                      <p className="text-sm text-gray-600">{job.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {job.status === 'processing' && (
                      <button className="p-2 hover:bg-gray-200 rounded">
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    {job.status === 'completed' && (
                      <button className="p-2 hover:bg-gray-200 rounded">
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{job.processed}/{job.totalClaims}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Approved</p>
                    <p className="font-semibold text-green-600">{job.approved}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Denied</p>
                    <p className="font-semibold text-red-600">{job.denied}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pending Review</p>
                    <p className="font-semibold text-yellow-600">{job.pending}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold">
                      {job.startTime ? (
                        job.endTime ? 
                          `${new Date(job.endTime).getTime() - new Date(job.startTime).getTime()} min` :
                          'Running...'
                      ) : '-'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}