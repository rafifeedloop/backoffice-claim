'use client';

import { useState, useEffect } from 'react';
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
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchClaims();
    fetchStats();
  }, [filter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.type !== 'all') params.append('claimType', filter.type);
      if (filter.slaRisk !== 'all') params.append('slaStatus', filter.slaRisk);

      const response = await fetch(`/api/cms/claims?${params}`);
      const data = await response.json();

      const formattedClaims = data.claims.map((claim: any) => ({
        id: claim.id,
        type: claim.claimType,
        channel: claim.channel,
        slaClock: calculateSLAClock(claim.slaDeadline),
        slaStatus: claim.slaStatus,
        redFlags: getRedFlags(claim),
        assignee: claim.assignedTo || 'Unassigned',
        createdAt: new Date(claim.submittedAt).toLocaleDateString()
      }));

      setClaims(formattedClaims);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/cms/claims/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const calculateSLAClock = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : 'Overdue';
  };

  const getRedFlags = (claim: any) => {
    const flags = [];
    if (claim.fraudScore && claim.fraudScore > 30) flags.push('High fraud risk');
    if (claim.riskLevel === 'High') flags.push('High risk claim');
    if (claim.slaStatus === 'Red') flags.push('SLA at risk');
    return flags;
  };

  const filteredClaims = claims.filter(claim => {
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
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Total Claims</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-green-600">{stats.weeklyGrowth}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Pending Review</div>
              <div className="text-2xl font-bold text-gray-900">{stats.pendingClaims}</div>
              <div className="text-xs text-gray-500">Requires action</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">SLA Compliance</div>
              <div className="text-2xl font-bold text-gray-900">{stats.slaCompliance}%</div>
              <div className="text-xs text-gray-500">This month</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Avg Processing</div>
              <div className="text-2xl font-bold text-gray-900">{stats.averageProcessingTime}</div>
              <div className="text-xs text-gray-500">Per claim</div>
            </div>
          </div>
        )}
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">Loading claims...</div>
                    </td>
                  </tr>
                ) : filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No claims found</div>
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((claim) => (
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
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}