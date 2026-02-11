'use client';

import { useState, useEffect } from 'react';

interface TierStat {
  tier: string;
  total: number;
  contacted: number;
  accepted: number;
  conversionRate: number;
}

export function FollowerTierAnalytics() {
  const [tiers, setTiers] = useState<TierStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTierStats();
  }, []);

  const fetchTierStats = async () => {
    try {
      const response = await fetch('/api/analytics/follower-tiers');
      const data = await response.json();
      setTiers(data.tiers || []);
    } catch (error) {
      console.error('Failed to fetch tier analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Find best performing tier
  const bestTier = tiers.reduce((best, tier) => {
    if (tier.contacted < 3) return best; // Need at least 3 contacted for meaningful data
    return tier.conversionRate > (best?.conversionRate || 0) ? tier : best;
  }, null as TierStat | null);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Success Rate by Follower Tier</h2>
        {bestTier && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            🏆 Best: {bestTier.tier}
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading analytics...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Follower Tier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacted
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accepted
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tiers.map((tier) => (
                <tr key={tier.tier} className={tier.tier === bestTier?.tier ? 'bg-green-50' : ''}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tier.tier}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tier.total}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tier.contacted}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tier.accepted}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-semibold text-gray-900 mr-2">
                        {tier.conversionRate}%
                      </div>
                      {tier.contacted >= 3 && (
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min(tier.conversionRate, 100)}%` }}
                          />
                        </div>
                      )}
                      {tier.contacted < 3 && (
                        <span className="text-xs text-gray-400">
                          (Need more data)
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <strong>Tip:</strong> Focus your outreach on tiers with the highest conversion rates
      </div>
    </div>
  );
}
