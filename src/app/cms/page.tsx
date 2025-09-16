'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, AlertTriangle, User, Filter, Brain, BarChart3, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

interface ClaimRow {
  id: string;
  type: string;
  channel: string;
  slaClock: string;
  slaStatus: 'Green' | 'Amber' | 'Red';
  redFlags: string[];
  assignee: string;
  createdAt: string;
}

export default function CMSIntakePage() {
  const router = useRouter();
  const [filter, setFilter] = useState({
    type: 'all',
    slaRisk: 'all'
  });

  const mockClaims: ClaimRow[] = [
    {
      id: 'CLM-2025-000123',
      type: 'Life',
      channel: 'WhatsApp',
      slaClock: '2 days',
      slaStatus: 'Green',
      redFlags: [],
      assignee: 'John Doe',
      createdAt: '2025-09-10'
    },
    {
      id: 'CLM-2025-000124',
      type: 'CI',
      channel: 'Web',
      slaClock: '4 days',
      slaStatus: 'Amber',
      redFlags: ['Early claim (<90 days)'],
      assignee: 'Jane Smith',
      createdAt: '2025-09-08'
    },
    {
      id: 'CLM-2025-000125',
      type: 'Accident',
      channel: 'App',
      slaClock: '6 days',
      slaStatus: 'Red',
      redFlags: ['High amount', 'Multiple claims'],
      assignee: 'Unassigned',
      createdAt: '2025-09-06'
    }
  ];

  const filteredClaims = mockClaims.filter(claim => {
    if (filter.type !== 'all' && claim.type !== filter.type) return false;
    if (filter.slaRisk !== 'all' && claim.slaStatus !== filter.slaRisk) return false;
    return true;
  });

  const getSLABadgeColor = (status: string) => {
    switch(status) {
      case 'Green': return 'bg-green-100 text-green-800';
      case 'Amber': return 'bg-yellow-100 text-yellow-800';
      case 'Red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">CMS - Intake Queue</h1>
            <div className="mt-4 flex space-x-4">
              <Link href="/cms/ai-insights" className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Brain className="w-4 h-4 mr-2" />
                AI Insights
              </Link>
              <Link href="/cms/analytics" className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Link>
              <Link href="/cms/batch-processing" className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Batch Processing
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  value={filter.type}
                  onChange={(e) => setFilter({...filter, type: e.target.value})}
                >
                  <option value="all">All Types</option>
                  <option value="Life">Life</option>
                  <option value="CI">Critical Illness</option>
                  <option value="Accident">Accident</option>
                </select>
                <select
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  value={filter.slaRisk}
                  onChange={(e) => setFilter({...filter, slaRisk: e.target.value})}
                >
                  <option value="all">All SLA Status</option>
                  <option value="Green">Green</option>
                  <option value="Amber">Amber</option>
                  <option value="Red">Red</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                {filteredClaims.length} claims
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SLA Clock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Red Flags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{claim.id}</div>
                      <div className="text-xs text-gray-500">{claim.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{claim.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{claim.channel}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-900">{claim.slaClock}</span>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getSLABadgeColor(claim.slaStatus)}`}>
                        {claim.slaStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {claim.redFlags.length > 0 ? (
                        <div className="flex items-start">
                          <AlertTriangle className="w-4 h-4 text-red-500 mr-1 mt-0.5" />
                          <div className="text-xs text-red-600">
                            {claim.redFlags.map((flag, idx) => (
                              <div key={idx}>{flag}</div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-900">{claim.assignee}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/cms/claim/${claim.id}`)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}