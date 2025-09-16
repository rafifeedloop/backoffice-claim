'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, BarChart3, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIInsightsPage() {
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [fraudRisk, setFraudRisk] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const mockClaims = [
    {
      id: 'CLM-2025-000123',
      type: 'Life',
      amount: 100000000,
      riskScore: 0.75,
      riskLevel: 'High',
      confidence: 0.82,
      suggestedAction: 'review'
    },
    {
      id: 'CLM-2025-000124',
      type: 'CI',
      amount: 50000000,
      riskScore: 0.25,
      riskLevel: 'Low',
      confidence: 0.95,
      suggestedAction: 'approve'
    },
    {
      id: 'CLM-2025-000125',
      type: 'Accident',
      amount: 75000000,
      riskScore: 0.9,
      riskLevel: 'Critical',
      confidence: 0.88,
      suggestedAction: 'deny'
    }
  ];

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionIcon = (action: string) => {
    switch(action) {
      case 'approve': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'deny': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'review': return <Activity className="w-5 h-5 text-yellow-600" />;
      default: return null;
    }
  };

  const handleClaimSelect = (claimId: string) => {
    setSelectedClaim(claimId);
    // Simulate AI analysis
    setFraudRisk({
      indicators: [
        { type: 'early_claim', detected: true, description: 'Claim within 90 days' },
        { type: 'high_amount', detected: false, description: 'Amount within normal range' },
        { type: 'document_mismatch', detected: true, description: 'OCR detected inconsistencies' },
        { type: 'multiple_claims', detected: false, description: 'No previous claims' }
      ]
    });
    setRecommendations([
      'Request original documents for manual verification',
      'Verify policy inception date and premium payments',
      'Conduct field investigation',
      'Review medical history for pre-existing conditions'
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center">
            <Brain className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">AI Insights & Recommendations</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* AI Risk Assessment Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                AI Risk Assessment Queue
              </h2>
              <div className="space-y-3">
                {mockClaims.map((claim) => (
                  <motion.div
                    key={claim.id}
                    whileHover={{ scale: 1.02 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedClaim === claim.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleClaimSelect(claim.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{claim.id}</span>
                          <span className="text-sm text-gray-600">{claim.type}</span>
                        </div>
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">Risk:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(claim.riskLevel)}`}>
                              {claim.riskLevel} ({(claim.riskScore * 100).toFixed(0)}%)
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">AI Confidence:</span>
                            <span className="text-sm font-medium">{(claim.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end mb-1">
                          {getActionIcon(claim.suggestedAction)}
                          <span className="ml-2 text-sm font-medium capitalize">{claim.suggestedAction}</span>
                        </div>
                        <span className="text-sm text-gray-600">IDR {(claim.amount / 1000000).toFixed(0)}M</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {selectedClaim && fraudRisk && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Fraud Indicators Analysis</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {fraudRisk.indicators.map((indicator: any, idx: number) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`mt-1 w-4 h-4 rounded-full ${
                        indicator.detected ? 'bg-red-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{indicator.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-xs text-gray-600">{indicator.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* AI Recommendations */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                AI Recommendations
              </h3>
              {selectedClaim ? (
                <div className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start"
                    >
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-xs font-semibold text-purple-600">{idx + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Select a claim to view AI recommendations</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">AI Performance Metrics</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accuracy</span>
                    <span>94.2%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '94.2%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Processing Speed</span>
                    <span>2.3s avg</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '87%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fraud Detection Rate</span>
                    <span>89.5%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '89.5%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}