'use client';

import { useState, useEffect } from 'react';

interface PipelineStage {
  name: string;
  count: number;
  color: string;
}

export function ContactPipeline() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();

      const statusCounts = data.stats?.statusCounts || {};

      const pipelineStages: PipelineStage[] = [
        { name: 'New', count: statusCounts.new || 0, color: 'bg-blue-500' },
        { name: 'Contacted', count: statusCounts.contacted || 0, color: 'bg-yellow-500' },
        { name: 'Responded', count: statusCounts.responded || 0, color: 'bg-purple-500' },
        { name: 'Interested', count: statusCounts.interested || 0, color: 'bg-green-500' },
        { name: 'Accepted', count: statusCounts.accepted || 0, color: 'bg-teal-500' },
      ];

      setStages(pipelineStages);
    } catch (error) {
      console.error('Failed to fetch pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Pipeline</h2>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading pipeline...</div>
      ) : (
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const width = (stage.count / maxCount) * 100;
            const prevCount = index > 0 ? stages[index - 1].count : stage.count;
            const conversionRate = prevCount > 0 ? Math.round((stage.count / prevCount) * 100) : 100;

            return (
              <div key={stage.name} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                    <span className="text-xs text-gray-500">({stage.count})</span>
                  </div>
                  {index > 0 && (
                    <span className="text-xs text-gray-500">
                      {conversionRate}% conversion
                    </span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className={`${stage.color} h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-semibold transition-all duration-500`}
                    style={{ width: `${Math.max(width, 5)}%` }}
                  >
                    {stage.count > 0 && stage.count}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total Contacts:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {stages.reduce((sum, s) => sum + s.count, 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Overall Conversion:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {stages[0].count > 0
                    ? Math.round((stages[4].count / stages[0].count) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
