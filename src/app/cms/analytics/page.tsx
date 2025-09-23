'use client';

import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Clock, FileText, AlertCircle } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');

  const claimVolumeData = [
    { date: 'Mon', claims: 45, approved: 32, denied: 8, pending: 5 },
    { date: 'Tue', claims: 52, approved: 38, denied: 10, pending: 4 },
    { date: 'Wed', claims: 48, approved: 35, denied: 7, pending: 6 },
    { date: 'Thu', claims: 61, approved: 42, denied: 12, pending: 7 },
    { date: 'Fri', claims: 55, approved: 40, denied: 9, pending: 6 },
    { date: 'Sat', claims: 38, approved: 28, denied: 6, pending: 4 },
    { date: 'Sun', claims: 42, approved: 30, denied: 8, pending: 4 }
  ];

  const claimTypeDistribution = [
    { name: 'Life Insurance', value: 45, color: '#3B82F6' },
    { name: 'Critical Illness', value: 30, color: '#10B981' },
    { name: 'Accident', value: 25, color: '#F59E0B' }
  ];

  const processingTimeData = [
    { stage: 'Intake', avgDays: 0.5 },
    { stage: 'Validation', avgDays: 1.2 },
    { stage: 'Review', avgDays: 2.3 },
    { stage: 'Decision', avgDays: 1.0 },
    { stage: 'Payment', avgDays: 0.8 }
  ];

  const fraudDetectionData = [
    { month: 'Jul', detected: 12, prevented: 10, falsePositive: 2 },
    { month: 'Aug', detected: 15, prevented: 13, falsePositive: 3 },
    { month: 'Sep', detected: 18, prevented: 16, falsePositive: 2 },
    { month: 'Oct', detected: 14, prevented: 12, falsePositive: 1 },
    { month: 'Nov', detected: 20, prevented: 18, falsePositive: 3 },
    { month: 'Dec', detected: 16, prevented: 14, falsePositive: 2 }
  ];

  const kpiCards = [
    {
      title: 'Total Claims',
      value: '341',
      change: '+12.3%',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Approval Rate',
      value: '73.2%',
      change: '+5.1%',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Avg Processing Time',
      value: '5.8 days',
      change: '-18.2%',
      icon: Clock,
      color: 'purple'
    },
    {
      title: 'Total Payout',
      value: 'IDR 8.5B',
      change: '+8.7%',
      icon: DollarSign,
      color: 'yellow'
    }
  ];

  const getKPIColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <select
              className="px-4 py-2 border border-gray-300 rounded-md text-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getKPIColor(kpi.color)}`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
                <span className={`text-sm font-semibold ${
                  kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{kpi.title}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Claim Volume Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Claim Volume Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={claimVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="claims" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="denied" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Claim Type Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Claim Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={claimTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {claimTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Processing Time by Stage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Average Processing Time by Stage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processingTimeData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" />
                <Tooltip />
                <Bar dataKey="avgDays" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fraud Detection Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">AI Fraud Detection Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fraudDetectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="detected" fill="#F59E0B" />
                <Bar dataKey="prevented" fill="#10B981" />
                <Bar dataKey="falsePositive" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Performance */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">SLA Performance Summary</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-3">
                <span className="text-2xl font-bold text-green-600">82%</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Within SLA</p>
              <p className="text-xs text-gray-600 mt-1">Target: 80%</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-3">
                <span className="text-2xl font-bold text-yellow-600">13%</span>
              </div>
              <p className="text-sm font-medium text-gray-900">At Risk</p>
              <p className="text-xs text-gray-600 mt-1">Needs attention</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-3">
                <span className="text-2xl font-bold text-red-600">5%</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Breached</p>
              <p className="text-xs text-gray-600 mt-1">Requires review</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}