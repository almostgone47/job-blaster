import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type {RemoteSplitData} from '../../lib/salaryAnalytics';

interface RemoteSplitProps {
  data: RemoteSplitData;
}

export default function RemoteSplit({data}: RemoteSplitProps) {
  if (!data || (data.remote.count === 0 && data.onsite.count === 0)) {
    return (
      <div className="bg-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-400">No remote/onsite data available</p>
      </div>
    );
  }

  // Format data for chart
  const chartData = [
    {
      type: 'Remote',
      avgSalary: Math.round(data.remote.avgSalary / 1000),
      offer_count: data.remote.count,
      isRemote: true,
    },
    {
      type: 'Onsite',
      avgSalary: Math.round(data.onsite.avgSalary / 1000),
      offer_count: data.onsite.count,
      isRemote: false,
    },
  ];

  const formatSalary = (value: number) => `$${value}k`;

  const CustomTooltip = ({active, payload, label}: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-gray-300">
            Average: {formatSalary(data.avgSalary)}
          </p>
          <p className="text-gray-300">Offers: {data.offer_count}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate insights
  const remoteAvg = data.remote.avgSalary;
  const onsiteAvg = data.onsite.avgSalary;
  const difference = Math.abs(remoteAvg - onsiteAvg);
  const remoteHigher = remoteAvg > onsiteAvg;
  const percentageDiff = onsiteAvg > 0 ? (difference / onsiteAvg) * 100 : 0;

  const getRecommendation = () => {
    if (percentageDiff < 5) {
      return 'Remote and onsite roles pay similarly in your market. Choose based on lifestyle preferences.';
    } else if (remoteHigher) {
      return `Remote roles pay ${percentageDiff.toFixed(
        1,
      )}% more on average. Prioritize remote if optimizing for compensation.`;
    } else {
      return `Onsite roles pay ${percentageDiff.toFixed(
        1,
      )}% more on average. Consider hybrid or onsite roles if optimizing for salary.`;
    }
  };

  const getBarColor = (isRemote: boolean) => {
    if (isRemote) return '#10B981'; // Green for remote
    return '#3B82F6'; // Blue for onsite
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        Remote vs Onsite Salary Comparison
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">🏠</span>
            <h3 className="text-lg font-semibold text-white">Remote Roles</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Average:</span>
              <span className="text-green-400 font-bold text-xl">
                {formatSalary(Math.round(data.remote.avgSalary / 1000))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Offers:</span>
              <span className="text-white">{data.remote.count}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">🏢</span>
            <h3 className="text-lg font-semibold text-white">Onsite Roles</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Average:</span>
              <span className="text-blue-400 font-bold text-xl">
                {formatSalary(Math.round(data.onsite.avgSalary / 1000))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Offers:</span>
              <span className="text-white">{data.onsite.count}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="type" stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} />
            <YAxis
              stroke="#9CA3AF"
              tick={{fill: '#9CA3AF'}}
              tickFormatter={formatSalary}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgSalary">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.isRemote)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights & Recommendations */}
      <div className="space-y-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-300 text-center">{getRecommendation()}</p>
        </div>

        {percentageDiff >= 8 && (
          <div
            className={`rounded-lg p-4 ${
              remoteHigher
                ? 'bg-green-900/20 border border-green-600/30'
                : 'bg-blue-900/20 border border-blue-600/30'
            }`}
          >
            <p
              className={`text-center font-medium ${
                remoteHigher ? 'text-green-300' : 'text-blue-300'
              }`}
            >
              💡 <strong>Significant difference detected!</strong>
              {remoteHigher
                ? ' Remote roles offer a substantial salary premium in your market.'
                : ' Onsite roles provide better compensation, but consider commute costs and work-life balance.'}
            </p>
          </div>
        )}

        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-300 text-sm text-center">
            💡 <strong>Pro tip:</strong> Use this data to filter job searches
            and negotiate based on work arrangement preferences.
          </p>
        </div>
      </div>
    </div>
  );
}
