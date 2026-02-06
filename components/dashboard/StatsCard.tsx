interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  highlight?: boolean;
  badge?: string;
}

export function StatsCard({ title, value, icon, trend, subtitle, highlight, badge }: StatsCardProps) {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${highlight ? 'ring-2 ring-orange-500' : ''}`}>
      <div className="p-5 relative">
        {badge && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
              {badge}
            </span>
          </div>
        )}
        <div className="flex items-center">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {trend && (
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      trend.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </div>
                )}
              </dd>
              {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
