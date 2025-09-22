'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle, Target, Activity, FileText } from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  unit?: string;
  icon: any;
  status: 'good' | 'warning' | 'critical';
}

interface SLAMetric {
  stage: string;
  target: string;
  current: string;
  compliance: number;
  trend: 'up' | 'down' | 'stable';
}

export default function MetricsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [slaMetrics, setSlaMetrics] = useState<SLAMetric[]>([]);
  const [aiMetrics, setAiMetrics] = useState<any>({});

  useEffect(() => {
    fetchMetrics();
    fetchSLAMetrics();
    fetchAIMetrics();
  }, [timeRange]);

  const fetchMetrics = () => {
    setMetrics([
      {
        title: 'Total Claims',
        value: 1247,
        change: 12.5,
        icon: FileText,
        status: 'good'
      },
      {
        title: 'Auto-Approval Rate',
        value: '32%',
        change: 8.3,
        icon: CheckCircle,
        status: 'good'
      },
      {
        title: 'Fraud Detection Rate',
        value: '4.2%',
        change: -1.5,
        icon: AlertTriangle,
        status: 'warning'
      },
      {
        title: 'Average Processing Time',
        value: '3.2',
        change: -15.7,
        unit: 'days',
        icon: Clock,
        status: 'good'
      },
      {
        title: 'SLA Compliance',
        value: '94%',
        change: 2.1,
        icon: Target,
        status: 'good'
      },
      {
        title: 'Appeal Rate',
        value: '2.8%',
        change: -0.5,
        icon: Activity,
        status: 'good'
      }
    ]);
  };

  const fetchSLAMetrics = () => {
    setSlaMetrics([
      {
        stage: 'Intake',
        target: '< 6 hours',
        current: '4.2 hours',
        compliance: 98,
        trend: 'stable'
      },
      {
        stage: 'Validation',
        target: '< 24 hours',
        current: '18.5 hours',
        compliance: 95,
        trend: 'up'
      },
      {
        stage: 'Decision',
        target: '< 5 days',
        current: '3.8 days',
        compliance: 92,
        trend: 'up'
      },
      {
        stage: 'Payment',
        target: '< 24 hours',
        current: '16 hours',
        compliance: 96,
        trend: 'stable'
      }
    ]);
  };

  const fetchAIMetrics = () => {
    setAiMetrics({
      ocrAccuracy: {
        id: 98.2,
        deathCert: 96.5,
        overall: 97.3
      },
      docClassification: {
        f1Score: 0.97,
        precision: 0.96,
        recall: 0.98
      },
      fraudDetection: {
        falsePositiveRate: 8.5,
        truePositiveRate: 92.3,
        precision: 0.89
      },
      autoApproval: {
        eligibleClaims: 487,
        approvedClaims: 156,
        hitRate: 32
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    }
    return <span className="w-4 h-4 text-gray-400">—</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Metrics Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                  <metric.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.change)}
                  <span className={`text-xs font-medium ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-1">{metric.title}</p>
              <p className="text-xl font-bold text-gray-900">
                {metric.value}
                {metric.unit && <span className="text-sm font-normal text-gray-600 ml-1">{metric.unit}</span>}
              </p>
            </div>
          ))}
        </div>

        {/* SLA Performance */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">SLA Performance</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {slaMetrics.map((sla, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{sla.stage}</span>
                      <span className="text-xs text-gray-500">Target: {sla.target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          sla.compliance >= 95 ? 'bg-green-500' :
                          sla.compliance >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${sla.compliance}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-gray-900">{sla.compliance}%</p>
                    <p className="text-xs text-gray-600">{sla.current}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">SLA Breach Prediction:</span> 3 claims at risk of breaching SLA in next 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Performance Metrics */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">OCR Accuracy</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ID Documents</span>
                  <span className="text-sm font-semibold text-gray-900">{aiMetrics.ocrAccuracy?.id}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Death Certificates</span>
                  <span className="text-sm font-semibold text-gray-900">{aiMetrics.ocrAccuracy?.deathCert}%</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Overall Accuracy</span>
                    <span className="text-lg font-bold text-green-600">{aiMetrics.ocrAccuracy?.overall}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Document Classification</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">F1 Score</span>
                  <span className="text-sm font-semibold text-gray-900">{aiMetrics.docClassification?.f1Score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Precision</span>
                  <span className="text-sm font-semibold text-gray-900">{aiMetrics.docClassification?.precision}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recall</span>
                  <span className="text-sm font-semibold text-gray-900">{aiMetrics.docClassification?.recall}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Fraud Detection</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">False Positive Rate</span>
                  <span className="text-sm font-semibold text-yellow-600">{aiMetrics.fraudDetection?.falsePositiveRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">True Positive Rate</span>
                  <span className="text-sm font-semibold text-green-600">{aiMetrics.fraudDetection?.truePositiveRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Precision</span>
                  <span className="text-sm font-semibold text-gray-900">{aiMetrics.fraudDetection?.precision}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Auto-Approval Performance</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Eligible Claims</span>
                  <span className="text-sm font-semibold text-gray-900">{aiMetrics.autoApproval?.eligibleClaims}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto-Approved</span>
                  <span className="text-sm font-semibold text-gray-900">{aiMetrics.autoApproval?.approvedClaims}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Hit Rate</span>
                    <span className="text-lg font-bold text-blue-600">{aiMetrics.autoApproval?.hitRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Assurance */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Quality Assurance Metrics</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Appeal Rate</p>
                <p className="text-2xl font-bold text-gray-900">2.8%</p>
                <p className="text-xs text-green-600">↓ 0.5% from last month</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Overturn Rate</p>
                <p className="text-2xl font-bold text-gray-900">1.2%</p>
                <p className="text-xs text-green-600">Within target (<3%)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">4.3/5</p>
                <p className="text-xs text-gray-600">Based on 847 reviews</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">First Call Resolution</p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
                <p className="text-xs text-green-600">↑ 3% improvement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}