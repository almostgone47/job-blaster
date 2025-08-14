import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TimelineData {
  month: string;
  offer_count: number;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
  growth_percentage: number | null;
}

interface TimelineChartProps {
  data: TimelineData[];
}

export default function TimelineChart({data}: TimelineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-400">No timeline data available</p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map((item) => ({
    ...item,
    month: new Date(item.month).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
    avgSalary: Math.round(item.avgSalary / 1000), // Convert to k for display
  }));

  // Calculate insights
  const recentGrowth = data[0]?.growth_percentage;
  const isGrowing = recentGrowth && recentGrowth > 5;
  const isDeclining = recentGrowth && recentGrowth < -5;

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
          {data.growth_percentage && (
            <p
              className={`font-medium ${
                data.growth_percentage > 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              Growth: {data.growth_percentage > 0 ? '+' : ''}
              {data.growth_percentage.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        Salary Trends Over Time
      </h2>

      {/* Insights Panel */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400 mb-2">{data.length}</p>
          <p className="text-gray-400">Months Tracked</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400 mb-2">
            {formatSalary(Math.round(data[0]?.avgSalary / 1000))}
          </p>
          <p className="text-gray-400">Latest Average</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p
            className={`text-2xl font-bold mb-2 ${
              isGrowing
                ? 'text-green-400'
                : isDeclining
                ? 'text-red-400'
                : 'text-yellow-400'
            }`}
          >
            {recentGrowth
              ? `${recentGrowth > 0 ? '+' : ''}${recentGrowth.toFixed(1)}%`
              : 'N/A'}
          </p>
          <p className="text-gray-400">Recent Growth</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} />
            <YAxis
              stroke="#9CA3AF"
              tick={{fill: '#9CA3AF'}}
              tickFormatter={formatSalary}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="avgSalary"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{fill: '#3B82F6', strokeWidth: 2, r: 4}}
              activeDot={{r: 6, stroke: '#3B82F6', strokeWidth: 2}}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Actionable Insights */}
      <div className="mt-6 space-y-4">
        {isGrowing && (
          <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
            <p className="text-green-300">
              🚀 <strong>Good moment to negotiate aggressively!</strong> Your
              offers are trending up by {recentGrowth?.toFixed(1)}% over the
              last month.
            </p>
          </div>
        )}

        {isDeclining && (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
            <p className="text-yellow-300">
              ⚠️ <strong>Market may be cooling.</strong> Consider broadening
              your search or adjusting expectations.
            </p>
          </div>
        )}

        {!isGrowing && !isDeclining && recentGrowth && (
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <p className="text-blue-300">
              📊 <strong>Stable market conditions.</strong> Your offers are
              consistent, which is good for predictable negotiations.
            </p>
          </div>
        )}

        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-300 text-sm">
            💡 <strong>Pro tip:</strong> Use this trend data to time your job
            applications and negotiations.
            {isGrowing
              ? ' Apply when trends are up!'
              : ' Focus on companies that pay above your average.'}
          </p>
        </div>
      </div>
    </div>
  );
}
