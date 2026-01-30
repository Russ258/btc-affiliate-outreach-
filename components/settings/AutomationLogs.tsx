'use client';

import { useState, useEffect } from 'react';

interface AutomationLog {
  id: string;
  job_name: string;
  status: 'running' | 'success' | 'failed';
  message?: string;
  execution_time_ms?: number;
  created_at: string;
}

export function AutomationLogs() {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url =
        filter === 'all'
          ? '/api/automation/logs?limit=20'
          : `/api/automation/logs?job_name=${filter}&limit=20`;

      const response = await fetch(url);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatJobName = (name: string) => {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Automation Logs</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="all">All Jobs</option>
          <option value="daily-briefing">Daily Briefing</option>
          <option value="check-followups">Check Follow-ups</option>
          <option value="sync-sheets">Sync Sheets</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-sm text-gray-500 py-4">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center text-sm text-gray-500 py-4">
          No automation logs yet
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {formatJobName(log.job_name)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                        log.status
                      )}`}
                    >
                      {log.status}
                    </span>
                    {log.execution_time_ms && (
                      <span className="text-xs text-gray-500">
                        {log.execution_time_ms}ms
                      </span>
                    )}
                  </div>
                  {log.message && (
                    <p className="text-xs text-gray-600 whitespace-pre-wrap">
                      {log.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <button
          onClick={fetchLogs}
          className="text-sm text-orange-600 hover:text-orange-800"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
